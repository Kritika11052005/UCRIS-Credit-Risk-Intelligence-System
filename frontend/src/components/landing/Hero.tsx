"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { HeroCanvas } from "./HeroCanvas";

export function Hero() {
  const headlineLine1Ref = useRef<HTMLDivElement>(null);
  const headlineLine2Ref = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaBtn1Ref = useRef<HTMLAnchorElement>(null);
  const ctaBtn2Ref = useRef<HTMLAnchorElement>(null);
  const statCard1Ref = useRef<HTMLDivElement>(null);
  const statCard2Ref = useRef<HTMLDivElement>(null);
  const statCard3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Custom SplitText equivalent
    const splitText = (element: HTMLElement | null) => {
      if (!element) return [];
      const text = element.textContent || "";
      element.textContent = "";
      const chars = text.split("").map((char) => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.display = "inline-block";
        element.appendChild(span);
        return span;
      });
      return chars;
    };

    const chars1 = splitText(headlineLine1Ref.current);
    const chars2 = splitText(headlineLine2Ref.current);

    gsap.set(chars1, { y: 60, opacity: 0, rotationZ: 8 });
    gsap.set(chars2, { y: 60, opacity: 0, rotationZ: 8 });

    // Entrance: Hero badge
    tl.fromTo(badgeRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      0.6
    );

    // Headline Line 1
    tl.to(chars1, {
      y: 0,
      opacity: 1,
      rotationZ: 0,
      stagger: 0.025,
      ease: "power4.out",
      duration: 1
    }, 0.2);

    // Headline Line 2
    tl.to(chars2, {
      y: 0,
      opacity: 1,
      rotationZ: 0,
      stagger: 0.025,
      ease: "power4.out",
      duration: 1
    }, 0.5);

    // Subheadline
    tl.fromTo(subheadRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      0.9
    );

    // CTAs
    tl.fromTo([ctaBtn1Ref.current, ctaBtn2Ref.current],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      1.1
    );

    // Stat Pills Entrance
    tl.fromTo([statCard1Ref.current, statCard2Ref.current, statCard3Ref.current],
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" },
      1.3
    );

    // Number Counting Effect
    const nums = document.querySelectorAll<HTMLElement>('.hero-num');
    nums.forEach(num => {
      const targetStr = num.getAttribute("data-target") || "0";
      const target = parseFloat(targetStr);
      const isFloat = targetStr.includes(".");
      const duration = 2;
      gsap.to(num, {
        innerText: target,
        duration: duration,
        delay: 1.5,
        ease: "power2.out",
        snap: { innerText: isFloat ? 0.0001 : 1 },
        onUpdate: function () {
          const val = parseFloat(num.innerText);
          if (isFloat) {
            num.innerText = val.toFixed(4);
          } else {
            num.innerText = Math.round(val).toLocaleString();
          }
        }
      });
    });

  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center">
      <HeroCanvas />

      {/* Noise grain overlay */}
      <svg className="noise-overlay" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)"></rect>
      </svg>

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20">

        {/* Badge */}
        <div ref={badgeRef} className="opacity-0 mb-6 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-sans font-medium text-primary tracking-wide">
            Patent Pending &nbsp;&middot;&nbsp; IEEE Research &nbsp;&middot;&nbsp; 0.9920 Score
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold text-[44px] md:text-[72px] leading-[1.05] tracking-tight mb-6 flex flex-col items-center">
          <div ref={headlineLine1Ref} className="overflow-hidden inline-block text-primary-text">
            Predict Risk
          </div>
          <div className="overflow-hidden inline-block">
            <span ref={headlineLine2Ref} className="text-[#FBBF24] pb-2">Before Default Happens</span>
          </div>
        </h1>

        {/* Subhead */}
        <p ref={subheadRef} className="opacity-0 max-w-xl text-base md:text-lg text-secondary-text leading-relaxed mb-10 font-sans">
          UCRIS monitors post-loan customer behavior continuously, detecting financial stress and escalation risk using hybrid tree-neural AI with explainable predictions and LLM-generated narratives.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <a ref={ctaBtn1Ref} href="/dashboard" className="opacity-0 px-7 py-3 rounded-lg bg-primary text-white font-semibold transition-all duration-200 hover:scale-[1.02] hover:bg-[#EA6C0A] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]">
            Open Dashboard
          </a>
          <a ref={ctaBtn2Ref} href="#research" className="opacity-0 px-7 py-3 rounded-lg border border-white/15 text-secondary-text font-medium hover:border-primary/40 hover:text-primary-text transition-colors duration-200 glass">
            Read the Paper
          </a>
        </div>

        {/* Stat Pills */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <div ref={statCard1Ref} className="opacity-0 glass px-5 py-3 flex flex-col items-center justify-center rounded-xl min-w-[140px]">
            <span className="hero-num font-mono text-secondary text-lg mb-0.5" data-target="0.9852">0.0000</span>
            <span className="font-sans text-[11px] text-muted-text uppercase tracking-wider">Task A F1</span>
          </div>
          <div ref={statCard2Ref} className="opacity-0 glass px-5 py-3 flex flex-col items-center justify-center rounded-xl min-w-[140px]">
            <span className="hero-num font-mono text-secondary text-lg mb-0.5" data-target="0.9989">0.0000</span>
            <span className="font-sans text-[11px] text-muted-text uppercase tracking-wider">Task B Recall</span>
          </div>
          <div ref={statCard3Ref} className="opacity-0 glass px-5 py-3 flex flex-col items-center justify-center rounded-xl min-w-[140px]">
            <span className="font-mono text-secondary text-lg mb-0.5">
              <span className="hero-num" data-target="3">0</span> in 6,000
            </span>
            <span className="font-sans text-[11px] text-muted-text uppercase tracking-wider">Missed Escalations</span>
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 animate-bounce">
        <span className="text-[11px] text-muted-text font-sans mb-2">Scroll to explore</span>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-muted-text">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

    </section>
  );
}
