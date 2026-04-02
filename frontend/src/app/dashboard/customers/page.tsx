"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";

const mockCustomers = [
  { id: "C-9428", limit: 350000, age: 34, stress: "High", esc: "Escalating", action: "Restructure", date: "2026-03-22", util: 0.88, delay: 2.4, shaps: [{ f: "util_change", val: 0.42 }, { f: "pay_delay_trend", val: 0.35 }] },
  { id: "C-2150", limit: 120000, age: 41, stress: "Medium", esc: "Stable", action: "Alert", date: "2026-03-20", util: 0.65, delay: 0.8, shaps: [{ f: "spending_vol", val: 0.22 }] },
  { id: "C-1102", limit: 500000, age: 55, stress: "Low", esc: "Stable", action: "Monitor", date: "2026-03-25", util: 0.15, delay: 0, shaps: [{ f: "avg_pay_amt", val: 0.12 }] },
];

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  return (
    <div className="w-full flex">
      {/* Main Table Content */}
      <div className={`w-full transition-all duration-300 ${selectedCustomer ? "pr-[480px]" : ""}`}>

        {/* Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              type="text"
              placeholder="Search by customer ID..."
              className="pl-9 pr-4 py-2 rounded-lg bg-[#111111] border border-[#1F1F1F] text-sm text-primary-text w-[300px] focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex bg-[#111111] p-1 rounded-lg border border-[#1F1F1F]">
            <button className="px-4 py-1.5 rounded-md text-xs font-medium bg-primary text-inverse">All</button>
            <button className="px-4 py-1.5 rounded-md text-xs font-medium text-secondary-text hover:text-primary-text">High Stress</button>
            <button className="px-4 py-1.5 rounded-md text-xs font-medium text-secondary-text hover:text-primary-text">Escalating</button>
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-[#111111]/50 text-xs text-muted-text uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Ref ID</th>
                <th className="px-6 py-4 font-medium">Credit Limit</th>
                <th className="px-6 py-4 font-medium">Stress</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockCustomers.map((cust, i) => (
                <tr key={i} className="hover:bg-[#111111] transition-colors group cursor-pointer" onClick={() => setSelectedCustomer(cust)}>
                  <td className="px-6 py-4 font-mono text-primary-text">{cust.id}</td>
                  <td className="px-6 py-4 font-mono">${cust.limit.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${cust.stress === 'High' ? 'bg-risk-critical/10 text-risk-critical border-risk-critical/20' : cust.stress === 'Medium' ? 'bg-risk-medium/10 text-risk-medium border-risk-medium/20' : 'bg-risk-low/10 text-risk-low border-risk-low/20'}`}>
                      {cust.stress}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-xs text-secondary-text">{cust.action}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded bg-[#171717] border border-[#1F1F1F] text-secondary-text hover:bg-primary/20 hover:text-primary transition-colors text-xs">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="fixed top-0 right-0 bottom-0 w-[480px] bg-[#111111] border-l border-[#1F1F1F] shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-40 overflow-y-auto"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#111111]/90 backdrop-blur z-10">
              <div>
                <h2 className="font-display font-semibold text-xl text-primary-text">{selectedCustomer.id}</h2>
                <p className="text-secondary-text text-xs space-x-2">
                  <span>Age: {selectedCustomer.age}</span>
                  <span className="text-white/20">|</span>
                  <span className="font-mono">Limit: ${selectedCustomer.limit.toLocaleString()}</span>
                </p>
              </div>
              <button
                aria-label="Close"
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center text-muted-text hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-muted-text uppercase font-semibold">Avg Utilization</p>
                  <p className="font-mono text-xl text-primary-text mt-1">{(selectedCustomer.util * 100).toFixed(0)}%</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-muted-text uppercase font-semibold">Pay Delay Trend</p>
                  <p className="font-mono text-xl text-risk-escalating mt-1">+{selectedCustomer.delay} months</p>
                </div>
              </div>

              <div className="glass p-5 rounded-xl border border-risk-critical/20 bg-risk-critical/5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-risk-critical" size={18} />
                  <h3 className="font-display font-bold text-risk-critical">Risk Prediction</h3>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-sm font-sans text-secondary-text">Escalation Probability</p>
                    <p className="font-mono text-3xl font-light text-primary-text mt-1">84.2%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-sans text-secondary-text">Recommended Action</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-risk-critical text-inverse font-bold text-xs rounded-sm shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                      RESTRUCTURE
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-text uppercase font-semibold mb-3">AI Narrative</p>
                  <p className="text-sm text-secondary-text leading-relaxed font-sans bg-[#0D0D0D]/50 p-4 rounded-lg border border-white/5 italic">
                    "Customer shows a rapid 42% increase in utilization over the last 6 months combined with a decaying repayment ratio. The model flags high structural stress with a strong probability of imminent default due to consecutive minimum payments."
                  </p>
                </div>

                <button className="w-full mt-6 py-2.5 bg-primary/10 text-primary font-semibold text-sm rounded-lg hover:bg-primary hover:text-inverse transition-colors border border-primary/20">
                  Run New Prediction
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
