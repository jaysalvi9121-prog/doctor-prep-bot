/**
 * Service configuration.
 *
 * NEVER put API keys in this file or anywhere in the frontend bundle.
 * Secret credentials (Mugen API key, Azure Speech key, Azure AI Vision key,
 * MongoDB URI, n8n webhook secret) live only on the server side and are read
 * from environment variables inside FastAPI / server handlers.
 *
 * Only public, non-secret configuration may use VITE_ variables.
 */
export const apiConfig = {
  /** Base URL of the FastAPI gateway. Empty string = same-origin. */
  baseUrl: (import.meta.env["VITE_MEDIKIOSK_API_URL"] as string | undefined) ?? "",
  /**
   * When true (default for this prototype) every service call is served by the
   * in-memory mock backend in `mock-backend.ts` — no external credentials needed.
   */
  useMocks:
    ((import.meta.env["VITE_MEDIKIOSK_USE_MOCKS"] as string | undefined) ?? "true") !== "false",
  /** Simulated latency for mock calls, keeps loading states honest. */
  mockLatencyMs: 550,
  /** Kiosk privacy: temporary session state is cleared after inactivity. */
  sessionTimeoutMs: 4 * 60 * 1000,
} as const;

export const integrationEndpoints = {
  // FastAPI -> n8n orchestration webhooks (server-side only)
  n8nHistoryWorkflow: "/webhook/medikiosk/history",
  n8nDocumentWorkflow: "/webhook/medikiosk/document",
  n8nSummaryWorkflow: "/webhook/medikiosk/summary",
  n8nRedFlagWorkflow: "/webhook/medikiosk/red-flag",
  n8nCleanupWorkflow: "/webhook/medikiosk/cleanup",
} as const;

export const delay = (ms: number = apiConfig.mockLatencyMs) => new Promise((r) => setTimeout(r, ms));
