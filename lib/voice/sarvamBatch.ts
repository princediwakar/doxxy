// lib/voice/sarvamBatch.ts

import { logger } from '@/lib/logger';

const SARVAM_BASE = 'https://api.sarvam.ai/speech-to-text/job/v1';
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000;

export class SarvamBatchError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseBody?: string,
  ) {
    super(message);
    this.name = 'SarvamBatchError';
  }
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  label: string,
  retries = MAX_RETRIES,
  baseDelay = RETRY_BASE_DELAY,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      // Don't retry 400 (bad request) — the payload is invalid, EXCEPT for known Sarvam consistency bugs
      if (error instanceof SarvamBatchError && error.statusCode === 400) {
        if (!error.responseBody?.includes('COMPLETED')) {
          break;
        }
      }
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn(`[Sarvam] ${label} attempt ${attempt + 1} failed, retrying in ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

async function sarvamFetch(
  url: string,
  options: RequestInit,
  label: string,
): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text();
    logger.error(`[Sarvam] ${label} failed: ${res.status} - ${body}`);
    throw new SarvamBatchError(
      `Sarvam ${label} failed: ${res.status}`,
      res.status,
      body,
    );
  }
  return res;
}

function getKey(): string {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new Error('SARVAM_API_KEY not configured');
  return key;
}

/** Step 1: Create a new batch job. Returns the Sarvam job_id. */
export async function createSarvamJob(): Promise<string> {
  return retryWithBackoff(async () => {
    const res = await sarvamFetch(
      SARVAM_BASE,
      {
        method: 'POST',
        headers: {
          'api-subscription-key': getKey(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_parameters: {
            model: 'saaras:v3',
            language_code: 'en-IN',
            mode: 'transcribe',
          },
        }),
      },
      'create job',
    );

    const data = await res.json();
    const jobId: string | undefined = data.job_id;
    if (!jobId) {
      throw new SarvamBatchError(`Create job returned no job_id: ${JSON.stringify(data)}`);
    }
    logger.log(`[Sarvam] Created batch job: ${jobId}`);
    return jobId;
  }, 'create job');
}

interface UploadUrlDetail {
  file_url: string;
  file_metadata?: unknown;
}

interface UploadUrlsResponse {
  job_id: string;
  job_state: string;
  upload_urls: Record<string, UploadUrlDetail>;
}

/** Step 2: Request presigned upload URLs for the given file names. */
export async function getUploadUrls(
  sarvamJobId: string,
  fileNames: string[],
): Promise<UploadUrlsResponse> {
  return retryWithBackoff(async () => {
    const res = await sarvamFetch(
      `${SARVAM_BASE}/upload-files`,
      {
        method: 'POST',
        headers: {
          'api-subscription-key': getKey(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: sarvamJobId, files: fileNames }),
      },
      'get upload URLs',
    );

    const data: UploadUrlsResponse = await res.json();
    const urls = Object.keys(data.upload_urls || {});
    if (urls.length === 0) {
      throw new SarvamBatchError(`No upload URLs returned for job ${sarvamJobId}`);
    }
    logger.log(`[Sarvam] Got ${urls.length} upload URL(s) for job ${sarvamJobId}`);
    return data;
  }, 'get upload URLs');
}



/** Step 3: Upload audio blob to a presigned URL. */
export async function uploadToPresignedUrl(
  url: string,
  audioBlob: Blob,
  fileName: string,
): Promise<void> {
  return retryWithBackoff(async () => {
    const isAzure = new URL(url).host.includes('.blob.core.windows.net');

    const headers: Record<string, string> = {};

    if (isAzure) {
      // Azure Blob Storage SAS URLs require this header on every PUT — no exceptions.
      // Without it you get: MissingRequiredHeader / x-ms-blob-type → 400.
      headers['x-ms-blob-type'] = 'BlockBlob';
    } else {
      // For S3-compatible presigned URLs: only send Content-Type if it was
      // included in the signature (X-Amz-SignedHeaders), otherwise omit it.
      try {
        const parsedUrl = new URL(url);
        const signedHeadersParam = parsedUrl.searchParams.get('X-Amz-SignedHeaders');
        if (signedHeadersParam?.toLowerCase().split(';').includes('content-type')) {
          headers['Content-Type'] = (audioBlob.type || 'application/octet-stream').split(';')[0];
        }
      } catch {
        // ignore parse errors
      }
    }

    logger.log(`[Sarvam] Uploading ${fileName} to ${isAzure ? 'Azure' : 'S3'}, headers: ${JSON.stringify(Object.keys(headers))}`);

    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: audioBlob,
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error(`[Sarvam] Upload failed ${res.status}: ${body}`);
      throw new SarvamBatchError(
        `Upload to presigned URL failed: ${res.status}`,
        res.status,
        body,
      );
    }

    logger.log(`[Sarvam] Uploaded ${fileName} successfully`);
  }, 'upload to presigned URL');
}


/** Step 4: Start processing the batch job. */
export async function startSarvamJob(sarvamJobId: string): Promise<void> {
  return retryWithBackoff(async () => {
    await sarvamFetch(
      `${SARVAM_BASE}/${sarvamJobId}/start`,
      {
        method: 'POST',
        headers: {
          'api-subscription-key': getKey(),
          'Content-Type': 'application/json',
        },
        body: '{}',
      },
      'start job',
    );
    logger.log(`[Sarvam] Started job: ${sarvamJobId}`);
  }, 'start job');
}

interface JobDetailFile {
  file_name: string;
  file_id: string;
}

interface JobDetail {
  inputs: JobDetailFile[];
  outputs: JobDetailFile[];
  state: string;
  error_message: string | null;
  exception_name: string | null;
}

export interface SarvamJobStatus {
  job_id: string;
  job_state: string;
  created_at: string;
  updated_at: string;
  total_files: number;
  successful_files_count: number;
  failed_files_count: number;
  error_message: string;
  job_details: JobDetail[];
}

/** Step 5: Poll job status. */
export async function getJobStatus(sarvamJobId: string): Promise<SarvamJobStatus> {
  return retryWithBackoff(async () => {
    const res = await sarvamFetch(
      `${SARVAM_BASE}/${sarvamJobId}/status`,
      {
        method: 'GET',
        headers: { 'api-subscription-key': getKey() },
      },
      'get status',
    );

    const data: SarvamJobStatus = await res.json();
    return data;
  }, 'get status');
}

interface DownloadUrlDetail {
  file_url: string;
  file_metadata?: unknown;
}

interface DownloadUrlsResponse {
  job_id: string;
  job_state: string;
  download_urls: Record<string, DownloadUrlDetail>;
}

/** Step 6: Request presigned download URLs for output files. */
export async function getDownloadUrls(
  sarvamJobId: string,
  fileNames: string[],
): Promise<DownloadUrlsResponse> {
  return retryWithBackoff(async () => {
    const res = await sarvamFetch(
      `${SARVAM_BASE}/download-files`,
      {
        method: 'POST',
        headers: {
          'api-subscription-key': getKey(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: sarvamJobId, files: fileNames }),
      },
      'get download URLs',
    );

    const data: DownloadUrlsResponse = await res.json();
    const urls = Object.keys(data.download_urls || {});
    if (urls.length === 0) {
      throw new SarvamBatchError(`No download URLs returned for job ${sarvamJobId}`);
    }
    return data;
  }, 'get download URLs');
}

interface SarvamTranscriptFile {
  request_id: string;
  transcript: string;
  language_code: string;
  diarized_transcript?: {
    entries: Array<{
      transcript: string;
      start_time_seconds: number;
      end_time_seconds: number;
      speaker_id: string;
    }>;
  };
}

/** Step 7: Download and parse the transcript from a presigned URL. */
export async function downloadTranscript(url: string): Promise<SarvamTranscriptFile> {
  return retryWithBackoff(async () => {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text();
      throw new SarvamBatchError(
        `Download transcript failed: ${res.status}`,
        res.status,
        body,
      );
    }
    const data: SarvamTranscriptFile = await res.json();
    if (!data.transcript) {
      logger.warn('[Sarvam] Transcript file has empty transcript field');
    }
    return data;
  }, 'download transcript');
}

/** Check if a job state indicates terminal completion. */
export function isJobComplete(state: string): boolean {
  return state.toLowerCase() === 'completed';
}

/** Check if a job state indicates terminal failure. */
export function isJobFailed(state: string): boolean {
  return state.toLowerCase() === 'failed';
}

/** Check if a job state indicates the job is still in progress. */
export function isJobRunning(state: string): boolean {
  const s = state.toLowerCase();
  return s === 'accepted' || s === 'pending' || s === 'running';
}