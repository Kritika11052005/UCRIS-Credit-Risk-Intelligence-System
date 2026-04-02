"use client";

import React, { useState } from "react";
import { Send, Bot, User, Trash2, PlusCircle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    
    // Simulate thinking delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Based on the 6-month transaction history and our tree-neural hybrid evaluation, this customer exhibits early stress signaling driven by a 22% increase in credit utilization and recent 15-day payment delays. I recommend placing them on the Alert list for manual monitoring." 
      }]);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 top-[72px] right-0 bottom-0 left-[240px] flex bg-[#0D0D0D]">
      {/* Left History Panel */}
      <div className="w-[320px] bg-[#111111] border-r border-[#1F1F1F] flex flex-col pt-6 pb-4">
        <div className="px-6 mb-6">
          <button 
            onClick={() => setMessages([])}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary/30 text-primary bg-primary/10 hover:bg-primary hover:text-inverse font-semibold transition-colors shadow-[0_0_15px_rgba(249,115,22,0.15)]"
          >
            <PlusCircle size={16} /> New Chat
          </button>
        </div>
        
        <div className="px-4 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-mono text-muted-text font-semibold uppercase px-2 mb-2">Today</p>
          <button className="text-left px-4 py-3 rounded-xl bg-surface border border-white/5 group hover:border-primary/20 transition-colors relative h-[72px] overflow-hidden">
            <h4 className="text-sm font-semibold text-primary-text mb-1 truncate pr-6">C-9428 Risk Escalation</h4>
            <p className="text-xs text-secondary-text truncate pr-6">Why is customer C-9428 flagged...</p>
            <Trash2 size={14} className="absolute top-4 right-4 text-muted-text opacity-0 group-hover:opacity-100 transition-opacity hover:text-risk-critical" />
          </button>
          
          <button className="text-left px-4 py-3 rounded-xl hover:bg-surface border border-transparent transition-colors opacity-60 hover:opacity-100">
            <h4 className="text-sm font-medium text-primary-text truncate">Utilization Trend Analysis</h4>
            <p className="text-xs text-muted-text truncate mt-1">Show customers with >50% util...</p>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 mt-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-8 glow-orange">
              <Bot size={32} />
            </div>
            <h2 className="font-display font-medium text-2xl text-primary-text mb-2 text-center">Ask me anything about your portfolio</h2>
            <p className="text-secondary-text text-sm mb-12 text-center max-w-md">The UCRIS assistant is powered by Gemini 2.5 and securely grounded in your proprietary NeonDB data.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
               <button onClick={() => setInput("Why is customer C-001 flagged as High stress?")} className="glass p-5 rounded-xl text-left group hover:border-primary/40 hover:bg-primary/5 transition-colors">
                  <Lightbulb size={18} className="text-primary mb-3" />
                  <p className="text-sm text-primary-text">"Why is customer C-001 flagged as High stress?"</p>
               </button>
               <button onClick={() => setInput("Which customers need immediate restructuring?")} className="glass p-5 rounded-xl text-left group hover:border-risk-critical/40 hover:bg-risk-critical/5 transition-colors">
                  <Lightbulb size={18} className="text-risk-critical mb-3" />
                  <p className="text-sm text-primary-text">"Which customers need immediate restructuring?"</p>
               </button>
               <button onClick={() => setInput("Explain what pay_delay_trend means in the context of Task A")} className="glass p-5 rounded-xl text-left group hover:border-secondary/40 hover:bg-secondary/5 transition-colors">
                  <Lightbulb size={18} className="text-secondary mb-3" />
                  <p className="text-sm text-primary-text">"Explain what pay_delay_trend means in the context of Task A"</p>
               </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col pb-[120px]">
            {messages.map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    m.role === 'user' ? 'bg-[#1F1F1F] text-primary-text' : 'bg-primary/20 border border-primary/30 text-primary'
                  }`}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-4 text-[15px] leading-relaxed rounded-2xl ${
                    m.role === 'user' 
                      ? 'bg-primary/10 border border-primary/30 text-primary-text rounded-tr-sm' 
                      : 'bg-surface border border-[#1F1F1F] text-secondary-text rounded-tl-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-base via-base to-transparent flex justify-center">
          <div className="w-full max-w-4xl relative group">
            <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
               placeholder="Chat with the UCRIS AI..."
               className="w-full bg-[#171717] border border-[#1F1F1F] rounded-2xl pl-5 pr-14 py-4 min-h-[60px] max-h-[200px] overflow-y-auto text-primary-text font-sans focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-xl resize-none"
               rows={1}
            />
            <button 
              onClick={handleSend}
              className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                input.trim() ? 'bg-primary text-inverse shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-[#1F1F1F] text-muted-text'
              }`}
            >
              <Send size={18} className={input.trim() ? "translate-x-[-1px] translate-y-[-1px]" : ""} />
            </button>
            <div className="absolute -bottom-5 right-4 text-[10px] text-muted-text font-mono">
              Cmd + Enter to send
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
