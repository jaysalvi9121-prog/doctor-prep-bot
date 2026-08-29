import { apiConfig } from "./config";

/**
 * Thin REST abstraction over the FastAPI gateway.
 * React components never call third-party APIs directly — they call the
 * service functions in `kiosk-service.ts` / `doctor-service.ts`, which either
 * use the mock backend or this client.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly kind: "network" | "server" | "validation" = "server",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${apiConfig.baseUrl}${path}`;
  let res: Response;
  const init: RequestInit = { method, credentials: "include" };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError("Network unavailable", 0, "network");
  }
  if (!res.ok) throw new ApiError(`Request failed: ${res.status}`, res.status);
  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
};

/** Documented REST surface consumed by this frontend. */
export const routes = {
  createSession: "/api/session",
  answer: (id: string) => `/api/session/${id}/answer`,
  nextQuestion: (id: string) => `/api/session/${id}/next-question`,
  documents: "/api/documents",
  processDocument: (id: string) => `/api/documents/${id}/process`,
  summary: (id: string) => `/api/session/${id}/summary`,
  complete: (id: string) => `/api/session/${id}/complete`,
  doctorPatients: "/api/doctor/patients",
  doctorPatient: (id: string) => `/api/doctor/patients/${id}`,
  doctorHistory: (id: string) => `/api/doctor/patients/${id}/history`,
  doctorReview: (id: string) => `/api/doctor/patients/${id}/review`,
} as const;
