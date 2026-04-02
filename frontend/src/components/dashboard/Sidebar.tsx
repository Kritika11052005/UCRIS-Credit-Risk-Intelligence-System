"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Zap, BarChart2, MessageSquare, Settings } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Customers", href: "/dashboard/customers" },
  { icon: Zap, label: "Predictions", href: "/dashboard/predictions" },
  { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
  { icon: MessageSquare, label: "Chat", href: "/dashboard/chat" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 bg-[#111111] border-r border-[#1F1F1F] flex flex-col pt-6 pb-6 shadow-xl z-30">
      <div className="px-6 mb-10 flex items-center gap-2">
        <span className="font-display font-semibold text-xl text-primary-text tracking-tight">UCRIS</span>
        <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group ${isActive ? "text-primary-text" : "text-secondary-text hover:text-primary-text hover:bg-[#171717]"}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebarActive" 
                  className="absolute inset-0 bg-primary/5 rounded-lg border-l-2 border-primary z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={18} className={`relative z-10 ${isActive ? "text-primary" : "text-muted-text group-hover:text-secondary-text"}`} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 space-y-1 mt-auto">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group ${isActive ? "text-primary-text" : "text-secondary-text hover:text-primary-text hover:bg-[#171717]"}`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/5 rounded-lg border-l-2 border-primary z-0" />
              )}
              <item.icon size={18} className={`relative z-10 ${isActive ? "text-primary" : "text-muted-text group-hover:text-secondary-text"}`} />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="px-6 mt-6 flex items-center gap-3 w-full">
        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold font-sans text-sm">
          JD
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-text leading-none mb-1">Jane Doe</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-risk-low"></div>
            <p className="text-[10px] uppercase tracking-wider text-muted-text font-bold">Risk Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
