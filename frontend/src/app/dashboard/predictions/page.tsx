import React from "react";
import { PredictionsTable } from "@/components/dashboard/PredictionsTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PredictionsPage() {
  const history = await prisma.prediction.findMany({
    take: 100,
    orderBy: { predicted_at: "desc" },
    include: {
      customer: true,
      requester: true
    }
  });

  const formatted = history.map(p => ({
    id: p.id,
    customerRef: p.customer?.customer_ref || "Unknown",
    stress: p.stress_label as "Low" | "Medium" | "High",
    escalationProb: p.escalation_prob,
    isEscalating: p.escalation_flag === 1,
    action: p.recommended_action,
    analyst: p.requester?.name || "System",
    date: new Date(p.predicted_at).toLocaleDateString(),
    time: new Date(p.predicted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="w-full flex flex-col pt-2 pb-12">
      <div className="mb-8">
        <h1 className="font-display text-2xl text-primary-text mb-1">Predictions History</h1>
        <p className="text-sm text-muted-text">Comprehensive audit log of all risk assessments and stress analysis results.</p>
      </div>

      <PredictionsTable data={formatted} />
    </div>
  );
}
