import {
  emptyHistory,
  type AuditLogEntry,
  type DataSource,
  type DocumentType,
  type ExtractedInformation,
  type KioskDocument,
  type Language,
  type MedicalHistory,
  type MedicalSummary,
  type Patient,
  type PatientSession,
  type SessionStatus,
} from "@/lib/types";
import { demoSessions } from "@/lib/demo-data";

/**
 * In-memory mock of the MongoDB collections behind FastAPI.
 * Clearly separated from production integrations (see `production-adapters.ts`).
 * Persisted to localStorage only so the doctor dashboard survives a reload
 * during a demo — real deployments never store patient data in the browser.
 */
const STORE_KEY = "medikiosk.mock.db.v1";

interface MockDb {
  sessions: PatientSession[];
  audit: AuditLogEntry[];
  queueCounter: number;
}

let db: MockDb | null = null;

function seed(): MockDb {
  const sessions = demoSessions();
  return {
    sessions,
    audit: sessions.map((s, i) => ({
      id: `audit_seed_${i}`,
      sessionId: s.id,
      actor: "system",
      action: "DEMO_SESSION_SEEDED",
      at: s.createdAt,
    })),
    queueCounter: sessions.length,
  };
}

function load(): MockDb {
  if (db) return db;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        db = JSON.parse(raw) as MockDb;
        return db;
      }
    } catch {
      /* ignore corrupted demo state */
    }
  }
  db = seed();
  persist();
  return db;
}

function persist() {
  if (typeof window === "undefined" || !db) return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(db));
  } catch {
    /* storage full / disabled — demo continues in memory */
  }
}

export function resetMockDb() {
  db = seed();
  persist();
}

export function audit(sessionId: string, actor: AuditLogEntry["actor"], action: string, detail?: string) {
  const store = load();
  const entry: AuditLogEntry = {
    id: `audit_${Math.random().toString(36).slice(2, 10)}`,
    sessionId,
    actor,
    action,
    at: new Date().toISOString(),
    ...(detail ? { detail } : {}),
  };
  store.audit.unshift(entry);
  persist();
}

export function listAuditLog(sessionId?: string) {
  const store = load();
  return sessionId ? store.audit.filter((a) => a.sessionId === sessionId) : store.audit;
}

export function createSession(language: Language): PatientSession {
  const store = load();
  store.queueCounter += 1;
  const now = new Date().toISOString();
  const session: PatientSession = {
    id: `sess_${Math.random().toString(36).slice(2, 10)}`,
    queueNumber: store.queueCounter,
    language,
    createdAt: now,
    updatedAt: now,
    status: "in_progress",
    demo: false,
    patient: { name: "", age: null, sex: null },
    history: emptyHistory(),
    turns: [],
    documents: [],
    redFlag: { red_flag: false, rule_triggered: null, requires_human_review: false },
    review: { reviewed: false, verifiedSections: [] },
    provenance: {},
  };
  store.sessions.unshift(session);
  persist();
  audit(session.id, "patient", "SESSION_CREATED", `language=${language}`);
  return session;
}

export function getSession(id: string) {
  return load().sessions.find((s) => s.id === id) ?? null;
}

export function listSessions() {
  return [...load().sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function updateSession(id: string, patch: Partial<PatientSession>): PatientSession | null {
  const store = load();
  const idx = store.sessions.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const next = { ...store.sessions[idx]!, ...patch, updatedAt: new Date().toISOString() };
  store.sessions[idx] = next;
  persist();
  return next;
}

export function setStatus(id: string, status: SessionStatus) {
  return updateSession(id, { status });
}

export function savePatient(id: string, patient: Patient) {
  audit(id, "patient", "DEMOGRAPHICS_SAVED");
  return updateSession(id, { patient });
}

export function saveHistory(
  id: string,
  history: MedicalHistory,
  provenance: Partial<Record<keyof MedicalHistory, DataSource>>,
) {
  return updateSession(id, { history, provenance });
}

export function deleteSession(id: string) {
  const store = load();
  store.sessions = store.sessions.filter((s) => s.id !== id);
  persist();
  audit(id, "system", "TEMPORARY_KIOSK_DATA_DELETED");
}

/* ---------------------------------------------------------------------- */
/* Mock OCR extraction (stands in for Azure AI Vision + Mugen extraction) */
/* ---------------------------------------------------------------------- */

const ocrFixtures: Record<DocumentType, ExtractedInformation> = {
  prescription: {
    documentDate: "12 Aug 2026",
    medicines: ["Paracetamol 500 mg — twice daily", "Cetirizine 10 mg — at night"],
    doctorName: "Dr. A. Verma, MBBS MD",
    hospitalName: "District Government Hospital, OPD",
    findings: ["Advised rest and plenty of fluids", "Review after 5 days"],
    rawText:
      "DISTRICT GOVT HOSPITAL / OPD SLIP\n12-08-2026\nTab Paracetamol 500mg 1-0-1 x 5 days\nTab Cetirizine 10mg 0-0-1 x 3 days\nAdv: rest, plenty of fluids, review after 5 days\nDr A. Verma MBBS MD",
    source: "OCR_EXTRACTED",
  },
  blood_report: {
    documentDate: "10 Aug 2026",
    medicines: [],
    hospitalName: "City Diagnostics Laboratory",
    findings: ["Haemoglobin 11.4 g/dL", "Total WBC 11,200 /µL", "Platelets 1.9 lakh/µL", "Dengue NS1: negative"],
    rawText:
      "CITY DIAGNOSTICS LAB\nCBC 10/08/2026\nHb 11.4 g/dL\nTLC 11200 /uL\nPlatelets 1.9 lakh\nDengue NS1 - Negative",
    source: "OCR_EXTRACTED",
  },
  imaging_report: {
    documentDate: "02 Jul 2026",
    medicines: [],
    hospitalName: "Radiology Department",
    findings: ["X-ray right knee: reported joint space narrowing", "No fracture reported"],
    rawText: "X-RAY RIGHT KNEE AP/LAT 02-07-2026\nMedial joint space narrowing noted. No fracture seen.",
    source: "OCR_EXTRACTED",
  },
  discharge_summary: {
    documentDate: "18 Mar 2026",
    medicines: ["Metformin 500 mg — twice daily"],
    doctorName: "Dr. S. Nair",
    hospitalName: "Government Medical College Hospital",
    findings: ["Admitted 14–18 Mar 2026", "Discharged in stable condition", "Advised OPD follow-up"],
    rawText:
      "GMCH DISCHARGE SUMMARY\nAdmission 14/03/2026 Discharge 18/03/2026\nOn Tab Metformin 500mg BD\nDischarged stable, OPD follow-up advised.\nDr S. Nair",
    source: "OCR_EXTRACTED",
  },
  other: {
    medicines: [],
    findings: ["Document text captured; type not recognised"],
    rawText: "Scanned document text captured by OCR.",
    source: "OCR_EXTRACTED",
  },
};

export function mockOcr(type: DocumentType): ExtractedInformation {
  return structuredClone(ocrFixtures[type]);
}

export function addDocument(sessionId: string, doc: KioskDocument) {
  const session = getSession(sessionId);
  if (!session) return null;
  audit(sessionId, "patient", "DOCUMENT_UPLOADED", `${doc.type}:${doc.filename}`);
  return updateSession(sessionId, { documents: [...session.documents, doc] });
}

export function updateDocument(sessionId: string, docId: string, patch: Partial<KioskDocument>) {
  const session = getSession(sessionId);
  if (!session) return null;
  return updateSession(sessionId, {
    documents: session.documents.map((d) => (d.id === docId ? { ...d, ...patch } : d)),
  });
}

/* ---------------------------------------------------------------- */
/* Mock summary generation (stands in for Mugen API via n8n)         */
/* ---------------------------------------------------------------- */

const docLabels: Record<DocumentType, string> = {
  prescription: "Prescription",
  blood_report: "Blood report",
  imaging_report: "X-ray / scan report",
  discharge_summary: "Discharge summary",
  other: "Other document",
};

export function documentLabel(type: DocumentType) {
  return docLabels[type];
}

export function buildSummary(session: PatientSession): MedicalSummary {
  const h = session.history;
  const p = session.patient;
  const who = `${p.age ?? "—"}-year-old ${p.sex ?? "patient"}`;
  const lines: string[] = [];
  lines.push(
    `${who} presenting with ${h.chief_complaint || "an unspecified complaint"}${
      h.onset ? `, reported to have started ${h.onset.toLowerCase()}` : ""
    }.`,
  );
  if (h.progression || h.severity) {
    lines.push(
      `Patient describes the problem as ${[h.severity, h.progression].filter(Boolean).join(", ").toLowerCase()}.`,
    );
  }
  if (h.associated_symptoms.length) {
    lines.push(`Also reports: ${h.associated_symptoms.join(", ")}.`);
  }
  if (h.past_medical_history.length) {
    lines.push(`Past history as reported: ${h.past_medical_history.join(", ")}.`);
  }
  lines.push(
    h.current_medications.length
      ? `Current medication information: ${h.current_medications.join(", ")}.`
      : "No current medications reported.",
  );
  lines.push(
    h.allergies.length ? `Allergies reported: ${h.allergies.join(", ")}.` : "No known allergies reported.",
  );
  if (session.documents.length) {
    lines.push(
      `${session.documents.length} previous document(s) available: ${session.documents
        .map((d) => docLabels[d.type])
        .join(", ")}.`,
    );
  }
  return {
    narrative: lines.join(" "),
    history: h,
    documents: session.documents.map((d) => ({
      type: d.type,
      label: docLabels[d.type],
      ...(d.extracted?.documentDate ? { date: d.extracted.documentDate } : {}),
    })),
    generatedBy: "AI_STRUCTURED",
  };
}
