import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { KioskQuestion, KioskShell } from "../kiosk-shell";
import { BigButton } from "../big-button";
import { AnswerInput } from "../answer-input";
import { useLanguage } from "@/lib/i18n";
import { useKioskSession } from "@/lib/kiosk-session";
import { evaluateRedFlags } from "@/lib/red-flag-rules";
import { kioskService } from "@/services/kiosk-service";

export function ChiefComplaintStep() {
  const { t, language } = useLanguage();
  const { goTo, session, setSession, patchHistory } = useKioskSession();
  const [answer, setAnswer] = useState("");
  const [spoken, setSpoken] = useState(false);

  const next = async () => {
    if (!answer.trim() || !session) return;
    patchHistory({ chief_complaint: answer.trim() }, { chief_complaint: "PATIENT_REPORTED" });
    setSession({
      ...session,
      turns: [
        ...session.turns,
        {
          questionId: "chief_complaint",
          questionText: {
            en: "What brings you to the doctor today?",
            hi: "आज आप डॉक्टर के पास किस समस्या के लिए आए हैं?",
          },
          answer: answer.trim(),
          spoken,
          field: "chief_complaint",
          at: new Date().toISOString(),
        },
      ],
    });

    const flag = evaluateRedFlags([answer], language);
    if (flag.red_flag && flag.rule_triggered) {
      await kioskService.raiseStaffAlert(session.id, flag.rule_triggered);
      setSession({ ...session, redFlag: flag, status: "needs_review" });
      goTo("red_flag");
      return;
    }
    goTo("interview");
  };

  return (
    <KioskShell step={2} totalSteps={7}>
      <KioskQuestion title={t("chiefComplaintTitle")} hint={t("chiefComplaintHint")} />
      <AnswerInput
        value={answer}
        onChange={setAnswer}
        onSpokenAnswer={setSpoken}
        questionText={t("chiefComplaintTitle")}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_2fr]">
        <BigButton
          variant="outline"
          icon={<ArrowLeft className="size-6" aria-hidden="true" />}
          onClick={() => goTo("patient_info")}
        >
          {t("back")}
        </BigButton>
        <BigButton
          onClick={next}
          disabled={!answer.trim()}
          icon={<ArrowRight className="size-6" aria-hidden="true" />}
        >
          {t("next")}
        </BigButton>
      </div>
    </KioskShell>
  );
}
