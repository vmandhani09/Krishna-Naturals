import { requireAdmin } from "@/lib/admin-auth";
import UsersTable from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <div className="p-6 space-y-6">
      <UsersTable />
    </div>
  );
}
