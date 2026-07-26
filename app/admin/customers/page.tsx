import { getCustomers } from "@/app/admin/operations/actions";
import { CustomerManager } from "@/components/admin/operations-managers";

export default async function Page() {
  return <CustomerManager customers={await getCustomers()} />;
}
