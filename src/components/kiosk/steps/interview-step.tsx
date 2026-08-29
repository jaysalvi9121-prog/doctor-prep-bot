import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bot, SkipForward } from "lucide-react";
import { KioskShell } from "../kiosk-shell";
import { BigButton } from "../big-button";
import { AnswerInput } from "../answer-input";
import { useLanguage } from "@/lib/i18n";
import { useKioskSession } from "@/lib/kiosk-session";
import { buildQuestionPlan, splitListAnswer } from "@/lib/interview-engine";
import { evaluateRedFlags } from "@/lib/red-flag-rules";
import { kioskService } from "@/services/kiosk-service";
import type { MedicalHistory } from "@/lib/types";

/** Adaptive AI-guided history interview: one question per screen. */
export function InterviewStep() {
  const { t, language } = useLanguage();
  const { goTo, session, setSession, history, patchHistory } = useKioskSession();
  const plan = useMemo(
    () => buildQuestionPlan(history.chief_complaint, language),
    [history.chief_complaint, language],
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [spoken, setSpoken] = useState(false);
  const question = plan[index]!;
  const questionText = question.text[language];

  useEffect(() => {
    setAnswer("");
    setSpoken(false);
  }, [index]);

  const commit = async (skip = false) => {
    if (!session) return;
    const text = answer.trim();
    if (!skip && text) {
      const field = question.field;
      if (field !== "none") {
        const patch: Partial<MedicalHistory> = {};
        if (question.list) {
          const existing = (history[field] as string[]) ?? [];
          patch[field] = [...existing, ...splitListAnswer(text)] as never;
        } else {
          patch[field] = text as never;
        }
        if (question.id === "onset") patch.duration = text;
        patchHistory(patch, { [field]: "PATIENT_REPORTED" });
      }
      setSession({
        ...session,
        turns: [
          ...session.turns,
          {
            questionId: question.id,
            questionText: question.text,
            answer: text,
            spoken,
            field: question.field,
            at: new Date().toISOString(),
          },
        ],
      });

      const flag = evaluateRedFlags([text], language);
      if (flag.red_flag && flag.rule_triggered) {
        await kioskService.raiseStaffAlert(session.id, flag.rule_triggered);
        setSession({ ...session, redFlag: flag, status: "needs_review" });
        goTo("red_flag");
        return;
      }
    }

    if (index + 1 >= plan.length) {
      goTo("documents");
      return;
    }
    setIndex(index + 1);
  };

  return (
    <KioskShell step={3} totalSteps={7}>
      <p className="mb-4 text-base font-bold text-primary" aria-live="polite">
        {t("step")} {index + 1} {t("of")} {plan.length}
      </p>
      <div className="kiosk-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-teal-soft text-teal">
            <Bot className="size-8" aria-hidden="true" />
          </span>
          <h1 className="kiosk-question text-foreground">{questionText}</h1>
        </div>
        <div className="mt-6">
          {question.quickAnswers ? (
            <div className="mb-5 flex flex-wrap gap-3">
              {question.quickAnswers[language].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setAnswer(quick)}
                  className={`min-h-14 rounded-2xl border-2 px-5 text-lg font-semibold transition-colors ${
                    answer === quick
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {quick}
                </button>
              ))}
            </div>
          ) : null}
          <AnswerInput
            value={answer}
            onChange={setAnswer}
            onSpokenAnswer={setSpoken}
            questionText={questionText}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <BigButton
          variant="outline"
          icon={<ArrowLeft className="size-6" aria-hidden="true" />}
          onClick={() => (index === 0 ? goTo("chief_complaint") : setIndex(index - 1))}
        >
          {t("back")}
        </BigButton>
        {question.optional ? (
          <BigButton
            variant="secondary"
            icon={<SkipForward className="size-6" aria-hidden="true" />}
            onClick={() => void commit(true)}
          >
            {t("skip")}
          </BigButton>
        ) : (
          <div className="hidden sm:block" />
        )}
        <BigButton
          onClick={() => void commit(false)}
          disabled={!answer.trim() && !question.optional}
          icon={<ArrowRight className="size-6" aria-hidden="true" />}
        >
          {t("next")}
        </BigButton>
      </div>
    </KioskShell>
  );
}
