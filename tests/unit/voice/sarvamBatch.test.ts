import {
  SarvamBatchError,
  isJobComplete,
  isJobFailed,
  isJobRunning,
  createSarvamJob,
  getUploadUrls,
  getJobStatus,
  getDownloadUrls,
  downloadTranscript,
} from '@/lib/voice/sarvamBatch';

const TEST_JOB_ID = 'job-abc-123';

describe('state helpers', () => {
  it('isJobComplete returns true only for "completed" (case-insensitive)', () => {
    expect(isJobComplete('completed')).toBe(true);
    expect(isJobComplete('COMPLETED')).toBe(true);
    expect(isJobComplete('Completed')).toBe(true);
    expect(isJobComplete('running')).toBe(false);
    expect(isJobComplete('failed')).toBe(false);
  });

  it('isJobFailed returns true only for "failed" (case-insensitive)', () => {
    expect(isJobFailed('failed')).toBe(true);
    expect(isJobFailed('FAILED')).toBe(true);
    expect(isJobFailed('completed')).toBe(false);
    expect(isJobFailed('running')).toBe(false);
  });

  it('isJobRunning returns true for accepted/pending/running', () => {
    expect(isJobRunning('accepted')).toBe(true);
    expect(isJobRunning('pending')).toBe(true);
    expect(isJobRunning('running')).toBe(true);
    expect(isJobRunning('completed')).toBe(false);
    expect(isJobRunning('failed')).toBe(false);
  });
});

describe('SarvamBatchError', () => {
  it('captures statusCode and responseBody', () => {
    const err = new SarvamBatchError('boom', 400, '{"error":"bad"}');
    expect(err.message).toBe('boom');
    expect(err.statusCode).toBe(400);
    expect(err.responseBody).toBe('{"error":"bad"}');
    expect(err.name).toBe('SarvamBatchError');
  });
});

describe('API functions', () => {
  // retryWithBackoff runs 3 retries with 1s/2s/4s delays — 7 s total.
  jest.setTimeout(15_000);

  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  function mockFetch(status: number, body: unknown) {
    (global as any).fetch.mockResolvedValue({
      ok: status < 400,
      status,
      text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
      json: () => Promise.resolve(body),
    } as Response);
  }

  describe('createSarvamJob', () => {
    it('creates a batch job and returns the job_id', async () => {
      mockFetch(200, { job_id: TEST_JOB_ID });

      const jobId = await createSarvamJob();

      expect(jobId).toBe(TEST_JOB_ID);
      expect((global as any).fetch).toHaveBeenCalledWith(
        expect.stringContaining('/speech-to-text/job/v1'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('throws SarvamBatchError when no job_id is returned', async () => {
      mockFetch(200, { status: 'ok' });

      await expect(createSarvamJob()).rejects.toThrow('Create job returned no job_id');
    });

    it('throws SarvamBatchError on non-2xx', async () => {
      (global as any).fetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      } as Response);

      await expect(createSarvamJob()).rejects.toThrow('Sarvam create job failed: 500');
    });
  });

  describe('getUploadUrls', () => {
    it('returns upload URLs for given file names', async () => {
      mockFetch(200, {
        job_id: TEST_JOB_ID,
        job_state: 'accepted',
        upload_urls: { 'test.wav': { file_url: 'https://s3.example.com/upload' } },
      });

      const result = await getUploadUrls(TEST_JOB_ID, ['test.wav']);

      expect(result.upload_urls['test.wav'].file_url).toBe('https://s3.example.com/upload');
    });

    it('throws when no upload URLs are returned', async () => {
      mockFetch(200, { job_id: TEST_JOB_ID, job_state: 'accepted', upload_urls: {} });

      await expect(getUploadUrls(TEST_JOB_ID, ['test.wav'])).rejects.toThrow('No upload URLs returned');
    });
  });

  describe('getJobStatus', () => {
    it('returns job status data', async () => {
      mockFetch(200, { job_id: TEST_JOB_ID, job_state: 'running', total_files: 1 });

      const result = await getJobStatus(TEST_JOB_ID);

      expect(result.job_state).toBe('running');
    });
  });

  describe('getDownloadUrls', () => {
    it('returns download URLs', async () => {
      mockFetch(200, {
        job_id: TEST_JOB_ID,
        job_state: 'completed',
        download_urls: { 'transcript.json': { file_url: 'https://s3.example.com/dl' } },
      });

      const result = await getDownloadUrls(TEST_JOB_ID, ['transcript.json']);

      expect(result.download_urls['transcript.json'].file_url).toBe('https://s3.example.com/dl');
    });

    it('throws when no download URLs are returned', async () => {
      mockFetch(200, { job_id: TEST_JOB_ID, job_state: 'completed', download_urls: {} });

      await expect(getDownloadUrls(TEST_JOB_ID, ['transcript.json'])).rejects.toThrow('No download URLs returned');
    });
  });

  describe('downloadTranscript', () => {
    it('downloads and parses the transcript JSON', async () => {
      mockFetch(200, { request_id: 'req-1', transcript: 'Patient presents with...', language_code: 'en-IN' });

      const data = await downloadTranscript('https://s3.example.com/result.json');

      expect(data.transcript).toBe('Patient presents with...');
    });

    it('throws SarvamBatchError on non-2xx', async () => {
      (global as any).fetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
      } as Response);

      await expect(downloadTranscript('https://s3.example.com/missing.json')).rejects.toThrow('Download transcript failed: 404');
    });
  });
});
