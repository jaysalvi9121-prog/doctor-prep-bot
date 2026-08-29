import { useState } from "react";
import { HeartPulse, Languages, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BigButton } from "../big-button";
import { languageOptions, translations, useLanguage } from "@/lib/i18n";
import { useKioskSession } from "@/lib/kiosk-session";
import { kioskService } from "@/services/kiosk-service";
import type { Language } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WelcomeStep() {
  const { language, setLanguage, t } = useLanguage();
  const { goTo, setSession } = useKioskSession();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      const session = await kioskService.createSession(language);
      setSession(session);
      goTo("patient_info");
    } catch {
      setError(t("networkFailed"));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-12">
        <div className="kiosk-card p-8 sm:p-12">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
              <HeartPulse className="size-9" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                {t("appName")}
              </h1>
              <p className="text-sm font-semibold text-teal">Hospital OPD pre-consultation kiosk</p>
            </div>
          </div>

          <p className="kiosk-body mt-6 font-medium text-foreground">{t("tagline")}</p>

          <div className="mt-8">
            <p className="mb-3 flex items-center gap-2 text-base font-bold text-muted-foreground">
              <Languages className="size-5" aria-hidden="true" /> {t("chooseLanguage")}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {languageOptions.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code as Language)}
                  aria-pressed={language === opt.code}
                  className={cn(
                    "min-h-[5rem] rounded-3xl border-2 text-2xl font-bold transition-colors",
                    language === opt.code
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary",
                  )}
                >
                  {opt.label}
                  <span className="mt-1 block text-sm font-medium text-muted-foreground">
                    {translations[opt.code].start}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <BigButton onClick={start} disabled={starting}>
              {starting ? "…" : t("start")}
            </BigButton>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border-2 border-warning bg-warning-soft p-4 font-semibold text-warning-foreground">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-secondary p-5">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-base leading-snug text-secondary-foreground">
              {t("disclaimerLong")}
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Hospital staff:{" "}
          <Link to="/doctor" className="font-semibold text-primary underline">
            Doctor dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
