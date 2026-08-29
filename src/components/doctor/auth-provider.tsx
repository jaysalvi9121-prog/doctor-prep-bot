import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthContext, mockSignIn, useAuth, type AuthState, type Role } from "@/services/auth-service";
import type { DoctorProfile } from "@/services/doctor-service";

/**
 * Mock staff auth provider. Swapping in Clerk means replacing the bodies of
 * these callbacks; consumers keep using `useDoctorAuth()`.
 */
export function DoctorAuthProvider({ children }: { children: ReactNode }) {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);

  const signInDoctor = useCallback(async (staffId: string) => {
    const signed = await mockSignIn(staffId);
    setDoctor(signed);
    return signed;
  }, []);

  const signOut = useCallback(() => setDoctor(null), []);

  const value = useMemo<AuthState>(
    () => ({
      role: (doctor ? "doctor" : "patient") as Role,
      doctor,
      signInDoctor,
      signOut,
    }),
    [doctor, signInDoctor, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useDoctorAuth() {
  const { doctor, signInDoctor, signOut } = useAuth();
  return { doctor, signInDoctor, signOutDoctor: signOut };
}
