import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables for Supabase and OpenAI
dotenv.config({ path: '.env.local' });

import {
  createSarvamJob,
  getUploadUrls,
  uploadToPresignedUrl,
  startSarvamJob,
  getJobStatus,
  getDownloadUrls,
  downloadTranscript,
  isJobComplete,
  isJobFailed,
} from './lib/voice/sarvamBatch';

import { structureClinicalNotes } from './lib/voice/structureClinicalNotes';

const textToSpeak = process.argv[2] || "Patient presents with headache. BP 120/80. Prescribe Dolo 650 SOS.";
const department = process.argv[3] || "General";
const audioFile = path.resolve(process.cwd(), 'test-dictation.wav');

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`\n[1] Generating audio for: "${textToSpeak}"`);
  // Generate 16kHz 16-bit PCM WAV
  execSync(`say -o "${audioFile}" --data-format=LEI16@16000 "${textToSpeak}"`);
  
  const audioBuffer = fs.readFileSync(audioFile);
  const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
  const fileName = 'test-dictation.wav';

  console.log(`[2] Uploading to Sarvam Batch API...`);
  const sarvamJobId = await createSarvamJob();
  const uploadRes = await getUploadUrls(sarvamJobId, [fileName]);
  const uploadUrl = uploadRes.upload_urls[fileName]?.file_url;
  
  if (!uploadUrl) throw new Error("Failed to get upload URL");
  
  await uploadToPresignedUrl(uploadUrl, audioBlob, fileName);
  await startSarvamJob(sarvamJobId);
  
  console.log(`[3] Polling Sarvam for transcription (Job ID: ${sarvamJobId})...`);
  
  let transcript = '';
  while (true) {
    const status = await getJobStatus(sarvamJobId);
    if (isJobFailed(status.job_state)) {
      throw new Error(`Sarvam job failed: ${status.error_message}`);
    }
    if (isJobComplete(status.job_state)) {
      const outputFiles: string[] = [];
      for (const detail of status.job_details || []) {
        for (const output of detail.outputs || []) {
          if (output.file_name) outputFiles.push(output.file_name);
        }
      }
      
      let downloadRes;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          downloadRes = await getDownloadUrls(sarvamJobId, outputFiles);
          break;
        } catch (e: any) {
          if (e.statusCode === 400 && e.message.includes("COMPLETED")) {
            await sleep(2000);
          } else {
            throw e;
          }
        }
      }
      if (!downloadRes) throw new Error("Failed to get download URLs after retries due to Sarvam consistency bug.");

      const transcripts: string[] = [];
      for (const f of outputFiles) {
        const dUrl = downloadRes.download_urls[f]?.file_url;
        if (dUrl) {
          const tFile = await downloadTranscript(dUrl);
          if (tFile.transcript) transcripts.push(tFile.transcript);
        }
      }
      transcript = transcripts.join('\n').trim();
      break;
    }
    await sleep(2000);
    process.stdout.write('.');
  }
  
  console.log(`\n\n[4] Transcription complete:\n"${transcript}"\n`);
  
  console.log(`[5] Structuring Clinical Notes (Department: ${department})...`);
  const structured = await structureClinicalNotes(transcript, department);

  console.log(`[6] Matching Medicines with local database...`);
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  if (structured.prescriptions && structured.prescriptions.length > 0) {
    const searchQueries = structured.prescriptions
      .filter(p => p.drug_name && p.drug_name !== 'NOT_SPECIFIED')
      .map(p => {
        let term = p.drug_name;
        if (p.dosage && p.dosage !== 'NOT_SPECIFIED') {
          term += ` ${p.dosage}`;
        }
        return { original_name: p.drug_name, search_term: term };
      });

    if (searchQueries.length > 0) {
      const terms = searchQueries.map(q => q.search_term);
      const { data: matches } = await supabaseAdmin.rpc('match_invoice_items_bulk', { search_terms: terms });
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
    }
  }
  
  console.log('\n[RESULT] Structured Output:');
  console.log(JSON.stringify(structured, null, 2));
  
  // Cleanup
  if (fs.existsSync(audioFile)) {
    fs.unlinkSync(audioFile);
  }
}

run().catch(err => {
  console.error("\nPipeline failed:", err);
});
