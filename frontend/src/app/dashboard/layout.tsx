import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { PageTransition } from "@/components/dashboard/PageTransition";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name || "Risk Analyst";

  return (
    <div className="flex w-full min-h-screen bg-base">
      <Sidebar userName={userName} />
      <div className="flex-1 flex flex-col ml-[240px]">
        <TopBar />
        <main className="flex-1 p-8 overflow-hidden">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
