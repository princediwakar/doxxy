// app/api/voice/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { structureClinicalNotes, computeFieldConfidence } from '@/lib/voice/structureClinicalNotes';
import type { AIStructuredOutput } from '@/types/voice';
import {
  getJobStatus,
  getDownloadUrls,
  downloadTranscript,
  isJobComplete,
  isJobFailed,
  isJobRunning,
} from '@/lib/voice/sarvamBatch';
import type { Json } from '@/integrations/supabase/types';

export const maxDuration = 60;

const STRUCTURING_STALE_MS = 5 * 60 * 1000; // 5 minutes
const TRANSCRIBING_STALE_MS = 10 * 60 * 1000; // 10 minutes

function isStale(createdAt: string, thresholdMs: number): boolean {
  const age = Date.now() - new Date(createdAt).getTime();
  return age > thresholdMs;
}

async function enrichWithMedicineIds(structured: AIStructuredOutput): Promise<AIStructuredOutput> {
  if (!structured.prescriptions || structured.prescriptions.length === 0) return structured;

  const searchQueries = structured.prescriptions
    .filter(p => p.drug_name && p.drug_name !== 'NOT_SPECIFIED')
    .map(p => {
      let term = p.drug_name;
      if (p.dosage && p.dosage !== 'NOT_SPECIFIED') {
        term += ` ${p.dosage}`;
      }
      return { original_name: p.drug_name, search_term: term };
    });

  if (searchQueries.length === 0) return structured;

  try {
    const terms = searchQueries.map(q => q.search_term);
    const { data: matches, error } = await supabaseAdmin.rpc('match_invoice_items_bulk', { search_terms: terms });
    if (error) {
      logger.error('Error in bulk medicine match:', error);
      return structured;
    }

    if (Array.isArray(matches)) {
      const matchMap = new Map(matches.map((m: any) => [m.original_search_term, m.matched_id]));
      
      // Fallback for unmatched
      for (const term of terms) {
        if (!matchMap.get(term)) {
          const { data: singleMatch } = await supabaseAdmin.rpc('match_invoice_item_single', { search_term: term });
          if (singleMatch && singleMatch[0] && singleMatch[0].matched_id) {
            matchMap.set(term, singleMatch[0].matched_id);
          }
        }
      }

      structured.prescriptions = structured.prescriptions.map(p => {
        const query = searchQueries.find(q => q.original_name === p.drug_name);
        return {
          ...p,
          medicine_id: query ? (matchMap.get(query.search_term) || null) : null,
        };
      });
    }
  } catch (err) {
    logger.error('Failed to match medicines:', err);
  }

  return structured;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const { data: job, error: fetchError } = await supabaseAdmin
      .from('transcription_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Terminal: completed
    if (job.status === 'completed') {
      return NextResponse.json({
        status: 'done',
        transcript: job.transcript,
        structured: job.structured_data,
        fieldConfidence: job.structured_data
          ? computeFieldConfidence(job.structured_data as unknown as AIStructuredOutput)
          : [],
      });
    }

    // Terminal: failed
    if (job.status === 'failed') {
      return NextResponse.json({ status: 'error', error: 'Transcription failed' });
    }

    // Not yet submitted to Sarvam
    if (job.status === 'pending') {
      if (isStale(job.created_at, TRANSCRIBING_STALE_MS)) {
        logger.error('Job stuck in pending for too long:', job.id);
        await supabaseAdmin
          .from('transcription_jobs')
          .update({ status: 'failed' })
          .eq('id', job.id);
        return NextResponse.json({ status: 'error', error: 'Transcription timed out' });
      }
      return NextResponse.json({ status: 'processing' });
    }

    // Structuring in progress (may be a retry from a crashed previous attempt)
    if (job.status === 'structuring') {
      if (!job.transcript) {
        logger.error('Job in structuring state but no transcript saved:', job.id);
        await supabaseAdmin
          .from('transcription_jobs')
          .update({ status: 'failed' })
          .eq('id', job.id);
        return NextResponse.json({ status: 'error', error: 'Transcription data missing' });
      }

      // Only re-run if stale (previous attempt likely crashed)
      if (!isStale(job.created_at, STRUCTURING_STALE_MS)) {
        return NextResponse.json({ status: 'processing' });
      }

      logger.warn('Retrying stalled structuring for job:', job.id);

      try {
        let structured = await structureClinicalNotes(job.transcript, job.department);
        structured = await enrichWithMedicineIds(structured);

        await supabaseAdmin
          .from('transcription_jobs')
          .update({
            status: 'completed',
            structured_data: structured as unknown as Json,
          })
          .eq('id', job.id);

        await supabaseAdmin.storage
          .from('voice-recordings')
          .remove([job.storage_path]);

        return NextResponse.json({
          status: 'done',
          transcript: job.transcript,
          structured,
          fieldConfidence: computeFieldConfidence(structured),
        });
      } catch (structuringError) {
        logger.error('Structuring retry failed for job:', job.id, structuringError);
        await supabaseAdmin
          .from('transcription_jobs')
          .update({ status: 'failed' })
          .eq('id', job.id);
        return NextResponse.json({ status: 'error', error: 'Failed to structure clinical notes' });
      }
    }

    // Transcribing — check Sarvam batch status
    if (job.status === 'transcribing' && job.sarvam_task_id) {
      try {
        const sarvamStatus = await getJobStatus(job.sarvam_task_id);

        // Still running
        if (isJobRunning(sarvamStatus.job_state)) {
          return NextResponse.json({ status: 'processing' });
        }

        // Sarvam job failed
        if (isJobFailed(sarvamStatus.job_state)) {
          const sarvaErrorDetail = sarvamStatus.error_message || 'No details from Sarvam';
          logger.error(
            'Sarvam job failed:',
            job.sarvam_task_id,
            sarvaErrorDetail,
          );

          // If stale, try re-submitting once
          if (isStale(job.created_at, TRANSCRIBING_STALE_MS)) {
            logger.warn('Sarvam job failed and job is stale, marking as failed:', job.id);
          }

          await supabaseAdmin
            .from('transcription_jobs')
            .update({ status: 'failed' })
            .eq('id', job.id);

          return NextResponse.json({ status: 'error', error: `Speech-to-text processing failed: ${sarvaErrorDetail}` });
        }

        // Sarvam job completed — download transcript
        if (isJobComplete(sarvamStatus.job_state)) {
          // Collect output file names from job details
          const outputFiles: string[] = [];
          for (const detail of sarvamStatus.job_details || []) {
            for (const output of detail.outputs || []) {
              if (output.file_name) {
                outputFiles.push(output.file_name);
              }
            }
          }

          if (outputFiles.length === 0) {
            logger.error('No output files in completed Sarvam job:', job.sarvam_task_id);
            await supabaseAdmin
              .from('transcription_jobs')
              .update({ status: 'failed' })
              .eq('id', job.id);
            return NextResponse.json({ status: 'error', error: 'No transcription output' });
          }

          // Get download URLs and fetch transcripts
          const downloadRes = await getDownloadUrls(job.sarvam_task_id, outputFiles);
          const transcripts: string[] = [];

          for (const fileName of outputFiles) {
            const downloadUrl = downloadRes.download_urls[fileName]?.file_url;
            if (!downloadUrl) {
              logger.warn('No download URL for output file:', fileName);
              continue;
            }
            const transcriptFile = await downloadTranscript(downloadUrl);
            if (transcriptFile.transcript) {
              transcripts.push(transcriptFile.transcript);
            }
          }

          const transcript = transcripts.join('\n').trim();

          if (!transcript) {
            logger.warn('Empty transcript for job:', job.id);
            await supabaseAdmin
              .from('transcription_jobs')
              .update({ status: 'completed', transcript: '', structured_data: null })
              .eq('id', job.id);

            await supabaseAdmin.storage
              .from('voice-recordings')
              .remove([job.storage_path]);

            return NextResponse.json({ status: 'done', transcript: '', structured: null });
          }

          // Guard: mark as structuring before LLM call
          await supabaseAdmin
            .from('transcription_jobs')
            .update({ status: 'structuring', transcript })
            .eq('id', job.id);

          // Structure with OpenAI
          let structured;
          try {
            structured = await structureClinicalNotes(transcript, job.department);
            structured = await enrichWithMedicineIds(structured);
          } catch (structuringError) {
            logger.error('Structuring failed for job:', job.id, structuringError);
            await supabaseAdmin
              .from('transcription_jobs')
              .update({ status: 'failed' })
              .eq('id', job.id);
            return NextResponse.json({ status: 'error', error: 'Failed to structure clinical notes' });
          }

          // Save and clean up
          await supabaseAdmin
            .from('transcription_jobs')
            .update({
              status: 'completed',
              structured_data: structured as unknown as Json,
            })
            .eq('id', job.id);

          await supabaseAdmin.storage
            .from('voice-recordings')
            .remove([job.storage_path]);

          return NextResponse.json({
            status: 'done',
            transcript,
            structured,
            fieldConfidence: computeFieldConfidence(structured),
          });
        }

        // Unknown state — keep waiting
        return NextResponse.json({ status: 'processing' });
      } catch (sarvamError: unknown) {
        const msg = sarvamError instanceof Error ? sarvamError.message : 'Unknown error';
        logger.error('Sarvam status check failed:', msg);

        // Don't fail the job on transient errors — keep polling
        return NextResponse.json({ status: 'processing' });
      }
    }

    // Default: still processing
    return NextResponse.json({ status: 'processing' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Voice status route error:', msg);
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 });
  }
}
