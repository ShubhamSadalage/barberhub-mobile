import type { AxiosError } from 'axios';

/**
 * Turns an API error into a readable message. Handles both our `{ errors: string[] }` /
 * `{ error: string }` bodies and ASP.NET's automatic validation ProblemDetails, where
 * `errors` is an object of `{ field: string[] }`.
 */
export function getApiErrorMessage(e: unknown, fallback: string): string {
  const err = e as AxiosError<{ error?: string; errors?: unknown; title?: string }>;
  const data = err?.response?.data;

  if (data) {
    const { errors } = data;
    if (Array.isArray(errors) && errors.length) return errors.join(' ');
    if (errors && typeof errors === 'object') {
      const messages = Object.values(errors as Record<string, unknown>).flat().filter((m) => typeof m === 'string');
      if (messages.length) return messages.join(' ');
    }
    if (typeof data.error === 'string' && data.error) return data.error;
    if (typeof data.title === 'string' && data.title) return data.title;
  }

  if (err?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (err?.message === 'Network Error') return 'Cannot reach the server. Check your internet connection.';
  return fallback;
}
