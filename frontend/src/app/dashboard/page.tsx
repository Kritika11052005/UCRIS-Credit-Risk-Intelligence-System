import React from "react";
import { StatCards, DashboardCharts, RecentTable } from "@/components/dashboard/OverviewComponents";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardOverviewPage() {
  // StatCards queries
  const totalCustomers = await prisma.customer.count() || 0;
  const highStress = await prisma.prediction.count({ where: { stress_label: "High" } }) || 0;
  const escalating = await prisma.prediction.count({ where: { escalation_flag: 1 } }) || 0;
  const restructure = await prisma.prediction.count({ where: { recommended_action: "Restructure" } }) || 0;

  // Chart distribution queries
  const totalPredictions = await prisma.prediction.count() || 0;
  const lowP = await prisma.prediction.count({ where: { stress_label: "Low" } }) || 0;
  const medP = await prisma.prediction.count({ where: { stress_label: "Medium" } }) || 0;
  const highP = await prisma.prediction.count({ where: { stress_label: "High" } }) || 0;
  
  // ── Escalation Trend Aggregation ──────────────────────────────────────────
  // Fetch escalating predictions from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trendPredictions = await prisma.prediction.findMany({
    where: {
      escalation_flag: 1,
      predicted_at: {
        gte: thirtyDaysAgo
      }
    },
    select: {
      predicted_at: true
    }
  });

  // Group by date string (YYYY-MM-DD)
  const countsByDate: Record<string, number> = {};
  trendPredictions.forEach(p => {
    const dStr = p.predicted_at.toISOString().split('T')[0];
    countsByDate[dStr] = (countsByDate[dStr] || 0) + 1;
  });

  // Generate continuous 30-day array for the chart
  const escalationData = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dStr = d.toISOString().split('T')[0];
    return {
      date: dStr,
      displayDate: d.getDate().toString().padStart(2, '0'),
      count: countsByDate[dStr] || 0
    };
  });

  // Recent predictions
  const recentRaw = await prisma.prediction.findMany({
    take: 5,
    orderBy: { predicted_at: "desc" },
    include: { customer: true }
  });

  const recentFormatted = recentRaw.map(p => ({
    id: p.id,
    customerId: p.customer?.customer_ref || p.customer_id,
    stress: p.stress_label,
    esc: p.escalation_flag === 1 ? "Escalating" : "Stable",
    action: p.recommended_action,
    conf: p.confidence,
    date: new Date(p.predicted_at).toLocaleDateString()
  }));

  return (
    <div className="w-full flex flex-col pt-2 pb-12">
      <StatCards data={{ total: totalCustomers, high: highStress, escalating, restructure }} />
      <DashboardCharts 
        distribution={{ low: lowP, medium: medP, high: highP, total: totalPredictions }} 
        escalationData={escalationData} 
      />
      <RecentTable predictions={recentFormatted} />
    </div>
  );
}
