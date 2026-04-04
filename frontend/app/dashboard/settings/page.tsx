import { DashboardSettingsMain } from "@/components/sections/dashboard/DashboardShell/DashboardSettingsMain";
import { redirect } from "next/navigation";

export default function DashboardSettingsPage(): React.JSX.Element {
  redirect("/settings");
  return <div />;
}
