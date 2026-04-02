"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, ChevronRight } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();

  // Quick breadcrumb logic based on pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const isDashboardRoot = pathParts.length === 1 && pathParts[0] === "dashboard";

  const titleMap: Record<string, string> = {
    "dashboard": "Portfolio Overview",
    "customers": "Customers",
    "predictions": "Predictions",
    "analytics": "Analytics",
    "chat": "UCRIS Chat",
    "settings": "Settings"
  };

  const currentPathKey = pathParts[pathParts.length - 1] || "dashboard";
  const title = titleMap[currentPathKey] || "Dashboard";

  return (
    <header className="h-[72px] flex items-center justify-between px-8 bg-base sticky top-0 z-20 border-b border-white/5">
      <div className="flex flex-col">
        <h1 className="font-display font-semibold text-xl text-primary-text flex items-center gap-2">
          {title}
        </h1>
        {!isDashboardRoot && pathParts.length > 1 && (
          <div className="flex items-center text-[11px] font-mono text-muted-text mt-1">
            <span className="uppercase">{pathParts[0]}</span>
            <ChevronRight size={10} className="mx-1" />
            <span className="uppercase text-primary">{pathParts[1]}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-[#171717] border border-[#1F1F1F] rounded-full pl-9 pr-4 py-1.5 text-sm text-primary-text focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all w-[240px]"
          />
        </div>

        <button aria-label="Notifications" className="relative text-muted-text hover:text-primary-text transition-colors">
          <Bell size={20} />
          <span className="absolute 1px right-0.5 top-0 w-2 h-2 bg-primary rounded-full border border-base"></span>
        </button>
      </div>
    </header>
  );
}
