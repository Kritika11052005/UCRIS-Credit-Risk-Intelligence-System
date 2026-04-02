"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BarChart2, ShieldAlert, Cpu, GitBranch, Database, Zap, Sparkles } from "lucide-react";

export function AboutSection() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Slide in text
    gsap.fromTo(textRef.current,
      { x: -60, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 75%" }
      }
    );

    // Initial stagger fan-out for cards is possible, or we CSS hover it
  }, []);

  return (
    <section id="about" ref={containerRef} className="relative w-full py-32 px-6 bg-base">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div ref={textRef} className="w-full md:w-[60%] relative">
          <div className="absolute -top-10 -left-6 font-display font-bold text-[160px] text-primary/5 leading-none select-none z-0">
            02
          </div>
          <div className="relative z-10">
            <span className="text-[11px] font-sans text-primary tracking-widest font-bold uppercase mb-4 block">About</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-text mb-6">
              Built for financial institutions that need to act before default
            </h2>
            <p className="font-sans text-lg text-secondary-text leading-relaxed max-w-xl mb-10">
              The time between the first sign of behavioral stress and actual default is critical. UCRIS gives your entire risk team the unified context they need to intervene effectively.
            </p>
            <div className="flex gap-8 border-t border-white/5 pt-6">
              <div>
                <p className="font-mono text-xl text-primary font-bold mb-1">30,000</p>
                <p className="font-sans text-xs text-muted-text uppercase tracking-wide">Customers Evaluated</p>
              </div>
              <div>
                <p className="font-mono text-xl text-secondary font-bold mb-1">Pending</p>
                <p className="font-sans text-xs text-muted-text uppercase tracking-wide">Utility Patent</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[40%] perspective-1000">
          <div ref={cardsRef} className="w-full max-w-[380px] mx-auto flex flex-col gap-5 mt-10 md:mt-0">
            {/* Card 1 */}
            <div className="glass p-6 rounded-xl border-l-[3px] border-l-risk-low z-30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)] bg-base/80">
              <h3 className="font-display font-bold text-lg mb-2">Financial Stress Detection</h3>
              <p className="font-sans text-sm text-secondary-text">Identify early warning signals through subtle changes in utilization patterns.</p>
            </div>
            {/* Card 2 */}
            <div className="glass p-6 rounded-xl border-l-[3px] border-l-risk-medium z-20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,179,8,0.15)] bg-base/80">
              <h3 className="font-display font-bold text-lg mb-2">Risk Escalation Prediction</h3>
              <p className="font-sans text-sm text-secondary-text">Distinguish temporary setbacks from accelerating structural default momentum.</p>
            </div>
             {/* Card 3 */}
             <div className="glass p-6 rounded-xl border-l-[3px] border-l-primary z-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] bg-base/80">
              <h3 className="font-display font-bold text-lg mb-2">Explainable AI Narratives</h3>
              <p className="font-sans text-sm text-secondary-text">Generate natural language reports detailing why the model reached its conclusion.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.fromTo(".feature-card",
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power2.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 75%" }
      }
    );
  }, []);

  const MagneticCard = ({ children, borderStyle }: { children: React.ReactNode, borderStyle: string }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.1s"
      });
    };

    const handleMouseLeave = () => {
      setStyle({
        transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)`,
        transition: "transform 0.5s ease-out"
      });
    };

    return (
      <div 
        ref={cardRef} 
        onMouseMove={handleMouseMove} 
        onMouseLeave={handleMouseLeave}
        style={style}
        className={`feature-card relative glass p-6 rounded-xl border-l-[3px] ${borderStyle} group hover:glow-orange cursor-default bg-surface/50`}
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
        <div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </div>
      </div>
    );
  };

  return (
    <section id="features" ref={containerRef} className="w-full py-24 px-6 bg-surface border-y border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <span className="text-[11px] font-sans text-primary tracking-widest font-bold uppercase mb-4 block">Features</span>
        <h2 className="font-display text-4xl font-bold text-primary-text mb-14 text-center">
          Everything your risk team needs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <MagneticCard borderStyle="border-l-indigo-500">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
              <Zap size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-primary-text mb-3">Behavioral Velocity</h3>
            <p className="font-sans text-sm text-secondary-text leading-relaxed">
              15 temporal features capturing payment trend, utilization rate of change, and repayment momentum over 6 months.
            </p>
          </MagneticCard>

          <MagneticCard borderStyle="border-l-primary">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
              <GitBranch size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-primary-text mb-3">Dual-Task Prediction</h3>
            <p className="font-sans text-sm text-secondary-text leading-relaxed">
              Stress classification (Low/Medium/High) and escalation prediction solved jointly in a single inference pass.
            </p>
          </MagneticCard>

          <MagneticCard borderStyle="border-l-secondary">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mb-4">
              <Cpu size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-primary-text mb-3">Hybrid Architecture</h3>
            <p className="font-sans text-sm text-secondary-text leading-relaxed">
              Random Forest + XGBoost probability outputs feed a shared neural encoder with dual output heads.
            </p>
          </MagneticCard>

          <MagneticCard borderStyle="border-l-risk-low">
            <div className="w-10 h-10 rounded-lg bg-risk-low/10 flex items-center justify-center text-risk-low mb-4">
              <BarChart2 size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-primary-text mb-3">Cross-Task Explainability</h3>
            <p className="font-sans text-sm text-secondary-text leading-relaxed">
              Bidirectional SHAP analysis proves genuine joint representation learning. XGB escalation features appear in stress rankings.
            </p>
          </MagneticCard>

          <MagneticCard borderStyle="border-l-primary">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Sparkles size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-primary-text mb-3">RAG Chatbot</h3>
            <p className="font-sans text-sm text-secondary-text leading-relaxed">
              LangChain + Gemini 2.5 Flash chatbot grounded in real customer data. Ask questions directly about your portfolio.
            </p>
          </MagneticCard>

          <MagneticCard borderStyle="border-l-risk-critical">
            <div className="w-10 h-10 rounded-lg bg-risk-critical/10 flex items-center justify-center text-risk-critical mb-4">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg text-primary-text mb-3">Patent-Pending</h3>
            <p className="font-sans text-sm text-secondary-text leading-relaxed">
              The first formal dual-task post-loan monitoring formulation. Provisional patent filed. IEEE paper submitted.
            </p>
          </MagneticCard>
        </div>
      </div>
    </section>
  );
}

export function PipelineSection() {
  const containerRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (pathRef.current && containerRef.current) {
      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "bottom 80%",
          scrub: true,
        }
      });
      
      const nodes = gsap.utils.toArray(".pipeline-node");
      nodes.forEach((node: any) => {
        ScrollTrigger.create({
          trigger: node,
          start: "top 60%",
          onEnter: () => node.classList.add("ring-4", "ring-primary/30", "bg-primary"),
          onLeaveBack: () => node.classList.remove("ring-4", "ring-primary/30", "bg-primary"),
        });
      });

      gsap.fromTo(".pipeline-card",
        { x: 40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.6,
          stagger: {
            amount: 1,
            from: "start"
          },
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
            end: "bottom 80%",
            scrub: 1
          }
        }
      );
    }
  }, []);

  const steps = [
    { icon: <Database size={16} />, title: "Raw Transaction Data", desc: "6 months of PAY status, bills, and payments. Zero missing values." },
    { icon: <Cpu size={16} />, title: "Feature Engineering", desc: "15 behavioral velocity features computed dynamically." },
    { icon: <GitBranch size={16} />, title: "Stage-1 Tree Models", desc: "Random Forest & XGBoost outputs become inputs." },
    { icon: <Zap size={16} />, title: "Hybrid Joint Encoder", desc: "19-dimensional hybrid input feeds a shared neural encoder." },
    { icon: <ShieldAlert size={16} />, title: "Risk Profile Output", desc: "Stress level + escalation flag + SHAP + Gemini narrative." }
  ];

  return (
    <section id="pipeline" ref={containerRef} className="w-full py-32 px-6 bg-base">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <span className="text-[11px] font-sans text-primary tracking-widest font-bold uppercase mb-4 block">Pipeline</span>
        <h2 className="font-display text-4xl font-bold text-primary-text mb-20 text-center">
          From raw data to risk action
        </h2>

        <div className="relative w-full flex">
          {/* Animated line */}
          <div className="absolute left-8 top-0 bottom-0 w-8 z-0 hidden md:block">
            <svg height="100%" width="100%" preserveAspectRatio="none">
              <path ref={pathRef} d="M 16 0 L 16 1000" fill="none" stroke="#F97316" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          <div className="w-full pl-0 md:pl-24 space-y-16">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col md:flex-row items-start md:items-center gap-6 z-10 w-full">
                <div className="pipeline-node absolute -left-[75px] w-10 h-10 rounded-full border-2 border-primary bg-base flex flex-col items-center justify-center text-primary transition-all duration-300 hidden md:flex font-mono text-sm">
                  {idx + 1}
                </div>
                <div className="pipeline-card w-full glass p-6 rounded-xl flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-primary-text mb-1">{step.title}</h3>
                    <p className="font-sans text-sm text-secondary-text">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#0A0A0A] pt-16 pb-8 px-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between mb-16 gap-8">
        <div className="max-w-xs">
          <div className="font-display font-semibold text-2xl text-primary-text flex items-center gap-2 tracking-tight mb-4">
            UCRIS
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
          </div>
          <p className="text-secondary-text text-sm">Post-loan behavioral risk intelligence.</p>
        </div>
        <div className="flex gap-16 text-sm">
          <div className="flex flex-col gap-3">
            <span className="text-primary-text font-bold mb-1">Product</span>
            <a href="#" className="text-muted-text hover:text-primary transition-colors">Dashboard</a>
            <a href="#features" className="text-muted-text hover:text-primary transition-colors">Features</a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-primary-text font-bold mb-1">Research</span>
            <a href="#" className="text-muted-text hover:text-primary transition-colors">Whitepaper</a>
            <a href="#" className="text-muted-text hover:text-primary transition-colors">Patent Info</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-text">
        <div>&copy; 2026 UCRIS. All rights reserved.</div>
        <div className="flex items-center gap-1.5">
          Made with <svg className="w-4 h-4 text-risk-critical animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> by
          <span className="text-secondary-text ml-1 flex items-center gap-2">
            <a href="https://github.com/Kritika11052005" target="_blank" rel="noopener noreferrer" className="hover:text-primary pl-1 border-l border-white/10 ml-2">Kritika Benjwal</a> &amp;
            <a href="#" className="hover:text-primary">Gauri Sharma</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
