import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const RETRY_DELAYS = [500, 1200, 2000];

const ATTEMPT_TIMEOUT_MS = 10_000;

/** Single fetch attempt with its own timeout, also cut by the external signal. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit | undefined,
  signal: AbortSignal | undefined,
): Promise<Response> {
  const attemptAc = new AbortController();
  const onExternalAbort = () => attemptAc.abort(signal?.reason);
  if (signal?.aborted) onExternalAbort();
  else signal?.addEventListener('abort', onExternalAbort, { once: true });
  const timer = setTimeout(() => attemptAc.abort(), ATTEMPT_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: attemptAc.signal });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  signal?: AbortSignal,
): Promise<Response> {
  let lastError: unknown;
  let lastStatus: number | undefined;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, signal);
      if (res.ok) return res;
      lastStatus = res.status;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (signal?.aborted) throw err;
      lastStatus = undefined;
      lastError = err;
    }
    if (attempt < RETRY_DELAYS.length) {
      await new Promise<void>((resolve, reject) => {
        const onAbort = () => {
          clearTimeout(t);
          reject(signal?.reason);
        };
        const t = setTimeout(() => {
          signal?.removeEventListener('abort', onAbort);
          resolve();
        }, RETRY_DELAYS[attempt]);
        if (signal?.aborted) onAbort();
        else signal?.addEventListener('abort', onAbort, { once: true });
      });
    }
  }
  const reason =
    lastStatus !== undefined
      ? `HTTP ${lastStatus}`
      : lastError instanceof Error
        ? lastError.message
        : 'network error';
  throw new Error(`Request failed after retries: ${reason}`);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().session?.access_token;

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

interface ApiErrorBody {
  detail?: string;
  message?: string;
}

export function parseApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    try {
      const parsed = JSON.parse(error.message) as ApiErrorBody;
      return parsed.detail ?? parsed.message ?? fallback;
    } catch {
      return error.message || fallback;
    }
  }
  return fallback;
}

export const apiClient = {
  get:    <T>(path: string) =>
    request<T>(path),
  post:   <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
