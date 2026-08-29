/**
 * MediKiosk domain models.
 *
 * These types mirror the intended MongoDB collections:
 *   PatientSession, Patient, History, Document, ExtractedInformation,
 *   MedicalSummary, DoctorReview, AuditLog
 *
 * FUTURE INTEGRATION (not implemented in MVP):
 *   - ABHA identifier on Patient
 *   - ABDM consent artefact on PatientSession
 *   - FHIR resource mapping (Patient, Condition, MedicationStatement,
 *     AllergyIntolerance, DocumentReference, Composition)
 *   - Hospital EMR / HPR / HFR identifiers
 * See src/services/future-integrations.ts
 */

export type Language = "en" | "hi";

/** Provenance of every piece of clinical information. */
export type DataSource =
  | "PATIENT_REPORTED"
  | "OCR_EXTRACTED"
  | "AI_STRUCTURED"
  | "DOCTOR_VERIFIED";

export interface Sourced<T> {
  value: T;
  source: DataSource;
  /** Original patient utterance / raw OCR text, kept for doctor reference. */
  raw?: string | undefined;
}

export interface Patient {
  name: string;
  age: number | null;
  sex: "male" | "female" | "other" | null;
  phone?: string | undefined;
  hospitalId?: string | undefined;
  /** FUTURE: abhaNumber?: string */
}

export interface InterviewTurn {
  questionId: string;
  questionText: Record<Language, string>;
  answer: string;
  /** true when captured through the speech service. */
  spoken: boolean;
  field: keyof MedicalHistory | "none";
  at: string;
}

export interface MedicalHistory {
  chief_complaint: string;
  onset: string;
  duration: string;
  severity: string;
  progression: string;
  modifying_factors: string;
  associated_symptoms: string[];
  past_medical_history: string[];
  current_medications: string[];
  allergies: string[];
  family_history: string[];
  relevant_social_history: string[];
}

export type DocumentType =
  | "prescription"
  | "blood_report"
  | "imaging_report"
  | "discharge_summary"
  | "other";

export type DocumentStatus = "uploaded" | "processing" | "extracted" | "failed";

export interface ExtractedInformation {
  documentDate?: string | undefined;
  medicines: string[];
  doctorName?: string | undefined;
  hospitalName?: string | undefined;
  findings: string[];
  rawText: string;
  /** OCR_EXTRACTED until the patient or doctor verifies it. */
  source: DataSource;
}

export interface KioskDocument {
  id: string;
  type: DocumentType;
  filename: string;
  status: DocumentStatus;
  confirmed: boolean;
  extracted?: ExtractedInformation | undefined;
  error?: string | undefined;
}

export interface RedFlagState {
  red_flag: boolean;
  rule_triggered: string | null;
  requires_human_review: boolean;
  detected_at?: string | undefined;
}

export interface MedicalSummary {
  narrative: string;
  history: MedicalHistory;
  documents: { type: DocumentType; label: string; date?: string | undefined }[];
  generatedBy: "AI_STRUCTURED";
}

export interface DoctorReviewState {
  reviewed: boolean;
  reviewedBy?: string | undefined;
  reviewedAt?: string | undefined;
  verifiedSections: string[];
  notes?: string | undefined;
}

export type SessionStatus = "in_progress" | "ready" | "needs_review" | "consulting" | "completed";

export interface PatientSession {
  id: string;
  queueNumber: number;
  language: Language;
  createdAt: string;
  updatedAt: string;
  status: SessionStatus;
  demo: boolean;
  patient: Patient;
  history: MedicalHistory;
  turns: InterviewTurn[];
  documents: KioskDocument[];
  redFlag: RedFlagState;
  summary?: MedicalSummary | undefined;
  review: DoctorReviewState;
  /** Per-field provenance for doctor-facing badges. */
  provenance: Partial<Record<keyof MedicalHistory, DataSource>>;
}

export interface AuditLogEntry {
  id: string;
  sessionId: string;
  actor: "patient" | "doctor" | "system";
  action: string;
  at: string;
  detail?: string | undefined;
}

export interface TimelineEvent {
  date: string;
  label: string;
  detail: string;
  kind: "document" | "history";
}

export const emptyHistory = (): MedicalHistory => ({
  chief_complaint: "",
  onset: "",
  duration: "",
  severity: "",
  progression: "",
  modifying_factors: "",
  associated_symptoms: [],
  past_medical_history: [],
  current_medications: [],
  allergies: [],
  family_history: [],
  relevant_social_history: [],
});
