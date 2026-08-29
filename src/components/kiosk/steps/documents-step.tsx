import { useState } from "react";
import { ArrowRight, FileText, FlaskConical, ScanLine, FileSpreadsheet, Files, X } from "lucide-react";
import { KioskQuestion, KioskShell } from "../kiosk-shell";
import { BigButton, ChoiceCard } from "../big-button";
import { useLanguage } from "@/lib/i18n";
import { useKioskSession } from "@/lib/kiosk-session";
import { kioskService } from "@/services/kiosk-service";
import type { DocumentType, KioskDocument } from "@/lib/types";

const docTypes: { type: DocumentType; key: "docPrescription" | "docBlood" | "docImaging" | "docDischarge" | "docOther"; icon: typeof FileText }[] = [
  { type: "prescription", key: "docPrescription", icon: FileText },
  { type: "blood_report", key: "docBlood", icon: FlaskConical },
  { type: "imaging_report", key: "docImaging", icon: ScanLine },
  { type: "discharge_summary", key: "docDischarge", icon: FileSpreadsheet },
  { type: "other", key: "docOther", icon: Files },
];

export function DocumentsStep() {
  const { t } = useLanguage();
  const { goTo, session, history, provenance, setSession } = useKioskSession();
  const [docs, setDocs] = useState<KioskDocument[]>(session?.documents ?? []);
  const [busy, setBusy] = useState<DocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addDocument = async (type: DocumentType) => {
    if (!session) return;
    setBusy(type);
    setError(null);
    try {
      const doc = await kioskService.uploadDocument(session.id, type, `${type}_scan.jpg`);
      setDocs((d) => [...d, { ...doc, status: "processing" }]);
      const extracted = await kioskService.processDocument(session.id, doc);
      setDocs((d) =>
        d.map((x) => (x.id === doc.id ? { ...x, status: "extracted", extracted } : x)),
      );
    } catch {
      setError(t("ocrFailed"));
    } finally {
      setBusy(null);
    }
  };

  const proceed = async () => {
    if (!session) return;
    const saved = await kioskService.saveHistory(session.id, history, provenance);
    setSession({ ...saved, documents: docs });
    goTo(docs.length ? "extracted_review" : "summary");
  };

  return (
    <KioskShell step={4} totalSteps={7}>
      <KioskQuestion title={t("documentsTitle")} />
      <div className="grid gap-4 sm:grid-cols-2">
        {docTypes.map(({ type, key, icon: Icon }) => (
          <ChoiceCard
            key={type}
            label={t(key)}
            description={busy === type ? t("processing") : t("upload")}
            icon={<Icon className="size-6" aria-hidden="true" />}
            onClick={() => void addDocument(type)}
          />
        ))}
      </div>

      {docs.length ? (
        <ul className="mt-6 space-y-3">
          {docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-4 rounded-2xl border-2 border-border bg-card px-5 py-4"
            >
              <span className="text-lg font-semibold text-foreground">{d.filename}</span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-bold text-teal">
                  {d.status === "extracted" ? t("extracted") : t("processing")}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${d.filename}`}
                  onClick={() => setDocs((all) => all.filter((x) => x.id !== d.id))}
                  className="rounded-full border border-input p-2 text-muted-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl border-2 border-warning bg-warning-soft p-4 font-semibold text-warning-foreground">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <BigButton variant="outline" onClick={proceed}>
          {t("noDocuments")}
        </BigButton>
        <BigButton
          onClick={proceed}
          disabled={busy !== null}
          icon={<ArrowRight className="size-6" aria-hidden="true" />}
        >
          {t("next")}
        </BigButton>
      </div>
    </KioskShell>
  );
}
