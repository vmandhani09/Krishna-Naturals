// app/admin/analytics/page.tsx

import React from "react";
import AnalyticsClient from "@/components/admin/analyticsclient";
import { requireAdmin } from "@/lib/admin-auth";
export default async function AnalyticsPage() {
  await requireAdmin(); // Ensure admin access
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Analytics</h1>
     <AnalyticsClient></AnalyticsClient>
    </div>
  );
}
