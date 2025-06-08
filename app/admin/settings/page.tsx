import { requireAdmin } from "@/lib/admin-auth";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <SettingsForm />
    </div>
  );
}
