import { createContext, useContext } from "react";
import type { DoctorProfile } from "./doctor-service";

/**
 * Role-based access architecture.
 *
 * MVP: mock doctor authentication held in this service (no credentials stored).
 * PRODUCTION: swap the implementation for Clerk (`@clerk/clerk-react`) — the
 * context shape stays identical, so no UI component changes. Authentication
 * logic must never live inside individual UI components.
 */
export type Role = "patient" | "doctor" | "staff";

export interface AuthState {
  role: Role;
  doctor: DoctorProfile | null;
  signInDoctor: (staffId: string) => Promise<DoctorProfile>;
  signOut: () => void;
}

export const mockDoctors: DoctorProfile[] = [
  {
    id: "doc_1",
    name: "Dr. Meera Iyer",
    department: "General Medicine OPD",
    registrationNo: "MCI-2011-88214",
    role: "doctor",
  },
  {
    id: "doc_2",
    name: "Dr. R. Chatterjee",
    department: "Orthopaedics OPD",
    registrationNo: "MCI-2008-41120",
    role: "doctor",
  },
];

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Mock sign-in: any known staff ID works; no password is stored anywhere. */
export async function mockSignIn(staffId: string): Promise<DoctorProfile> {
  await new Promise((r) => setTimeout(r, 400));
  const match = mockDoctors.find((d) => d.id === staffId) ?? mockDoctors[0]!;
  return match;
}
