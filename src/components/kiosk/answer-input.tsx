import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Keyboard, Mic, Square, Volume2 } from "lucide-react";
import { BigButton } from "./big-button";
import { useLanguage } from "@/lib/i18n";
import { speechService, SpeechUnavailableError } from "@/services/speech-service";
import { Textarea } from "@/components/ui/textarea";

/**
 * Speak-or-type answer capture.
 * Speech comes from `speechService` so Azure Speech can replace the mock/browser
 * engine without touching this component.
 */
export function AnswerInput({
  value,
  onChange,
  questionText,
  onSpokenAnswer,
  autoFocusText,
}: {
  value: string;
  onChange: (v: string) => void;
  questionText: string;
  onSpokenAnswer?: (spoken: boolean) => void;
  autoFocusText?: boolean;
}) {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<"choose" | "listening" | "typing">("choose");
  const [error, setError] = useState<string | null>(null);
  const handle = useRef<{ stop: () => void } | null>(null);

  useEffect(() => () => handle.current?.stop(), []);
  useEffect(() => {
    if (value && mode === "choose") setMode("typing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = () => {
    setError(null);
    if (!speechService.isMicrophoneSupported()) {
      setError(t("micUnavailable"));
      setMode("typing");
      return;
    }
    setMode("listening");
    handle.current = speechService.listen(
      language,
      (result) => {
        onChange(result.transcript);
        onSpokenAnswer?.(true);
        setMode("typing");
      },
      (err) => {
        setError(err instanceof SpeechUnavailableError ? t("micUnavailable") : t("speechFailed"));
        setMode("choose");
      },
    );
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => speechService.speak(questionText, language)}
        className="inline-flex items-center gap-2 rounded-full border border-input bg-card px-4 py-2 text-sm font-semibold text-primary"
      >
        <Volume2 className="size-4" aria-hidden="true" /> {t("repeat")}
      </button>

      {mode === "listening" ? (
        <div className="kiosk-card flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex size-24 items-center justify-center rounded-full bg-alert-soft">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Mic className="size-8" aria-hidden="true" />
            </span>
          </span>
          <p className="text-xl font-bold text-foreground" aria-live="assertive">
            {t("listening")}
          </p>
          <BigButton
            variant="outline"
            icon={<Square className="size-5" aria-hidden="true" />}
            onClick={() => {
              handle.current?.stop();
              setMode("choose");
            }}
            className="max-w-xs"
          >
            {t("stop")}
          </BigButton>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <BigButton icon={<Mic className="size-7" aria-hidden="true" />} onClick={startListening}>
            {t("speak")}
          </BigButton>
          <BigButton
            variant="outline"
            icon={<Keyboard className="size-7" aria-hidden="true" />}
            onClick={() => setMode("typing")}
          >
            {t("typeAnswer")}
          </BigButton>
        </div>
      )}

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-warning bg-warning-soft p-4">
          <AlertTriangle className="mt-0.5 size-5 text-warning-foreground" aria-hidden="true" />
          <div className="space-y-2">
            <p className="font-semibold text-warning-foreground">{error}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startListening}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {t("retry")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("typing");
                }}
                className="rounded-full border border-input bg-card px-4 py-2 text-sm font-semibold text-foreground"
              >
                {t("typeInstead")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "typing" ? (
        <div>
          <label htmlFor="answer" className="sr-only">
            {t("typeAnswer")}
          </label>
          <Textarea
            id="answer"
            autoFocus={autoFocusText}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              onSpokenAnswer?.(false);
            }}
            rows={3}
            placeholder={t("typeAnswer")}
            className="min-h-28 rounded-3xl border-2 border-input bg-card p-5 !text-xl"
          />
        </div>
      ) : null}
    </div>
  );
}
