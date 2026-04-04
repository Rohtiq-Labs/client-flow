import { redirect } from "next/navigation";

export default function DashboardLeadsPage(): React.JSX.Element {
  redirect("/leads");
  return <div />;
}
