import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { auth } from "@/lib/auth";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="relative min-h-screen bg-base text-primary overflow-x-hidden selection:bg-primary/30">
      <Navbar session={session} />
      <main>{children}</main>
    </div>
  );
}
