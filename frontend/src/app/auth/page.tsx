import React from "react";
import { AuthCanvas } from "@/components/auth/AuthCanvas";
import { AuthForm } from "@/components/auth/AuthForm";

export default function AuthPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-base selection:bg-primary/30">
      <AuthCanvas />
      
      {/* Subtle overlay for the UI depth */}
      <div className="absolute inset-0 z-0 bg-base/50 pointer-events-none" />
      
      <AuthForm />
    </div>
  );
}
