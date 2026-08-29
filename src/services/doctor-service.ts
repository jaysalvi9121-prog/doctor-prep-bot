import type { MedicalHistory, PatientSession, TimelineEvent } from "@/lib/types";
import { apiConfig, delay } from "./config";
import { ApiError, apiClient, routes } from "./api-client";
import * as mock from "./mock-backend";

export interface DoctorProfile {
  id: string;
  name: string;
  department: string;
  registrationNo: string;
  role: "doctor";
}

/**
 * Doctor-dashboard service layer.
 * Auth is handled by `auth-service.ts` (Clerk-ready), never inside components.
 */
export const doctorService = {
  async listPatients(): Promise<PatientSession[]> {
    if (apiConfig.useMocks) {
      await delay(300);
      return mock.listSessions().filter((s) => s.status !== "in_progress");
    }
    return apiClient.get<PatientSession[]>(routes.doctorPatients);
  },

  async getPatient(id: string): Promise<PatientSession> {
    if (apiConfig.useMocks) {
      await delay(250);
      const s = mock.getSession(id);
      if (!s) throw new ApiError("Patient session not found", 404);
      if (!s.summary) {
        const summary = mock.buildSummary(s);
        return mock.updateSession(id, { summary })!;
      }
      return s;
    }
    return apiClient.get<PatientSession>(routes.doctorPatient(id));
  },

  async updateHistory(id: string, history: MedicalHistory, verifiedSection?: string): Promise<PatientSession> {
    if (apiConfig.useMocks) {
      const s = mock.getSession(id);
      if (!s) throw new ApiError("Patient session not found", 404);
      const verifiedSections = verifiedSection
        ? Array.from(new Set([...s.review.verifiedSections, verifiedSection]))
        : s.review.verifiedSections;
      const provenance = { ...s.provenance };
      if (verifiedSection && verifiedSection in provenance) {
        provenance[verifiedSection as keyof MedicalHistory] = "DOCTOR_VERIFIED";
      } else if (verifiedSection) {
        provenance[verifiedSection as keyof MedicalHistory] = "DOCTOR_VERIFIED";
      }
      mock.audit(id, "doctor", "HISTORY_EDITED", verifiedSection);
      return mock.updateSession(id, {
        history,
        provenance,
        review: { ...s.review, verifiedSections },
      })!;
    }
    return apiClient.patch<PatientSession>(routes.doctorHistory(id), { history, verifiedSection });
  },

  async markReviewed(id: string, doctor: DoctorProfile, notes?: string): Promise<PatientSession> {
    if (apiConfig.useMocks) {
      await delay(300);
      const s = mock.getSession(id);
      if (!s) throw new ApiError("Patient session not found", 404);
      mock.audit(id, "doctor", "MARKED_REVIEWED", doctor.name);
      return mock.updateSession(id, {
        review: {
          ...s.review,
          reviewed: true,
          reviewedBy: doctor.name,
          reviewedAt: new Date().toISOString(),
          ...(notes ? { notes } : {}),
        },
      })!;
    }
    return apiClient.post<PatientSession>(routes.doctorReview(id), { notes });
  },

  async startConsultation(id: string): Promise<PatientSession> {
    if (apiConfig.useMocks) {
      mock.audit(id, "doctor", "CONSULTATION_STARTED");
      return mock.setStatus(id, "consulting")!;
    }
    return apiClient.post<PatientSession>(routes.doctorReview(id), { action: "start" });
  },

  async completeConsultation(id: string): Promise<PatientSession> {
    if (apiConfig.useMocks) {
      mock.audit(id, "doctor", "CONSULTATION_COMPLETED");
      // Workflow 5: persistent record retained, temporary kiosk state released.
      return mock.setStatus(id, "completed")!;
    }
    return apiClient.post<PatientSession>(routes.doctorReview(id), { action: "complete" });
  },

  auditTrail(id: string) {
    return mock.listAuditLog(id);
  },

  resetDemoData() {
    mock.resetMockDb();
  },
};

export function buildTimeline(session: PatientSession): TimelineEvent[] {
  const events: TimelineEvent[] = session.documents.map((d) => ({
    date: d.extracted?.documentDate ?? "Date not read",
    label: mock.documentLabel(d.type),
    detail: d.extracted?.findings.join(" • ") || d.filename,
    kind: "document",
  }));
  events.push({
    date: "Today",
    label: "Patient reports",
    detail: [session.history.chief_complaint, session.history.onset].filter(Boolean).join(" — "),
    kind: "history",
  });
  return events;
}
