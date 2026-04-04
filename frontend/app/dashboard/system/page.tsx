import { redirect } from "next/navigation";

export default function DashboardSystemPage(): React.JSX.Element {
  redirect("/system");
  return <div />;
}

