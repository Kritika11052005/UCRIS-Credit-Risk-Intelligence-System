"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Navbar({ session }: { session?: any }) {
  const navRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const nav = navRef.current;
    if (!nav) return;

    // Scroll trigger transformation
    ScrollTrigger.create({
      start: "top -60px",
      end: 99999,
      toggleClass: { className: "nav-scrolled", targets: nav },
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="fixed top-0 w-full z-50 flex justify-center px-6 transition-all duration-500 ease-out py-4">
      <nav 
        ref={navRef}
        className="nav-container flex items-center justify-between w-full max-w-7xl mx-auto transition-all duration-500 will-change-transform"
      >
        <div className="flex items-center gap-2">
          <Link href="/" className="font-display font-semibold text-xl text-primary-text flex items-center gap-2 tracking-tight">
            UCRIS
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-sans text-secondary-text">
          <Link href="#about" className="hover:text-primary transition-colors duration-200">About</Link>
          <Link href="#features" className="hover:text-primary transition-colors duration-200">Features</Link>
          <Link href="#pipeline" className="hover:text-primary transition-colors duration-200">How It Works</Link>
          <Link href="#research" className="hover:text-primary transition-colors duration-200">Research</Link>
        </div>

        <div>
          <Link 
            href={isLoggedIn ? "/dashboard" : "/auth"} 
            className="px-5 py-2.5 rounded-md border border-primary text-primary hover:bg-primary hover:text-white text-sm font-medium transition-all duration-200 shadow-[0_0_15px_transparent] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] whitespace-nowrap"
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Access"}
          </Link>
        </div>
      </nav>

      {/* Global styles for the scrolled state */}
      <style jsx global>{`
        .nav-scrolled {
          max-width: max-content !important;
          background: rgba(17, 17, 17, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 9999px;
          padding: 8px 12px;
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.1);
          transform: translateY(16px);
        }
        .nav-scrolled .text-xl {
          font-size: 1.125rem;
        }
      `}</style>
    </div>
  );
}
