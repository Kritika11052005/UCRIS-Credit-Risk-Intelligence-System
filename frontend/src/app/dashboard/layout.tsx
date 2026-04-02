import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { PageTransition } from "@/components/dashboard/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen bg-base">
      <Sidebar />
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
