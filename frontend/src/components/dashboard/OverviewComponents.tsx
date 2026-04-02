"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Users, AlertTriangle, TrendingUp, ShieldAlert } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function StatCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Number countUp animation
    const numbers = gsap.utils.toArray(".count-up") as HTMLElement[];
    numbers.forEach((num) => {
      const targetStr = num.getAttribute("data-target") || "0";
      const target = parseFloat(targetStr.replace(/,/g, ''));
      const isFloat = targetStr.includes(".");
      
      gsap.to(num, {
        innerText: target,
        duration: 1.5,
        ease: "power2.out",
        snap: { innerText: isFloat ? 0.001 : 1 },
        onUpdate: function() {
          num.innerText = isFloat 
            ? parseFloat(num.innerText).toFixed(4)
            : Math.round(parseFloat(num.innerText)).toLocaleString();
        }
      });
    });

    // Stagger entrance
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children,
        { scale: 0.95, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 mt-2">
      <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between h-[130px]">
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-text uppercase tracking-widest font-sans font-semibold">Total Customers</span>
          <Users size={16} className="text-muted-text" />
        </div>
        <div className="flex items-end justify-between">
          <span className="count-up font-mono text-3xl text-primary-text" data-target="30000">0</span>
          <span className="text-[11px] font-sans text-risk-low bg-risk-low/10 px-2 py-0.5 rounded border border-risk-low/20">+12%</span>
        </div>
      </div>

      <div className="glass p-5 rounded-xl border-risk-critical/30 shadow-[0_0_15px_rgba(239,68,68,0.05)] flex flex-col justify-between h-[130px]">
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-text uppercase tracking-widest font-sans font-semibold">High Stress</span>
          <AlertTriangle size={16} className="text-risk-critical" />
        </div>
        <div className="flex items-end justify-between">
          <span className="count-up font-mono text-3xl text-primary-text" data-target="1420">0</span>
          <span className="text-[11px] font-sans text-risk-critical bg-risk-critical/10 px-2 py-0.5 rounded border border-risk-critical/20">+5%</span>
        </div>
      </div>

      <div className="glass p-5 rounded-xl border-risk-escalating/30 shadow-[0_0_15px_rgba(249,115,22,0.05)] flex flex-col justify-between h-[130px]">
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-text uppercase tracking-widest font-sans font-semibold">Escalating</span>
          <TrendingUp size={16} className="text-risk-escalating" />
        </div>
        <div className="flex items-end justify-between">
          <span className="count-up font-mono text-3xl text-primary-text" data-target="842">0</span>
          <span className="text-[11px] font-sans text-risk-escalating bg-risk-escalating/10 px-2 py-0.5 rounded border border-risk-escalating/20">+18%</span>
        </div>
      </div>

      <div className="glass p-5 rounded-xl border-secondary/30 shadow-[0_0_15px_rgba(251,191,36,0.05)] flex flex-col justify-between h-[130px]">
        <div className="flex justify-between items-start">
          <span className="text-xs text-muted-text uppercase tracking-widest font-sans font-semibold">Restructure Req.</span>
          <ShieldAlert size={16} className="text-secondary" />
        </div>
        <div className="flex items-end justify-between">
          <span className="count-up font-mono text-3xl text-primary-text" data-target="315">0</span>
          <span className="text-[11px] font-sans text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">-2%</span>
        </div>
      </div>
    </div>
  );
}

const mockEscalationData = Array.from({ length: 30 }).map((_, i) => ({
  date: `2025-10-${(i + 1).toString().padStart(2, '0')}`,
  count: Math.floor(Math.random() * 40) + 20 + i * 1.5
}));

export function DashboardCharts() {
  const donutRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animation for entire section
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.3 }
      );
    }

    if (donutRef.current) {
      const paths = donutRef.current.querySelectorAll("path");
      paths.forEach((path, i) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power3.out",
          delay: 0.5 + i * 0.2
        });
      });
    }
  }, []);

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Donut Chart */}
      <div className="glass p-6 rounded-xl flex flex-col items-center">
        <h3 className="font-display text-sm font-semibold text-secondary-text mb-6 w-full text-left">Stress Distribution</h3>
        <div className="relative w-[180px] h-[180px]">
          <svg ref={donutRef} viewBox="0 0 100 100" className="w-full h-full -rotate-90">
             {/* Background circle */}
             <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1F1F1F" strokeWidth="12" />
             {/* Low Stress (Green) - ~70% */}
             <path d="M 50 10 A 40 40 0 1 1 11.23 60" fill="transparent" stroke="#22C55E" strokeWidth="12" />
             {/* Medium Stress (Amber) - ~20% */}
             {/* (starts at previous end) */}
             <path d="M 11.23 60 A 40 40 0 0 1 18.23 25" fill="transparent" stroke="#FBBF24" strokeWidth="12" />
             {/* High Stress (Red) - ~10% */}
             <path d="M 18.23 25 A 40 40 0 0 1 50 10" fill="transparent" stroke="#EF4444" strokeWidth="12" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="font-mono text-2xl text-primary-text">30K</span>
            <span className="font-sans text-[10px] text-muted-text uppercase">Total</span>
          </div>
        </div>
        <div className="w-full flex justify-between mt-6 px-2 text-xs font-sans">
           <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-risk-low"></div><span className="text-muted-text">70%</span></div>
           <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-risk-medium"></div><span className="text-muted-text">20%</span></div>
           <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-risk-critical"></div><span className="text-muted-text">10%</span></div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="md:col-span-2 glass p-6 rounded-xl flex flex-col">
        <h3 className="font-display text-sm font-semibold text-secondary-text mb-6">Escalation Trend (30 Days)</h3>
        <div className="flex-1 w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockEscalationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
              <XAxis dataKey="date" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(str) => str.split("-")[2]} />
              <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(17,17,17,0.9)', border: '1px solid rgba(249,115,22,0.4)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                itemStyle={{ color: '#F97316', fontWeight: 'bold' }}
                labelStyle={{ color: '#A3A3A3', marginBottom: '4px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="count" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 4, strokeWidth: 0, fill: '#F97316' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const mockPredictions = [
  { id: "C-9428", stress: "High", esc: "Escalating", action: "Restructure", conf: "94%", date: "2 mins ago" },
  { id: "C-2150", stress: "Medium", esc: "Stable", action: "Alert", conf: "88%", date: "15 mins ago" },
  { id: "C-1102", stress: "Low", esc: "Stable", action: "Monitor", conf: "99%", date: "1 hour ago" },
  { id: "C-8841", stress: "High", esc: "Stable", action: "Alert", conf: "82%", date: "2 hours ago" },
  { id: "C-3392", stress: "High", esc: "Escalating", action: "Restructure", conf: "91%", date: "3 hours ago" },
];

export function RecentTable() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
        gsap.fromTo(containerRef.current.querySelectorAll("tbody tr"),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.6 }
        );
    }
  }, []);

  return (
    <div ref={containerRef} className="glass rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-display text-sm font-semibold text-secondary-text">Recent Predictions</h3>
        <a href="/dashboard/predictions" className="text-xs text-primary hover:underline">View All</a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-sm">
          <thead className="bg-[#111111]/50 text-xs text-muted-text uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Stress Level</th>
              <th className="px-6 py-4 font-medium">Escalation</th>
              <th className="px-6 py-4 font-medium">Action</th>
              <th className="px-6 py-4 font-medium">Confidence</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Run</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockPredictions.map((pred, i) => (
              <tr key={i} className="hover:bg-[#111111]/80 transition-colors group">
                <td className="px-6 py-4 font-mono text-primary-text">{pred.id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                    pred.stress === 'Low' ? 'bg-risk-low/10 text-risk-low border-risk-low/20' : 
                    pred.stress === 'Medium' ? 'bg-risk-medium/10 text-risk-medium border-risk-medium/20' :
                    'bg-risk-critical/10 text-risk-critical border-risk-critical/20'
                  }`}>{pred.stress}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                    pred.esc === 'Escalating' ? 'bg-risk-escalating/10 text-risk-escalating border border-risk-escalating/20' :
                    'text-muted-text bg-[#1A1A1A]'
                  }`}>{pred.esc}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                    pred.action === 'Monitor' ? 'text-secondary-text' : 
                    pred.action === 'Alert' ? 'text-risk-medium' :
                    'text-risk-critical drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  }`}>
                    {pred.action}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-secondary-text">{pred.conf}</td>
                <td className="px-6 py-4 text-muted-text text-xs">{pred.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="px-3 py-1.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-inverse transition-colors text-xs opacity-0 group-hover:opacity-100 focus:opacity-100">
                    Predict
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
