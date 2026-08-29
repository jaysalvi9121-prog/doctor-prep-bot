import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DoctorAuthProvider } from "@/components/doctor/auth-provider";

export const Route = createFileRoute("/doctor")({
  component: () => (
    <DoctorAuthProvider>
      <Outlet />
    </DoctorAuthProvider>
  ),
});
