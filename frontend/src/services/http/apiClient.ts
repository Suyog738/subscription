import { config } from "../config";
import { ServiceError } from "../types";

// Thin fetch wrapper for the future FastAPI backend. Not used while
// VITE_USE_MOCK_API is "true" (the default).

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // body wasn't JSON
    }
    throw new ServiceError(message);
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
