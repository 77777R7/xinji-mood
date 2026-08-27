const DEFAULT_PORT = '8084';
const DEFAULT_TIMEOUT_MS = 30_000;

function getConfiguredBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_MOOD_AI_SERVER_URL;

  return typeof configured === 'string' && configured.trim() ? configured.trim() : null;
}

function getSameHostBaseUrl() {
  if (typeof window === 'undefined' || !window.location?.hostname) {
    return null;
  }

  const port = process.env.EXPO_PUBLIC_MOOD_AI_SERVER_PORT || DEFAULT_PORT;

  return `${window.location.protocol}//${window.location.hostname}:${port}`;
}

export function getMoodAiServerBaseUrl() {
  return (getConfiguredBaseUrl() || getSameHostBaseUrl() || `http://localhost:${DEFAULT_PORT}`).replace(
    /\/+$/,
    '',
  );
}

export function getMoodAiUrl(path: string) {
  return `${getMoodAiServerBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

function getConfiguredTimeoutMs() {
  const configured = Number(process.env.EXPO_PUBLIC_MOOD_AI_TIMEOUT_MS);

  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TIMEOUT_MS;
}

export class MoodAiTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Rora request timed out after ${timeoutMs}ms`);
    this.name = 'MoodAiTimeoutError';
  }
}

export async function fetchMoodAi(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = getConfiguredTimeoutMs(), signal, ...requestInit } = init;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCaller = () => controller.abort();

  signal?.addEventListener('abort', abortFromCaller);

  try {
    return await fetch(getMoodAiUrl(path), { ...requestInit, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new MoodAiTimeoutError(timeoutMs);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
