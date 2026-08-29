import {
  type DataSource,
  type DocumentType,
  type ExtractedInformation,
  type KioskDocument,
  type Language,
  type MedicalHistory,
  type MedicalSummary,
  type Patient,
  type PatientSession,
} from "@/lib/types";
import { apiConfig, delay } from "./config";
import { ApiError, apiClient, routes } from "./api-client";
import * as mock from "./mock-backend";

/**
 * Patient-kiosk service layer.
 * `apiConfig.useMocks === true` -> in-memory mock backend (default prototype).
 * `false` -> real FastAPI endpoints (see `routes`), orchestrated by n8n.
 */
export const kioskService = {
  async createSession(language: Language): Promise<PatientSession> {
    if (apiConfig.useMocks) {
      await delay(250);
      return mock.createSession(language);
    }
    return apiClient.post<PatientSession>(routes.createSession, { language });
  },

  async savePatient(sessionId: string, patient: Patient): Promise<PatientSession> {
    if (apiConfig.useMocks) {
      await delay(200);
      const s = mock.savePatient(sessionId, patient);
      if (!s) throw new ApiError("Session not found", 404);
      return s;
    }
    return apiClient.patch<PatientSession>(routes.doctorPatient(sessionId), { patient });
  },

  async saveHistory(
    sessionId: string,
    history: MedicalHistory,
    provenance: Partial<Record<keyof MedicalHistory, DataSource>>,
  ): Promise<PatientSession> {
    if (apiConfig.useMocks) {
      const s = mock.saveHistory(sessionId, history, provenance);
      if (!s) throw new ApiError("Session not found", 404);
      return s;
    }
    return apiClient.post<PatientSession>(routes.answer(sessionId), { history, provenance });
  },

  async uploadDocument(sessionId: string, type: DocumentType, filename: string): Promise<KioskDocument> {
    const doc: KioskDocument = {
      id: `doc_${Math.random().toString(36).slice(2, 10)}`,
      type,
      filename,
      status: "uploaded",
      confirmed: false,
    };
    if (apiConfig.useMocks) {
      await delay(400);
      mock.addDocument(sessionId, doc);
      return doc;
    }
    return apiClient.post<KioskDocument>(routes.documents, { sessionId, type, filename });
  },

  /** OCR + medical information extraction (Azure AI Vision -> Mugen via n8n). */
  async processDocument(sessionId: string, doc: KioskDocument): Promise<ExtractedInformation> {
    if (apiConfig.useMocks) {
      mock.updateDocument(sessionId, doc.id, { status: "processing" });
      await delay(1600);
      const extracted = mock.mockOcr(doc.type);
      mock.updateDocument(sessionId, doc.id, { status: "extracted", extracted });
      return extracted;
    }
    return apiClient.post<ExtractedInformation>(routes.processDocument(doc.id), { sessionId });
  },

  async confirmDocument(sessionId: string, docId: string, extracted: ExtractedInformation) {
    if (apiConfig.useMocks) {
      mock.updateDocument(sessionId, docId, { extracted, confirmed: true });
      mock.audit(sessionId, "patient", "EXTRACTED_INFO_CONFIRMED", docId);
      return;
    }
    await apiClient.patch(routes.processDocument(docId), { sessionId, extracted, confirmed: true });
  },

  async getSummary(sessionId: string): Promise<MedicalSummary> {
    if (apiConfig.useMocks) {
      await delay(900);
      const session = mock.getSession(sessionId);
      if (!session) throw new ApiError("Session not found", 404);
      const summary = mock.buildSummary(session);
      mock.updateSession(sessionId, { summary });
      return summary;
    }
    return apiClient.get<MedicalSummary>(routes.summary(sessionId));
  },

  async completeSession(sessionId: string): Promise<PatientSession> {
    if (apiConfig.useMocks) {
      await delay(500);
      const session = mock.getSession(sessionId);
      if (!session) throw new ApiError("Session not found", 404);
      const s = mock.updateSession(sessionId, {
        status: session.redFlag.red_flag ? "needs_review" : "ready",
      })!;
      mock.audit(sessionId, "patient", "SESSION_SUBMITTED_TO_DOCTOR");
      return s;
    }
    return apiClient.post<PatientSession>(routes.complete(sessionId), {});
  },

  /** Workflow 4 — staff alert for a triggered safety rule. */
  async raiseStaffAlert(sessionId: string, ruleId: string) {
    if (apiConfig.useMocks) {
      mock.updateSession(sessionId, {
        status: "needs_review",
        redFlag: {
          red_flag: true,
          rule_triggered: ruleId,
          requires_human_review: true,
          detected_at: new Date().toISOString(),
        },
      });
      mock.audit(sessionId, "system", "RED_FLAG_STAFF_ALERT", ruleId);
      return;
    }
    await apiClient.post(routes.answer(sessionId), { redFlagRule: ruleId });
  },

  /** Workflow 5 — clear temporary kiosk data at timeout / abandonment. */
  async discardTemporarySession(sessionId: string) {
    if (apiConfig.useMocks) {
      mock.deleteSession(sessionId);
      return;
    }
    await apiClient.post(routes.complete(sessionId), { discard: true });
  },
};
