import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "success" | "outline" | "alert";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/92 border-transparent shadow-kiosk",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-accent border-transparent",
  success: "bg-success text-success-foreground hover:bg-success/92 border-transparent shadow-kiosk",
  outline: "bg-card text-foreground hover:bg-secondary border-input",
  alert: "bg-alert text-alert-foreground hover:bg-alert/92 border-transparent",
};

export function BigButton({
  children,
  variant = "primary",
  icon,
  subLabel,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: ReactNode;
  subLabel?: string;
}) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "flex min-h-[4.5rem] w-full items-center justify-center gap-3 rounded-3xl border-2 px-7 py-5 text-xl font-bold transition-colors disabled:opacity-45",
        variants[variant],
        className,
      )}
    >
      {icon}
      <span className="flex flex-col items-center">
        <span>{children}</span>
        {subLabel ? <span className="text-sm font-medium opacity-80">{subLabel}</span> : null}
      </span>
    </button>
  );
}

export function ChoiceCard({
  label,
  description,
  icon,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  icon?: ReactNode;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex min-h-[5.5rem] items-center gap-4 rounded-3xl border-2 bg-card px-6 py-5 text-left transition-colors",
        selected ? "border-primary bg-accent" : "border-border hover:border-primary/50 hover:bg-secondary",
      )}
    >
      {icon ? (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-soft text-teal">
          {icon}
        </span>
      ) : null}
      <span>
        <span className="block text-lg font-bold text-foreground">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </button>
  );
}
