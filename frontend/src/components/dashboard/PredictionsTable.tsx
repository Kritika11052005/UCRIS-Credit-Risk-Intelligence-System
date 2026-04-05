"use client";

import React, { useState } from "react";
import { Search, ArrowUpDown, ChevronRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

type PredictionRecord = {
  id: string;
  customerRef: string;
  stress: "Low" | "Medium" | "High";
  escalationProb: number;
  isEscalating: boolean;
  action: string;
  analyst: string;
  date: string;
  time: string;
};

export function PredictionsTable({ data }: { data: PredictionRecord[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = data.filter(p => 
    p.customerRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Table Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
          <input
            type="text"
            placeholder="Search by ID or Action..."
            className="pl-9 pr-4 py-2 rounded-lg bg-[#111111] border border-[#1F1F1F] text-sm text-primary-text w-64 focus:outline-none focus:border-primary/50 transition-all font-sans"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-[#111111]/50 text-[10px] text-muted-text uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Escalation Risk</th>
                <th className="px-6 py-4">Recommended Action</th>
                <th className="px-6 py-4">Analyst</th>
                <th className="px-6 py-4 text-right">Processed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((pred) => (
                <tr key={pred.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-primary-text">{pred.customerRef}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                      pred.stress === 'Low' ? 'bg-risk-low/10 text-risk-low border-risk-low/20' : 
                      pred.stress === 'Medium' ? 'bg-risk-medium/10 text-risk-medium border-risk-medium/20' :
                      'bg-risk-critical/10 text-risk-critical border-risk-critical/20'
                    }`}>
                      {pred.stress.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                      <div className="flex justify-between items-center text-[10px]">
                         <span className={pred.isEscalating ? 'text-risk-escalating' : 'text-muted-text'}>{pred.isEscalating ? 'ESCALATING' : 'STABLE'}</span>
                         <span className="text-primary-text">{(pred.escalationProb * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pred.escalationProb * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          className={`h-full rounded-full transition-all duration-1000 ${pred.isEscalating ? 'bg-risk-escalating' : 'bg-primary'}`}
                        ></motion.div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold ${
                      pred.action === 'Monitor' ? 'text-secondary-text' : 
                      pred.action === 'Alert' ? 'text-risk-medium' :
                      'text-risk-critical'
                    }`}>
                      {pred.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-secondary-text text-xs italic">{pred.analyst}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                       <span className="text-primary-text text-xs">{pred.date}</span>
                       <span className="text-muted-text text-[10px]">{pred.time}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
             <div className="py-20 text-center text-muted-text">
                <p className="text-sm">No predictions found matching your search.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
