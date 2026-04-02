import React from "react";
import { StatCards, DashboardCharts, RecentTable } from "@/components/dashboard/OverviewComponents";

export default function DashboardOverviewPage() {
  return (
    <div className="w-full flex flex-col pt-2 pb-12">
      <StatCards />
      <DashboardCharts />
      <RecentTable />
    </div>
  );
}
