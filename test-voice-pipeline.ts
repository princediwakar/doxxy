import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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
  if (typeof Blob === 'undefined') {
    throw new Error('Blob is not available. Use Node.js 18+ (≥18.0.0) or a Blob polyfill.');
  }
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
          if (e.statusCode === 400 && e.responseBody?.includes("COMPLETED")) {
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

  console.log(`[6] Validating structured output shape...`);
  const { output } = structured;
  const issues: string[] = [];

  if (typeof output.symptoms !== 'string') issues.push('symptoms: expected string');
  if (typeof output.diagnosis !== 'string') issues.push('diagnosis: expected string');
  if (typeof output.advice !== 'string') issues.push('advice: expected string');
  if (!Array.isArray(output.prescriptions)) {
    issues.push('prescriptions: expected array');
  } else {
    output.prescriptions.forEach((p, i) => {
      if (typeof p.drug_name !== 'string') issues.push(`prescriptions[${i}].drug_name: expected string`);
      if (typeof p.dosage !== 'string') issues.push(`prescriptions[${i}].dosage: expected string`);
      if (typeof p.frequency !== 'string') issues.push(`prescriptions[${i}].frequency: expected string`);
      if (typeof p.duration !== 'string') issues.push(`prescriptions[${i}].duration: expected string`);
      if (typeof p.route !== 'string') issues.push(`prescriptions[${i}].route: expected string`);
      if (typeof p.instructions !== 'string') issues.push(`prescriptions[${i}].instructions: expected string`);
    });
  }
  if (output.discontinued_medications !== undefined && !Array.isArray(output.discontinued_medications)) {
    issues.push('discontinued_medications: expected array if present');
  }
  if (output.rawFields !== undefined && typeof output.rawFields !== 'object') {
    issues.push('rawFields: expected object if present');
  }

  if (issues.length > 0) {
    console.error('Schema validation FAILED:');
    issues.forEach(i => console.error(`  - ${i}`));
  } else {
    console.log('Schema validation PASSED.');
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
