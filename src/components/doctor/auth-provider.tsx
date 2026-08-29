import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/auth-service";
import type { Doctor } from "@/lib/types";

type DoctorAuthValue = {
  doctor: Doctor | null;
  signInDoctor: (staffId: string) => Promise<Doctor>;
  signOutDoctor: () => void;
};

const DoctorAuthContext = createContext<DoctorAuthValue | null>(null);

/**
 * Mock staff auth. Swapping in Clerk means replacing the body of these two
 * callbacks; consumers keep using `useDoctorAuth()`.
 */
export function DoctorAuthProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const signInDoctor = useCallback(async (staffId: string) => {
    const signed = await authService.signIn(staffId);
    setDoctor(signed);
    return signed;
  }, []);

  const signOutDoctor = useCallback(() => {
    authService.signOut();
    setDoctor(null);
  }, []);

  const value = useMemo(
    () => ({ doctor, signInDoctor, signOutDoctor }),
    [doctor, signInDoctor, signOutDoctor],
  );

  return <DoctorAuthContext.Provider value={value}>{children}</DoctorAuthContext.Provider>;
}

export function useDoctorAuth() {
  const ctx = useContext(DoctorAuthContext);
  if (!ctx) throw new Error("useDoctorAuth must be used inside DoctorAuthProvider");
  return ctx;
}
