import { createFileRoute } from "@tanstack/react-router";
import { LanguageProvider } from "@/lib/i18n";
import { KioskSessionProvider, useKioskSession } from "@/lib/kiosk-session";
import { WelcomeStep } from "@/components/kiosk/steps/welcome-step";
import { PatientInfoStep } from "@/components/kiosk/steps/patient-info-step";
import { ChiefComplaintStep } from "@/components/kiosk/steps/chief-complaint-step";
import { InterviewStep } from "@/components/kiosk/steps/interview-step";
import { DocumentsStep } from "@/components/kiosk/steps/documents-step";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediKiosk — OPD Pre-Consultation Kiosk" },
      {
        name: "description",
        content:
          "MediKiosk collects your medical history in your language before you meet the doctor. Speak or type, upload past reports, and skip the paperwork. Not a diagnosis.",
      },
      { property: "og:title", content: "MediKiosk — OPD Pre-Consultation Kiosk" },
      {
        property: "og:description",
        content:
          "Multilingual hospital kiosk that prepares your medical history before your OPD consultation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KioskPage,
});

function KioskPage() {
  return (
    <LanguageProvider>
      <KioskSessionProvider>
        <KioskFlow />
      </KioskSessionProvider>
    </LanguageProvider>
  );
}

function KioskFlow() {
  const { step } = useKioskSession();
  switch (step) {
    case "patient_info":
      return <PatientInfoStep />;
    case "chief_complaint":
      return <ChiefComplaintStep />;
    case "interview":
      return <InterviewStep />;
    case "documents":
      return <DocumentsStep />;
    default:
      return <WelcomeStep />;
  }
}
