// app/api/voice/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  createSarvamJob,
  getUploadUrls,
  uploadToPresignedUrl,
  startSarvamJob,
  SarvamBatchError,
} from '@/lib/voice/sarvamBatch';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const filePath: string = body.filePath;
    const department: string = body.department || 'General';

    if (!filePath) {
      return NextResponse.json({ error: 'filePath is required' }, { status: 400 });
    }

    // Idempotency: if a completed job already exists for this storage path, return it
    const { data: existing } = await supabaseAdmin
      .from('transcription_jobs')
      .select('id, status, transcript, structured_data')
      .eq('storage_path', filePath)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing && existing.status === 'completed') {
      return NextResponse.json({
        jobId: existing.id,
        transcript: existing.transcript,
        structured: existing.structured_data,
      });
    }

    // Insert our job row
    const { data: job, error: insertError } = await supabaseAdmin
      .from('transcription_jobs')
      .insert({
        user_id: user.id,
        storage_path: filePath,
        department,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError || !job) {
      logger.error('Failed to create transcription job:', insertError);
      return NextResponse.json({ error: 'Failed to create transcription job' }, { status: 500 });
    }

    // Download audio from Supabase Storage
    const { data: audioData, error: downloadError } = await supabaseAdmin.storage
      .from('voice-recordings')
      .download(filePath);

    if (downloadError || !audioData) {
      logger.error('Failed to download audio from storage:', downloadError);
      await supabaseAdmin.from('transcription_jobs').update({ status: 'failed' }).eq('id', job.id);
      return NextResponse.json({ error: 'Failed to retrieve audio file' }, { status: 500 });
    }

    const audioExt = filePath.split('.').pop() || 'webm';

    const mimeType = audioExt === 'webm' ? 'audio/webm'
      : audioExt === 'mp4' ? 'audio/mp4'
        : audioExt === 'mpeg' ? 'audio/mpeg'
          : 'audio/ogg';
    const audioBlob = new Blob([await audioData.arrayBuffer()], { type: mimeType });
    const audioFileName = `audio.${audioExt}`;

    // Submit to Sarvam Batch API
    let sarvamJobId: string;
    try {
      sarvamJobId = await createSarvamJob();

      const uploadRes = await getUploadUrls(sarvamJobId, [audioFileName]);
      const uploadUrl = uploadRes.upload_urls[audioFileName]?.file_url;
      if (!uploadUrl) {
        throw new SarvamBatchError(`No upload URL for file: ${audioFileName}`);
      }
      logger.log(`[Sarvam] Uploading file: ${audioFileName}, size: ${audioBlob.size} bytes, type: ${audioBlob.type}, uploadUrl host: ${new URL(uploadUrl).host}`);
      await uploadToPresignedUrl(uploadUrl, audioBlob, audioFileName);
      await startSarvamJob(sarvamJobId);
    } catch (sarvamError: unknown) {
      const msg = sarvamError instanceof Error ? sarvamError.message : 'Unknown error';
      logger.error('Sarvam batch submission failed:', msg);

      await supabaseAdmin
        .from('transcription_jobs')
        .update({ status: 'failed', transcript: msg })
        .eq('id', job.id);

      if (sarvamError instanceof SarvamBatchError && sarvamError.statusCode === 403) {
        return NextResponse.json({ error: 'Speech-to-text authentication failed' }, { status: 502 });
      }
      return NextResponse.json({ error: 'Speech-to-text service unavailable' }, { status: 502 });
    }

    // Update job with Sarvam task ID and move to transcribing
    await supabaseAdmin
      .from('transcription_jobs')
      .update({ sarvam_task_id: sarvamJobId, status: 'transcribing' })
      .eq('id', job.id);

    return NextResponse.json({ jobId: job.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Voice transcribe route error:', msg);
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 });
  }
}
