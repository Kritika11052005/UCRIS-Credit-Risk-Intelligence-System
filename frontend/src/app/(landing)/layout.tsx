import React from "react";
import { Navbar } from "@/components/landing/Navbar";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-base text-primary overflow-x-hidden selection:bg-primary/30">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
