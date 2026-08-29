# Health History Hub

Lovable Prompt — MediKiosk MVP

Build a production-quality MediKiosk web application prototype for a high-volume hospital OPD in India.

1. Product Goal

MediKiosk is an AI-assisted pre-consultation kiosk.

The patient uses a touchscreen kiosk before seeing the doctor. The system collects a structured medical history through Hindi or English voice/touch interaction, allows the patient to upload/scan previous prescriptions and medical reports, extracts useful information from those documents, and generates a concise medical-history summary for the doctor.

Critical safety principle:
MediKiosk must NOT diagnose diseases, recommend treatment, prescribe medicines, or replace the doctor.

The UI must clearly communicate:

"MediKiosk collects and organizes your medical information. It does not provide a diagnosis. Your doctor makes all clinical decisions."

2. Build the MVP

Create two primary interfaces:

A. Patient Kiosk

Designed for patients with minimal technical literacy.

B. Doctor Dashboard

Designed for doctors reviewing the patient's information before consultation.

Also create a simple backend/API integration architecture so the frontend is ready to connect to FastAPI, n8n, Mugen API, OCR, speech services, and MongoDB.

3. Visual Design

Design should feel like a modern Indian government-hospital healthcare kiosk.

Design principles

Extremely simple

Large touch targets

High contrast

Minimal text

Accessible typography

Calm healthcare colors

White background

Blue/teal primary color

Green for successful completion

Amber for warnings

Red only for safety alerts

Avoid unnecessary animations

Responsive, but optimize primarily for a large touchscreen kiosk

Use rounded cards, clear icons, progress indicators, large buttons, and generous spacing.

Use a professional healthcare design rather than a generic SaaS dashboard.

4. Patient Kiosk Flow

Implement the following flow:

Patient arrives

↓

Welcome screen

↓

Select language:

हिन्दी

English

↓

Basic patient information

↓

Chief complaint

↓

AI-guided medical history

↓

Relevant follow-up questions

↓

Previous medications

↓

Allergies

↓

Past medical history

↓

Family history where relevant

↓

Upload/scan previous documents

↓

OCR processing

↓

Review extracted information

↓

Generate medical history summary

↓

Confirmation

↓

"Your information has been sent to the doctor."

↓

Session completed

5. Welcome Screen

Create a kiosk-style welcome screen.

Display:

MediKiosk

"Let's prepare your medical history before you meet the doctor."

Buttons:

हिन्दी

English

Also display:

"Your information is used to help the doctor understand your history. MediKiosk does not diagnose or prescribe."

Large "Start" button.

6. Language Selection

Support:

English

हिन्दी

The selected language should control all patient-facing UI text.

Create a centralized translation structure so additional Indian languages can easily be added later.

Example:

translations = {
  en: {
    welcome: "Let's prepare your medical history",
    start: "Start",
    next: "Next",
    back: "Back",
    speak: "Speak",
    record: "Record",
    upload: "Upload document"
  },
  hi: {
    welcome: "आइए आपकी चिकित्सा जानकारी तैयार करें",
    start: "शुरू करें",
    next: "आगे",
    back: "पीछे",
    speak: "बोलें",
    record: "रिकॉर्ड करें",
    upload: "दस्तावेज़ अपलोड करें"
  }
}


7. Patient Information

Collect only the minimum required information for the MVP.

Fields:

Name

Age

Sex

Optional phone number

Optional hospital/patient ID

Do not require account creation.

Do not require a smartphone.

Generate a temporary session ID.

8. Chief Complaint Screen

Ask:

"What brings you to the doctor today?"

Provide two large options:

🎤 Speak

⌨️ Type

For voice input, create a microphone interaction UI.

Example:

"Please tell us what problem you are having."

Show:

Microphone icon

Recording animation

Transcript area

Retry button

Continue button

The frontend should be structured so Azure Speech can later replace the mock speech-to-text implementation.

9. AI History Interview

Create an interactive conversational medical-history interface.

The AI should ask questions such as:

What is your main problem?

When did it start?

Is it getting better or worse?

How severe is it?

Does anything make it better or worse?

Are there other symptoms?

Have you had this problem before?

Do you have any existing medical conditions?

Are you currently taking any medicines?

Do you have any allergies?

Is there any relevant family history?

The questions must be adaptive.

For example:

If the patient says:

"I have fever."

The next questions could include:

When did the fever start?

Do you know your temperature?

Do you have chills?

Do you have cough, sore throat, vomiting, diarrhea, or body pain?

Do not make diagnostic conclusions.

Do not display disease predictions.

Do not recommend medicines.

10. Conversational UI

Create a simple patient-friendly interface.

Example:

┌─────────────────────────────────────┐
│ MediKiosk                     3 / 8 │
│                                     │
│        🤖                            │
│   When did this problem start?      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🎤 Tap and speak             │   │
│   └─────────────────────────────┘   │
│                                     │
│   OR                                │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Type your answer             │   │
│   └─────────────────────────────┘   │
│                                     │
│       [ Repeat ]     [ Next ]       │
└─────────────────────────────────────┘


Include a visible progress indicator.

Allow:

Repeat question

Record answer

Edit transcript

Skip when appropriate

Go back

11. Medical History Data Model

Structure patient answers into fields like:

{
  "chief_complaint": "",
  "onset": "",
  "duration": "",
  "severity": "",
  "associated_symptoms": [],
  "past_medical_history": [],
  "current_medications": [],
  "allergies": [],
  "family_history": [],
  "relevant_social_history": []
}


Keep original patient responses as well as structured information.

The doctor should be able to see both the structured information and the original response where necessary.

12. Document Upload / Scanning

Create a document-scanning screen.

Title:

"Do you have any previous medical documents?"

Options:

Upload prescription

Upload blood report

Upload X-ray/scan report

Upload discharge summary

Upload other document

No documents

Allow image/PDF upload.

Show uploaded documents as cards.

Each card should display:

Document type

Filename

Upload status

Processing status

Example:

Prescription_2026.jpg

✓ Uploaded
⟳ Extracting information...


13. OCR Processing

Create a realistic loading/processing experience.

Pipeline:

Document
   ↓
OCR
   ↓
Text extraction
   ↓
Medical information extraction
   ↓
Structured information


For the MVP, use mock OCR data if external APIs are unavailable.

However, create service interfaces/placeholders for:

Azure AI Vision

Mugen API

Do not hardcode the external API keys in frontend code.

14. Extracted Document Information

After processing a document, show:

Extracted information

Example:

Document: Previous Prescription

Date: 12 Aug 2026

Medicines:
• [medicine name]
• [medicine name]

Doctor:
[doctor name]

Hospital:
[hospital name]

Additional information:
[extracted text]


Include:

Edit

Confirm

The user must be able to correct OCR errors.

Clearly label extracted information as:

AI/OCR extracted — please verify

15. Medical Summary

Create a final patient summary before sending it to the doctor.

Example:

MEDICAL HISTORY SUMMARY

Patient
Age: 42
Sex: Male

Chief Complaint
Fever for 3 days

History
• Started approximately 3 days ago
• Patient reports intermittent fever
• Reports body ache
• No previous similar episode reported

Current Medications
• [Medication]

Allergies
• No known allergies reported

Previous Documents
• Prescription — 12 Aug 2026
• Blood report — 10 Aug 2026


Add:

Edit information

Confirm & Send to Doctor

16. Red Flag Safety System

Implement a basic rule-based safety layer.

IMPORTANT:

Do NOT depend exclusively on an LLM for emergency warning detection.

Create a frontend/backend-ready rule engine architecture.

Potential red-flag examples may include:

Severe difficulty breathing

Severe chest pain

Loss of consciousness

Severe uncontrolled bleeding

New severe neurological symptoms

Other configured emergency warning signs

When a configured rule is triggered:

Show a clear warning:

"Please wait. A healthcare staff member will assist you."

Do not tell the patient:

"You have [disease]."

Do not provide diagnosis.

Do not prescribe treatment.

Create a staff alert state.

Example:

{
  "red_flag": true,
  "rule_triggered": "configured_rule_identifier",
  "requires_human_review": true
}


The actual clinical rules should be configurable rather than embedded throughout the UI.

17. Doctor Dashboard

Create a professional doctor dashboard.

Dashboard layout:

Header

MediKiosk

Patient queue

Doctor profile

Patient List

Display:

Queue number

Patient name

Age

Sex

Chief complaint

Status

Red-flag indicator

Example:

Patient       Age   Complaint       Status
------------------------------------------------
Ramesh K.     52    Fever           Ready
Sunita P.     34    Abdominal pain  Ready
Amit S.       67    Cough           ⚠ Review


18. Patient Detail Page

When the doctor opens a patient:

Create sections:

Patient demographics

Chief complaint

History of present illness

Associated symptoms

Past medical history

Current medications

Allergies

Family history

Previous documents

Timeline

AI-generated summary

Safety / red flags

19. Timeline

Create a chronological medical timeline.

Example:

12 Aug 2026
Previous prescription

10 Aug 2026
Blood report

Today
Patient reports:
Fever for 3 days


Allow documents and history events to appear on the timeline.

20. Doctor Summary

At the top of the patient page, create a concise summary card:

AI-generated pre-consultation summary

Example:

42-year-old male presenting with fever for approximately
3 days and reported body ache.

Patient reports no previous similar episode.
Previous prescription and blood report are available.

Current medication information:
[details]

Allergies:
[details]


Add a visible label:

AI-generated — Doctor review required

21. Doctor Editing

The doctor must be able to edit AI-generated information.

Each major section should have:

Edit

The doctor can:

Correct information

Add information

Remove incorrect information

Mark information as verified

Track whether information is:

Patient reported

OCR extracted

AI structured

Doctor verified

22. Doctor Actions

Add buttons:

Mark Reviewed

Edit History

View Documents

Start Consultation

Do NOT add:

AI diagnosis

AI prescription

Treatment recommendations

The doctor remains responsible for diagnosis and treatment.

23. Backend Architecture

Prepare the frontend for this architecture:

React / Next.js Kiosk
        ↓
     FastAPI
        ↓
      n8n
        ↓
 ┌──────┼────────┐
 ↓      ↓        ↓
Mugen   OCR    Speech
 API    API      API
        ↓
    MongoDB
        ↓
Doctor Dashboard


The frontend should communicate with a clean REST API abstraction.

Create an api or services layer rather than calling third-party APIs directly from React components.

24. API Structure

Prepare frontend service functions such as:

POST /api/session
POST /api/session/{id}/answer
POST /api/session/{id}/next-question
POST /api/documents
POST /api/documents/{id}/process
GET  /api/session/{id}/summary
POST /api/session/{id}/complete

GET  /api/doctor/patients
GET  /api/doctor/patients/{id}
PATCH /api/doctor/patients/{id}/history
POST /api/doctor/patients/{id}/review


Use mock data initially so the UI is fully functional without external API credentials.

Clearly separate mock services from production integrations.

25. n8n Integration

The architecture should assume n8n is the orchestration layer.

Create placeholder integration endpoints for:

Workflow 1 — History

FastAPI
 ↓
n8n webhook
 ↓
Mugen API
 ↓
Next question
 ↓
FastAPI
 ↓
Kiosk


Workflow 2 — Documents

Upload
 ↓
n8n
 ↓
OCR
 ↓
Mugen
 ↓
Structured data
 ↓
MongoDB


Workflow 3 — Summary

History
+
Documents
 ↓
n8n
 ↓
Mugen
 ↓
Doctor summary


Workflow 4 — Red Flag

Patient answer
 ↓
Rule engine
 ↓
Potential red flag?
 ↓
Human staff alert


Workflow 5 — Cleanup

Consultation completed
 ↓
Mark session complete
 ↓
Transfer required data
 ↓
Delete temporary kiosk data
 ↓
Audit log


26. Security and Privacy

This is a healthcare application.

Build the prototype with privacy and security in mind.

Requirements:

Never expose API keys in frontend code

Use environment variables

Use HTTPS in production

Avoid unnecessary patient data

Use temporary kiosk sessions

Automatically clear temporary kiosk state after completion/timeout

Provide session timeout

Add audit logging architecture

Separate patient and doctor interfaces

Use role-based access control architecture

Clearly distinguish temporary data from persistent medical records

Do not claim that the prototype is HIPAA/ABDM compliant unless actually implemented and verified.

27. Authentication

For the MVP:

Patient

No account required.

Use temporary session ID.

Doctor

Create a mock authenticated doctor experience.

Structure the application so Clerk can later provide authentication.

Do not put authentication logic directly into individual UI components.

28. MongoDB Data Architecture

Prepare collections/models for:

PatientSession
Patient
History
Document
ExtractedInformation
MedicalSummary
DoctorReview
AuditLog


Use references between entities.

Store metadata indicating source:

PATIENT_REPORTED
OCR_EXTRACTED
AI_STRUCTURED
DOCTOR_VERIFIED


29. FHIR / ABDM

Do not build complete ABDM integration in the MVP.

However, structure the data model so that FHIR/ABDM integration can be added later.

Add a clearly marked future integration section in the code architecture.

Future integrations:

ABHA

ABDM consent

FHIR resources

Hospital EMR

Healthcare Professional Registry

Healthcare Facility Registry

30. Required Screens

Build these screens:

Patient

Welcome

Language selection

Patient information

Chief complaint

AI interview

Voice recording

Document upload

OCR processing

Extracted document review

Medical summary

Confirmation

Red-flag staff alert

Session completed

Doctor

Doctor login

Patient queue

Patient overview

Patient history

Documents

Timeline

AI summary

Edit history

Review/complete consultation

31. Demo Mode

Because this is an MVP/hackathon prototype, create a Demo Mode.

Provide realistic sample patients.

Example:

Patient 1
42 Male
Chief complaint: Fever for 3 days

Patient 2
56 Female
Chief complaint: Knee pain

Patient 3
29 Male
Chief complaint: Cough for 5 days


The entire flow should work using mock data even without:

Mugen API

Azure Speech

Azure Vision

MongoDB

n8n

Clearly label mock/demo data.

32. Important UX Requirement

The patient should never feel like they are filling out a complicated medical form.

The experience should feel like:

Listen → Speak/Tap → Continue

rather than:

Read a large form → Fill many fields → Submit

Use one primary question per screen wherever possible.

33. Accessibility

Optimize for:

Elderly patients

Low digital literacy

Hindi-speaking users

Patients unfamiliar with smartphones

Patients with limited reading ability

Use:

Large buttons

Large fonts

Voice interaction

Simple language

Clear icons

High contrast

Audio playback of questions

Visible progress

Minimal typing

34. Error Handling

Design friendly states for:

Microphone unavailable

Speech recognition failure

OCR failure

Network failure

AI service unavailable

Document upload failure

Session timeout

Example:

"We couldn't understand the recording."

Buttons:

Try Again

Type Instead

Never trap the patient in a failed state.

35. Technical Quality

Use:

React / Next.js

TypeScript

Clean component architecture

Reusable UI components

Responsive design

Strong typing

API/service abstraction

Environment variables

Loading states

Error states

Form validation

Accessible components

Use mock APIs/services where real integrations are unavailable.

Do not hardcode everything into a single page.

36. Dashboard Design

The doctor dashboard should prioritize speed.

The doctor should be able to understand the patient in approximately one screen.

At the top:

PATIENT
42M

CHIEF COMPLAINT
Fever — 3 days

KEY HISTORY
• Fever for 3 days
• Body ache reported
• No previous similar episode reported

MEDICATIONS
[details]

ALLERGIES
[details]

DOCUMENTS
2 available

SAFETY
No configured red flag detected


Then allow deeper exploration below.

37. Color Semantics

Use colors consistently:

Blue/Teal:
Normal healthcare actions

Green:
Completed / verified

Amber:
Needs attention / AI-generated information

Red:
Potential safety alert only

Gray:
Secondary information

Do not use red for normal errors or ordinary UI states.

38. Important Safety Copy

Place this in the patient interface:

"MediKiosk helps collect your medical information before you meet the doctor. It does not diagnose or prescribe."

Place this in the doctor interface:

"AI-generated information may contain errors. Review and verify before using it for clinical decision-making."

39. Final MVP Goal

The completed prototype should demonstrate this complete journey:

PATIENT
  ↓
Select Hindi / English
  ↓
Speak or tap
  ↓
Medical history interview
  ↓
Upload old prescription/report
  ↓
OCR
  ↓
Structured information
  ↓
Medical history summary
  ↓
Safety rule check
  ↓
DOCTOR DASHBOARD
  ↓
Doctor reviews/corrects
  ↓
Doctor conducts consultation


The core product objective is:

"Collect the patient's history before the doctor sees the patient and give the doctor a clean, reviewable summary."

Prioritize a polished end-to-end working prototype over building advanced backend integrations.

Do not implement diagnosis or prescription functionality.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5372a276-3045-488b-8a86-832c5e2b80de).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
