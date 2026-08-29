import type { ReactNode } from "react";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function KioskShell({
  children,
  step,
  totalSteps,
  footer,
}: {
  children: ReactNode;
  step?: number;
  totalSteps?: number;
  footer?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <HeartPulse className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground">{t("appName")}</p>
              <p className="text-xs font-medium text-muted-foreground">
                Pre-consultation • OPD
              </p>
            </div>
          </div>
          {step && totalSteps ? (
            <p className="text-base font-bold text-primary" aria-live="polite">
              {t("step")} {step} {t("of")} {totalSteps}
            </p>
          ) : null}
        </div>
        {step && totalSteps ? (
          <div className="h-2 w-full bg-secondary" role="presentation">
            <div
              className="h-2 rounded-r-full bg-teal transition-[width] duration-300"
              style={{ width: `${Math.round((step / totalSteps) * 100)}%` }}
            />
          </div>
        ) : null}
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-border bg-card px-6 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-start gap-2 text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-snug">{footer ?? t("disclaimer")}</p>
        </div>
      </footer>
    </div>
  );
}

export function KioskQuestion({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <h1 className="kiosk-question text-foreground">{title}</h1>
      {hint ? <p className="kiosk-body mt-3 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
