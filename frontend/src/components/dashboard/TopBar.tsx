"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, ChevronRight, User, AlertTriangle, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchCustomersAction, getRecentAlertsAction, markNotificationsAsReadAction } from "@/app/actions";
import { clsx } from "clsx";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State for Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // State for Notifications
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Quick breadcrumb logic
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

  // Debounced Search Handler
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchCustomersAction(searchQuery);
          setSearchResults(results);
          setIsSearchOpen(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Notifications
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getRecentAlertsAction();
        setAlerts(data);
        // Check if there are any unread notifications
        const unread = data.some((a: any) => !a.isRead);
        setHasUnread(unread);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      }
    };
    fetchAlerts();
  }, []);

  // Close on Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (customerId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/dashboard/customers?search=${customerId}`);
  };

  const clearNotifications = async () => {
    try {
      await markNotificationsAsReadAction();
      setHasUnread(false);
      // Optionally refresh the alerts list to show they are read
      const updatedAlerts = alerts.map(a => ({ ...a, isRead: true }));
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  return (
    <header className="h-[72px] flex items-center justify-between px-8 bg-base sticky top-0 z-40 border-b border-white/5">
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
        {/* Search Implementation */}
        <div className="relative group hidden md:block" ref={searchRef}>
          <Search size={16} className={clsx(
            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
            isSearching ? "text-primary animate-pulse" : "text-muted-text group-focus-within:text-primary"
          )} />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
            className="bg-[#171717] border border-[#1F1F1F] rounded-full pl-9 pr-4 py-1.5 text-sm text-primary-text focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all w-[240px]"
          />

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-[320px] glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
              >
                <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-text">Results</span>
                  <span className="text-[10px] text-primary/70">{searchResults.length} found</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar pt-1">
                  {searchResults.length > 0 ? (
                    searchResults.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => handleResultClick(res.id)}
                        className="w-full text-left p-3 hover:bg-white/5 rounded-xl transition-colors group flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-primary-text">{res.id}</span>
                          <span className={clsx(
                            "text-[10px] uppercase font-bold",
                            res.stress === 'High' ? "text-risk-critical" : res.stress === 'Medium' ? "text-risk-medium" : "text-risk-low"
                          )}>
                            {res.stress} Risk • {res.esc}
                          </span>
                        </div>
                        <ArrowRight size={14} className="text-muted-text opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs text-muted-text italic">No accounts match "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Implementation */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (!isNotificationsOpen) setHasUnread(false);
            }}
            aria-label="Notifications" 
            className={clsx(
              "relative transition-colors p-1 rounded-full",
              isNotificationsOpen ? "text-primary-text bg-white/5" : "text-muted-text hover:text-primary-text hover:bg-white/5"
            )}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute right-1 top-1 w-2 h-2 bg-primary rounded-full border border-base animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-[340px] glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary-text">Risk Alerts</h3>
                  <button onClick={clearNotifications} className="text-[10px] text-muted-text hover:text-primary-text transition-colors">Mark all as read</button>
                </div>
                <div className="max-h-[380px] overflow-y-auto pt-2 pb-2 px-2 space-y-1">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className="p-3 bg-white/[0.02] border border-white/[0.03] rounded-xl flex items-start gap-3 group hover:border-primary/20 transition-all cursor-default"
                      >
                        <div className={clsx(
                          "mt-1 p-1.5 rounded-lg",
                          alert.stress === 'High' ? "bg-risk-critical/10 text-risk-critical" : "bg-risk-escalating/10 text-risk-escalating"
                        )}>
                          <AlertTriangle size={14} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-sm font-bold text-primary-text leading-tight">{alert.title || alert.customerRef}</span>
                            <span className="text-[9px] font-mono text-muted-text shrink-0 pb-1">
                              {new Date(alert.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-text leading-tight mb-2">
                             {alert.message}
                          </p>
                          {alert.customerRef !== 'SYSTEM' && (
                            <button 
                              onClick={() => router.push(`/dashboard/customers?search=${alert.customerRef}`)}
                              className="text-[10px] text-primary font-bold flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              View Case Details <ChevronRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-xs text-muted-text italic">No new risk alerts</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white/2 border-t border-white/5 text-center">
                   <button className="text-[10px] font-bold text-muted-text hover:text-primary-text transition-colors uppercase tracking-widest">
                     View All Activity
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
