import { getDashboardData } from "@/app/admin/operations/actions";
import { DashboardOverview } from "@/components/admin/dashboard-overview";

export default async function AdminDashboardPage() {
  return <DashboardOverview data={await getDashboardData()} />;
}
