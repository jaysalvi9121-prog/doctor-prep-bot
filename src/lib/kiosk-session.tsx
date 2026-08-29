import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { emptyHistory, type DataSource, type MedicalHistory, type PatientSession } from "./types";
import { apiConfig } from "@/services/config";
import { kioskService } from "@/services/kiosk-service";

export type KioskStep =
  | "welcome"
  | "patient_info"
  | "chief_complaint"
  | "interview"
  | "documents"
  | "extracted_review"
  | "summary"
  | "confirmation"
  | "red_flag"
  | "timeout";

interface KioskSessionValue {
  step: KioskStep;
  goTo: (step: KioskStep) => void;
  session: PatientSession | null;
  setSession: (s: PatientSession | null) => void;
  history: MedicalHistory;
  provenance: Partial<Record<keyof MedicalHistory, DataSource>>;
  patchHistory: (
    patch: Partial<MedicalHistory>,
    provenance?: Partial<Record<keyof MedicalHistory, DataSource>>,
  ) => void;
  reset: () => void;
  /** Extends the privacy timeout; called on any patient interaction. */
  keepAlive: () => void;
}

const KioskSessionContext = createContext<KioskSessionValue | null>(null);

export function KioskSessionProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<KioskStep>("welcome");
  const [session, setSession] = useState<PatientSession | null>(null);
  const [history, setHistory] = useState<MedicalHistory>(emptyHistory());
  const [provenance, setProvenance] = useState<
    Partial<Record<keyof MedicalHistory, DataSource>>
  >({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef<PatientSession | null>(null);
  sessionRef.current = session;

  const reset = useCallback(() => {
    setStep("welcome");
    setSession(null);
    setHistory(emptyHistory());
    setProvenance({});
  }, []);

  const keepAlive = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const current = sessionRef.current;
      // Privacy: temporary kiosk data is discarded on inactivity.
      if (current && current.status === "in_progress") {
        void kioskService.discardTemporarySession(current.id);
      }
      setSession(null);
      setHistory(emptyHistory());
      setProvenance({});
      setStep("timeout");
    }, apiConfig.sessionTimeoutMs);
  }, []);

  useEffect(() => {
    if (step === "welcome" || step === "timeout" || step === "confirmation") return;
    keepAlive();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [step, keepAlive]);

  const patchHistory = useCallback(
    (
      patch: Partial<MedicalHistory>,
      source?: Partial<Record<keyof MedicalHistory, DataSource>>,
    ) => {
      setHistory((h) => ({ ...h, ...patch }));
      if (source) setProvenance((p) => ({ ...p, ...source }));
    },
    [],
  );

  const value = useMemo<KioskSessionValue>(
    () => ({
      step,
      goTo: (s) => {
        setStep(s);
        keepAlive();
      },
      session,
      setSession,
      history,
      provenance,
      patchHistory,
      reset,
      keepAlive,
    }),
    [step, session, history, provenance, patchHistory, reset, keepAlive],
  );

  return <KioskSessionContext.Provider value={value}>{children}</KioskSessionContext.Provider>;
}

export function useKioskSession() {
  const ctx = useContext(KioskSessionContext);
  if (!ctx) throw new Error("useKioskSession must be used inside KioskSessionProvider");
  return ctx;
}
