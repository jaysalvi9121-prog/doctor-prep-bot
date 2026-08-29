import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { HeartPulse, Lock, ShieldAlert } from "lucide-react";
import { mockDoctors } from "@/services/auth-service";
import { useDoctorAuth } from "@/components/doctor/auth-provider";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/doctor/")({
  head: () => ({
    meta: [
      { title: "Doctor Login — MediKiosk OPD Pre-Consultation" },
      {
        name: "description",
        content:
          "Secure staff sign-in for the MediKiosk doctor dashboard: review patient-reported history, documents and AI-structured summaries before consultation.",
      },
      { property: "og:title", content: "Doctor Login — MediKiosk" },
      {
        property: "og:description",
        content: "Staff sign-in for MediKiosk pre-consultation patient summaries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DoctorLogin,
});

function DoctorLogin() {
  const { signInDoctor, doctor } = useDoctorAuth();
  const navigate = useNavigate();
  const [staffId, setStaffId] = useState(mockDoctors[0]!.id);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await signInDoctor(staffId);
      await navigate({ to: "/doctor/queue" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-6 py-12">
      <div className="kiosk-card w-full max-w-md p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HeartPulse className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">MediKiosk</h1>
            <p className="text-sm font-semibold text-teal">Doctor dashboard</p>
          </div>
        </div>

        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          Mock sign-in for the prototype. Clerk-based authentication plugs into the same auth
          service without UI changes.
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-foreground">Staff ID</span>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="h-14 w-full rounded-2xl border-2 border-input bg-card px-4 text-base font-semibold text-foreground"
          >
            {mockDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.department}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-foreground">Passcode</span>
          <Input
            type="password"
            defaultValue="demo"
            className="h-14 rounded-2xl border-2 border-input"
            aria-describedby="passcode-hint"
          />
          <span id="passcode-hint" className="mt-1 block text-xs text-muted-foreground">
            Not validated in the prototype; no credential is stored.
          </span>
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-50"
        >
          <Lock className="size-5" aria-hidden="true" />
          {busy ? "Signing in…" : doctor ? "Continue to queue" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
