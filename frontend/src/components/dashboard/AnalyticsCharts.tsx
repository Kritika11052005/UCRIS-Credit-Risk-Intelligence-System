"use client";

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { TrendingUp, AlertCircle, ShieldCheck, Fingerprint } from "lucide-react";

type AnalyticsProps = {
  stress: { name: string; value: number; color: string }[];
  actions: { name: string; value: number }[];
  escalation: { name: string; value: number }[];
  totalCustomers: number;
  totalPredictions: number;
  escalationRate: number;
};

export function AnalyticsDashboard({ data }: { data: AnalyticsProps }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Customers" value={data.totalCustomers} icon={<Fingerprint size={16} />} color="text-primary-text" />
        <MetricCard title="Total Predictions" value={data.totalPredictions} icon={<ShieldCheck size={16} />} color="text-risk-low" />
        <MetricCard title="Escalation Rate" value={`${data.escalationRate}%`} icon={<TrendingUp size={16} />} color="text-risk-escalating" />
        <MetricCard title="Critical Alerts" value={data.stress.find(s => s.name === "High")?.value || 0} icon={<AlertCircle size={16} />} color="text-risk-critical" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Stress Distribution (Pie) */}
        <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col h-[400px]">
          <h3 className="font-display text-base font-semibold text-primary-text mb-6">Risk Profile Distribution</h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.stress}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1200}
                >
                  {data.stress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '12px', fontWeight: '500' }}
                  labelStyle={{ color: '#94A3B8', fontSize: '11px', marginBottom: '4px' }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-secondary-text">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended Actions (Bar) */}
        <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col h-[400px]">
          <h3 className="font-display text-base font-semibold text-primary-text mb-6">Recommendation Breakdown</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.actions} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '12px', fontWeight: '500' }}
                  labelStyle={{ color: '#94A3B8', fontSize: '11px', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]} 
                  animationDuration={1500}
                >
                  {data.actions.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Restructure' ? '#EF4444' : entry.name === 'Alert' ? '#FBBF24' : '#22C55E'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Escalation Risk (Bar Grouped) */}
      <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col h-[400px]">
        <h3 className="font-display text-base font-semibold text-primary-text mb-6">Account Stability Matrix</h3>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.escalation} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" horizontal={false} />
              <XAxis type="number" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(249,115,22,0.05)' }}
                contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#F8FAFC', fontSize: '12px', fontWeight: '500' }}
                labelStyle={{ color: '#94A3B8', fontSize: '11px', marginBottom: '4px' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={40}>
                 {data.escalation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Escalating' ? '#F97316' : '#525252'} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4 group hover:border-primary/20 transition-all cursor-default">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-text uppercase tracking-widest font-black font-sans">{title}</span>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-text group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {icon}
        </div>
      </div>
      <div className={`font-display text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
