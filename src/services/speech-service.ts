import type { Language } from "@/lib/types";
import { apiConfig, delay } from "./config";

/**
 * Speech-to-text abstraction.
 *
 * MVP: uses the browser Web Speech API when available, otherwise a mock
 * transcript so the kiosk keeps working on a demo machine.
 * PRODUCTION: replace `transcribe` with a call to the FastAPI speech endpoint
 * backed by Azure Speech (keys stay server-side). The UI never changes.
 */
export interface SpeechResult {
  transcript: string;
  confidence: number;
  engine: "browser" | "mock" | "azure";
}

export class SpeechUnavailableError extends Error {}
export class SpeechFailedError extends Error {}

const localeFor: Record<Language, string> = { en: "en-IN", hi: "hi-IN" };

const mockTranscripts: Record<Language, string[]> = {
  en: [
    "I have had fever for three days and body ache",
    "About three days ago",
    "It is moderate and it stays the same",
    "I also have chills in the evening",
    "I take paracetamol when the fever rises",
    "No allergies as far as I know",
  ],
  hi: [
    "तीन दिन से बुखार है और शरीर में दर्द है",
    "लगभग तीन दिन पहले",
    "मध्यम है, वैसा ही रहता है",
    "शाम को ठंड भी लगती है",
    "बुखार बढ़ने पर पैरासिटामोल लेता हूँ",
    "मुझे कोई एलर्जी नहीं है",
  ],
};
let mockIndex = 0;

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    | (new () => SpeechRecognitionLike)
    | undefined;
  return Ctor ? new Ctor() : null;
}

export const speechService = {
  isMicrophoneSupported(): boolean {
    return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  },

  /** Resolves with a transcript. `stop()` from the returned handle ends capture. */
  listen(
    language: Language,
    onFinal: (r: SpeechResult) => void,
    onError: (e: Error) => void,
  ): { stop: () => void } {
    const recognition = getRecognition();

    if (!recognition || apiConfig.useMocks === false) {
      // Mock / server path: simulate a short recording then return a transcript.
      let cancelled = false;
      void (async () => {
        await delay(1400);
        if (cancelled) return;
        const list = mockTranscripts[language];
        const transcript = list[mockIndex % list.length]!;
        mockIndex += 1;
        onFinal({ transcript, confidence: 0.82, engine: "mock" });
      })();
      return { stop: () => (cancelled = true) };
    }

    recognition.lang = localeFor[language];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const alt = e.results[0]?.[0];
      if (!alt || !alt.transcript.trim()) {
        onError(new SpeechFailedError("empty transcript"));
        return;
      }
      onFinal({ transcript: alt.transcript, confidence: alt.confidence ?? 0.9, engine: "browser" });
    };
    recognition.onerror = (e) => {
      onError(
        e.error === "not-allowed" || e.error === "audio-capture"
          ? new SpeechUnavailableError(e.error)
          : new SpeechFailedError(e.error),
      );
    };
    try {
      recognition.start();
    } catch {
      onError(new SpeechUnavailableError("start failed"));
    }
    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          /* already stopped */
        }
      },
    };
  },

  /** Audio playback of questions (accessibility). Falls back silently. */
  speak(text: string, language: Language) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = localeFor[language];
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    } catch {
      /* audio playback unavailable on this kiosk */
    }
  },
};
