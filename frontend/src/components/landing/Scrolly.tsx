"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Scrolly() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const panels = gsap.utils.toArray(".scrolly-panel") as HTMLElement[];
    const container = containerRef.current;
    
    if (!container || !panels.length) return;

    // Pinning and horizontal scroll
    const tl = gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        snap: 1 / (panels.length - 1),
        end: () => "+=" + container.offsetWidth * (panels.length - 1)
      }
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden bg-base">
      <div 
        ref={panelsRef}
        className="flex w-[500vw] h-full"
      >
        {/* Panel 1: The Problem */}
        <div className="scrolly-panel w-screen h-full flex items-center justify-center px-12 md:px-24">
          <div className="flex w-full max-w-6xl items-center gap-16">
            <div className="hidden md:block w-1/3">
              <span className="font-display font-bold text-[200px] leading-none text-primary/10 tracking-tighter">01</span>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-primary-text">Banks are flying blind</h2>
              <p className="text-lg text-secondary-text leading-relaxed font-sans md:max-w-xl">
                Credit risk is assessed once at loan approval. After that, banks have no visibility into behavioral change. By the time a customer misses a payment, the cost of recovery has already escalated.
              </p>
              <div className="mt-12 p-6 glass rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                  <div className="h-full bg-risk-critical w-1/4 translate-x-[300%]" />
                </div>
                <div className="flex justify-between items-center text-sm font-mono text-muted-text mt-2">
                  <span>Month 1</span>
                  <span className="text-risk-critical">Default (Month 7)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: The Signal */}
        <div className="scrolly-panel w-screen h-full flex items-center justify-center px-12 md:px-24">
           <div className="flex w-full max-w-6xl items-center gap-16">
            <div className="w-full md:w-1/2">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-primary-text">Behavior leaves a trace</h2>
              <p className="text-lg text-secondary-text leading-relaxed font-sans">
                Six months of payment behavior contains the early warning signal. UCRIS extracts 15 behavioral velocity features that capture the direction and rate of change — not just the current state.
              </p>
            </div>
            <div className="w-full md:w-1/2 glass p-8 rounded-2xl h-[300px] flex items-center justify-center relative">
               {/* Simplified animated chart representing crossing paths */}
               <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
                  <path d="M 0 150 Q 150 150 200 100 T 400 20" fill="none" stroke="#F97316" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]" strokeDasharray="500" strokeDashoffset="0"/>
                  <path d="M 0 50 Q 150 50 200 100 T 400 180" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="500" strokeDashoffset="0"/>
                  <circle cx="200" cy="100" r="6" fill="#0D0D0D" stroke="#FBBF24" strokeWidth="3" className="drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"/>
                  <text x="215" y="95" fill="#FBBF24" fontSize="12" fontFamily="JetBrains Mono">Risk Threshold</text>
               </svg>
            </div>
          </div>
        </div>

        {/* Panel 3: Architecture */}
        <div className="scrolly-panel w-screen h-full flex items-center justify-center px-12 md:px-24">
           <div className="flex w-full max-w-6xl items-center gap-16 flex-col">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-2 text-primary-text self-start">Hybrid Tree-Neural Stacking</h2>
              <p className="text-lg text-secondary-text leading-relaxed font-sans max-w-3xl self-start mb-12">
                The first system to simultaneously solve stress classification and escalation prediction using a single shared behavioral representation.
              </p>
              {/* Architecture Diagram */}
              <div className="flex items-center gap-4 text-center font-mono text-xs w-full max-w-4xl justify-between">
                <div className="glass p-4 rounded-lg text-secondary-text border-white/10">Raw Data</div>
                <div className="flex-1 h-px bg-primary/30" />
                <div className="glass p-4 rounded-lg text-primary border-primary/20 bg-primary/5">RF + XGBoost<br/>Probs</div>
                <div className="flex-1 h-px bg-primary/30" />
                <div className="glass p-6 rounded-xl border-secondary/30 bg-secondary/10 text-secondary glow-orange">Shared Neural Encoder<br/>[19-dim]</div>
                <div className="flex-1 h-px bg-primary/30" />
                <div className="flex flex-col gap-4">
                  <div className="glass p-3 rounded-lg border-risk-high/30 text-risk-high">Stress Head</div>
                  <div className="glass p-3 rounded-lg border-risk-escalating/30 text-risk-escalating">Escalation Head</div>
                </div>
              </div>
           </div>
        </div>

        {/* Panel 4: The Proof */}
        <div className="scrolly-panel w-screen h-full flex items-center justify-center px-12 md:px-24">
           <div className="flex w-full max-w-6xl flex-col items-center gap-12">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-text">Validated on 30,000 customers</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                <div className="glass p-8 rounded-2xl flex flex-col border-b-4 border-b-risk-medium glow-orange">
                  <span className="font-mono text-4xl text-secondary mb-2">0.9852</span>
                  <span className="font-sans text-sm text-secondary-text">Weighted F1</span>
                </div>
                <div className="glass p-8 rounded-2xl flex flex-col border-b-4 border-b-primary glow-orange">
                  <span className="font-mono text-4xl text-primary mb-2">0.9989</span>
                  <span className="font-sans text-sm text-secondary-text">Recall</span>
                </div>
                <div className="glass p-8 rounded-2xl flex flex-col border-b-4 border-b-risk-medium glow-orange">
                  <span className="font-mono text-4xl text-secondary mb-2">0.9920</span>
                  <span className="font-sans text-sm text-secondary-text">Combined Score</span>
                </div>
                <div className="glass p-8 rounded-2xl flex flex-col border-b-4 border-b-risk-critical hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all">
                  <span className="font-mono text-4xl text-risk-critical mb-2">3 <span className="text-lg text-muted-text">/ 6,000</span></span>
                  <span className="font-sans text-sm text-secondary-text">Missed Escalations</span>
                </div>
              </div>
           </div>
        </div>

        {/* Panel 5: The Action */}
        <div className="scrolly-panel w-screen h-full flex flex-col items-center justify-center px-12 md:px-24">
           <div className="w-full max-w-6xl mb-12">
             <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-primary-text">From prediction to action</h2>
             <p className="text-lg text-secondary-text leading-relaxed font-sans max-w-2xl">
                UCRIS delivers a four-part risk profile: stress level, escalation flag, recommended action, and a Gemini-generated narrative for the credit officer.
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
              <div className="glass p-8 rounded-xl border border-risk-low/20 bg-risk-low/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-risk-low"></div>
                  <span className="font-sans font-medium text-risk-low">Monitor</span>
                </div>
                <p className="font-mono text-sm text-muted-text uppercase mb-2">Conditions:</p>
                <div className="text-sm font-sans text-primary-text space-y-1">
                  <div>• LOW Stress</div>
                  <div>• STABLE Profile</div>
                </div>
              </div>

              <div className="glass p-8 rounded-xl border border-risk-medium/20 bg-risk-medium/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-risk-medium"></div>
                  <span className="font-sans font-medium text-risk-medium">Alert</span>
                </div>
                <p className="font-mono text-sm text-muted-text uppercase mb-2">Conditions:</p>
                <div className="text-sm font-sans text-primary-text space-y-1">
                  <div>• MEDIUM / HIGH Stress</div>
                  <div>• STABLE Profile</div>
                </div>
              </div>

              <div className="glass p-8 rounded-xl border border-risk-critical/30 bg-risk-critical/10 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-risk-critical animate-pulse"></div>
                  <span className="font-sans font-bold text-risk-critical">Restructure</span>
                </div>
                <p className="font-mono text-sm text-risk-critical/60 uppercase mb-2">Conditions:</p>
                <div className="text-sm font-sans text-primary-text space-y-1">
                  <div>• HIGH Stress</div>
                  <div>• ESCALATING Profile</div>
                </div>
              </div>
           </div>

           <div className="w-full max-w-6xl mt-12 flex justify-start">
             <a href="/dashboard" className="px-6 py-3 rounded-lg text-primary font-medium hover:text-primary-text flex items-center gap-2 group transition-colors">
               See it in action 
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </a>
           </div>
        </div>

      </div>
    </section>
  );
}
