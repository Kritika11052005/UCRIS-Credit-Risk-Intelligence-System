import React from "react";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsCharts";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  // Parallel DB queries for speed
  const [
    totalCustomers,
    totalPredictions,
    highStress,
    medStress,
    lowStress,
    escalating,
    restructure,
    alert,
    monitor
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.prediction.count(),
    prisma.prediction.count({ where: { stress_label: "High" } }),
    prisma.prediction.count({ where: { stress_label: "Medium" } }),
    prisma.prediction.count({ where: { stress_label: "Low" } }),
    prisma.prediction.count({ where: { escalation_flag: 1 } }),
    prisma.prediction.count({ where: { recommended_action: "Restructure" } }),
    prisma.prediction.count({ where: { recommended_action: "Alert" } }),
    prisma.prediction.count({ where: { recommended_action: "Monitor" } }),
  ]);

  const analyticsData = {
    totalCustomers,
    totalPredictions,
    escalationRate: totalPredictions > 0 ? Math.round((escalating / totalPredictions) * 100) : 0,
    stress: [
      { name: "High", value: highStress, color: "#EF4444" },
      { name: "Medium", value: medStress, color: "#FBBF24" },
      { name: "Low", value: lowStress, color: "#22C55E" },
    ],
    actions: [
      { name: "Restructure", value: restructure },
      { name: "Alert", value: alert },
      { name: "Monitor", value: monitor },
    ],
    escalation: [
      { name: "Escalating", value: escalating },
      { name: "Stable", value: totalPredictions - escalating },
    ]
  };

  return (
    <div className="w-full flex flex-col pt-2 pb-12">
      <div className="mb-10">
        <h1 className="font-display text-2xl text-primary-text mb-1 underline decoration-primary/30 decoration-2 underline-offset-8">Portfolio Intelligence</h1>
        <p className="text-sm text-muted-text max-w-2xl">Advanced analytical breakdown of current credit risk exposure, model recommendations, and account stability across the entire customer portfolio.</p>
      </div>

      <AnalyticsDashboard data={analyticsData} />
    </div>
  );
}
