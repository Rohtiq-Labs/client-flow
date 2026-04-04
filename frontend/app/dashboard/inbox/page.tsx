import { redirect } from "next/navigation";

export default function DashboardInboxPage(): React.JSX.Element {
  redirect("/inbox");
  return <div />;
}
