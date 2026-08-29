/**
 * ============================================================
 * FUTURE INTEGRATIONS — NOT IMPLEMENTED IN THIS MVP
 * ============================================================
 *
 * This file documents the seams for later work. Nothing here is wired up, and
 * the prototype makes NO compliance claims: it is NOT HIPAA or ABDM compliant
 * and must not be used with real patient data as-is.
 *
 * 1. ABHA (Ayushman Bharat Health Account)
 *    - Patient.abhaNumber, verified via ABDM Gateway on the server.
 * 2. ABDM consent
 *    - Consent artefact captured before any data leaves the kiosk session;
 *      stored alongside PatientSession with purpose, scope, expiry.
 * 3. FHIR R4 mapping
 *    - Patient          <- Patient
 *    - Condition        <- MedicalHistory.past_medical_history
 *    - MedicationStatement <- MedicalHistory.current_medications
 *    - AllergyIntolerance  <- MedicalHistory.allergies
 *    - DocumentReference   <- KioskDocument
 *    - Composition         <- MedicalSummary (pre-consultation note)
 * 4. Hospital EMR — outbound push of the doctor-verified Composition.
 * 5. HPR (Healthcare Professional Registry) — verify DoctorProfile.registrationNo.
 * 6. HFR (Healthcare Facility Registry) — facility identifier on every session.
 */

export interface FutureAbdmContext {
  abhaNumber?: string;
  consentArtefactId?: string;
  facilityHfrId?: string;
  professionalHprId?: string;
}

export const futureIntegrationStatus = {
  abha: "planned",
  abdmConsent: "planned",
  fhir: "planned",
  hospitalEmr: "planned",
  hpr: "planned",
  hfr: "planned",
} as const;
