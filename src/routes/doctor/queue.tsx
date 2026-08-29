import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Users } from "lucide-react";
import { doctorService } from "@/services/doctor-service";

export const Route = createFileRoute("/doctor/queue")({
  head: () => ({
    meta: [
      { title: "OPD Queue — MediKiosk Doctor Dashboard" },
      {
        name: "description",
        content:
          "Live OPD queue of patients who completed kiosk pre-consultation, with safety-rule alerts and AI-structured history ready for doctor review.",
      },
      { property: "og:title", content: "OPD Queue — MediKiosk Doctor Dashboard" },
      {
        property: "og:description",
        content: "Patients ready for consultation with structured pre-visit history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DoctorQueue,
});

function DoctorQueue() {
  const { data, isLoading } = useQuery({
    queryKey: ["doctor", "patients"],
    queryFn: () => doctorService.listPatients(),
    refetchInterval: 8000,
  });

  return (
    <div className="min-h-dvh bg-surface px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Users className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">OPD queue</h1>
            <p className="text-sm text-muted-foreground">
              Patient-reported information. Not a diagnosis — clinical decisions remain with you.
            </p>
          </div>
        </header>

        {isLoading ? (
          <p className="mt-8 text-muted-foreground">Loading queue…</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {(data ?? []).map((s) => (
              <li key={s.id} className="kiosk-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-bold text-foreground">
                      #{s.queueNumber} · {s.patient.name || "Unnamed"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {s.patient.age ?? "—"} yrs · {s.patient.sex ?? "—"} ·{" "}
                      {s.history.chief_complaint || "No complaint recorded"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {s.demo ? (
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                          DEMO DATA
                        </span>
                      ) : null}
                      {s.redFlag.red_flag ? (
                        <span className="flex items-center gap-1 rounded-full bg-alert-soft px-3 py-1 text-xs font-bold text-alert">
                          <AlertTriangle className="size-3" aria-hidden="true" /> Needs review
                        </span>
                      ) : null}
                      <span className="rounded-full bg-teal-soft px-3 py-1 text-xs font-bold text-teal">
                        {s.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/doctor/patients/$id"
                    params={{ id: s.id }}
                    className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-5 font-bold text-primary-foreground"
                  >
                    Open <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
            {data && data.length === 0 ? (
              <li className="kiosk-card p-6 text-muted-foreground">
                No patients waiting. Completed kiosk sessions appear here.
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </div>
  );
}
