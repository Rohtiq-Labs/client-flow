import { DashboardAuthGate } from "@/components/sections/dashboard/DashboardShell/DashboardAuthGate";
import { DashboardLayout } from "@/components/sections/dashboard/DashboardShell/DashboardLayout";
import { DashboardStateProvider } from "@/context/dashboard-state-context";

export default function DashboardRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <DashboardAuthGate>
      <DashboardStateProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </DashboardStateProvider>
    </DashboardAuthGate>
  );
}
