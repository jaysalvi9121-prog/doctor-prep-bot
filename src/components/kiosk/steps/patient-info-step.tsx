import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { KioskQuestion, KioskShell } from "../kiosk-shell";
import { BigButton, ChoiceCard } from "../big-button";
import { useLanguage } from "@/lib/i18n";
import { useKioskSession } from "@/lib/kiosk-session";
import { kioskService } from "@/services/kiosk-service";
import { Input } from "@/components/ui/input";
import type { Patient } from "@/lib/types";

export function PatientInfoStep() {
  const { t } = useLanguage();
  const { goTo, session, setSession, reset } = useKioskSession();
  const [name, setName] = useState(session?.patient.name ?? "");
  const [age, setAge] = useState(session?.patient.age ? String(session.patient.age) : "");
  const [sex, setSex] = useState<Patient["sex"]>(session?.patient.sex ?? null);
  const [phone, setPhone] = useState(session?.patient.phone ?? "");
  const [hospitalId, setHospitalId] = useState(session?.patient.hospitalId ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const next: string[] = [];
    if (name.trim().length < 2) next.push(t("name"));
    const ageNum = Number(age);
    if (!age || Number.isNaN(ageNum) || ageNum <= 0 || ageNum > 120) next.push(t("age"));
    if (!sex) next.push(t("sex"));
    setErrors(next);
    if (next.length || !session) return;
    setSaving(true);
    try {
      const updated = await kioskService.savePatient(session.id, {
        name: name.trim(),
        age: ageNum,
        sex,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(hospitalId.trim() ? { hospitalId: hospitalId.trim() } : {}),
      });
      setSession(updated);
      goTo("chief_complaint");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KioskShell step={1} totalSteps={7}>
      <KioskQuestion title={t("yourDetails")} />
      <div className="kiosk-card space-y-6 p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-lg font-bold text-foreground">{t("name")}</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-16 rounded-2xl border-2 border-input !text-xl"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-lg font-bold text-foreground">{t("age")}</span>
            <Input
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
              inputMode="numeric"
              className="h-16 rounded-2xl border-2 border-input !text-xl"
            />
          </label>
        </div>

        <div>
          <span className="mb-2 block text-lg font-bold text-foreground">{t("sex")}</span>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["male", "female", "other"] as const).map((option) => (
              <ChoiceCard
                key={option}
                label={t(option)}
                selected={sex === option}
                onClick={() => setSex(option)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-muted-foreground">
              {t("phone")}
            </span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, "").slice(0, 13))}
              inputMode="tel"
              className="h-14 rounded-2xl border-2 border-input !text-lg"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-muted-foreground">
              {t("hospitalId")}
            </span>
            <Input
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value.slice(0, 24))}
              className="h-14 rounded-2xl border-2 border-input !text-lg"
            />
          </label>
        </div>

        {errors.length ? (
          <p
            className="rounded-2xl border-2 border-warning bg-warning-soft p-4 font-semibold text-warning-foreground"
            role="alert"
          >
            {errors.join(", ")}
          </p>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_2fr]">
        <BigButton
          variant="outline"
          icon={<ArrowLeft className="size-6" aria-hidden="true" />}
          onClick={reset}
        >
          {t("back")}
        </BigButton>
        <BigButton
          onClick={submit}
          disabled={saving}
          icon={<ArrowRight className="size-6" aria-hidden="true" />}
        >
          {t("next")}
        </BigButton>
      </div>
    </KioskShell>
  );
}
