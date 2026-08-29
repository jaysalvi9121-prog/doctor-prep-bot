import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, FileText } from "lucide-react";
import { buildTimeline, doctorService } from "@/services/doctor-service";

export const Route = createFileRoute("/doctor/patients/$id")({
  head: () => ({
    meta: [
      { title: "Patient Pre-Consultation Summary — MediKiosk" },
      {
        name: "description",
        content:
          "Structured pre-consultation summary: patient-reported history, OCR-extracted document findings and provenance for every field.",
      },
      { property: "og:title", content: "Patient Pre-Consultation Summary — MediKiosk" },
      {
        property: "og:description",
        content: "Patient-reported history and document findings with source labels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();
  const { data: session, isLoading } = useQuery({
    queryKey: ["doctor", "patient", id],
    queryFn: () => doctorService.getPatient(id),
  });

  if (isLoading || !session) {
    return <div className="min-h-dvh bg-surface p-10 text-muted-foreground">Loading patient…</div>;
  }

  const h = session.history;
  const rows: { label: string; value: string }[] = [
    { label: "Chief complaint", value: h.chief_complaint },
    { label: "Onset / duration", value: [h.onset, h.duration].filter(Boolean).join(" · ") },
    { label: "Severity", value: h.severity },
    { label: "Progression", value: h.progression },
    { label: "Modifying factors", value: h.modifying_factors },
    { label: "Associated symptoms", value: h.associated_symptoms.join(", ") },
    { label: "Past medical history", value: h.past_medical_history.join(", ") },
    { label: "Current medications", value: h.current_medications.join(", ") },
    { label: "Allergies", value: h.allergies.join(", ") },
    { label: "Family history", value: h.family_history.join(", ") },
    { label: "Social history", value: h.relevant_social_history.join(", ") },
  ];

  return (
    <div className="min-h-dvh bg-surface px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Link to="/doctor/queue" className="inline-flex items-center gap-2 font-semibold text-primary">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to queue
        </Link>

        <header className="kiosk-card p-6">
          <h1 className="text-3xl font-bold text-foreground">
            #{session.queueNumber} · {session.patient.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {session.patient.age ?? "—"} yrs · {session.patient.sex ?? "—"} ·{" "}
            {session.patient.hospitalId ?? "No hospital ID"}
          </p>
          {session.redFlag.red_flag ? (
            <p className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-alert bg-alert-soft p-4 font-semibold text-alert">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              Safety rule triggered ({session.redFlag.rule_triggered}). Requires human review — this
              is not a diagnosis.
            </p>
          ) : null}
        </header>

        {session.summary ? (
          <section className="kiosk-card p-6">
            <h2 className="text-xl font-bold text-foreground">Summary</h2>
            <span className="mt-1 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              AI_STRUCTURED — verify before use
            </span>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground">
              {session.summary.narrative}
            </p>
          </section>
        ) : null}

        <section className="kiosk-card p-6">
          <h2 className="text-xl font-bold text-foreground">History</h2>
          <dl className="mt-4 divide-y divide-border">
            {rows.map((r) => (
              <div key={r.label} className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr]">
                <dt className="text-sm font-bold text-muted-foreground">{r.label}</dt>
                <dd className="text-base text-foreground">{r.value || "Not reported"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="kiosk-card p-6">
          <h2 className="text-xl font-bold text-foreground">Documents & timeline</h2>
          <ul className="mt-4 space-y-3">
            {buildTimeline(session).map((e, i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-secondary p-4">
                <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-bold text-foreground">
                    {e.label} <span className="text-sm font-medium text-muted-foreground">{e.date}</span>
                  </p>
                  <p className="text-sm text-secondary-foreground">{e.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
