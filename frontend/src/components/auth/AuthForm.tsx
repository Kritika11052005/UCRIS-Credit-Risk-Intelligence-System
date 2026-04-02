"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabPillRef = useRef<HTMLDivElement>(null);

  // Login form refs
  const loginFormRef = useRef<HTMLFormElement>(null);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register form refs
  const registerFormRef = useRef<HTMLFormElement>(null);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [regRole, setRegRole] = useState<"Analyst" | "Manager">("Analyst");
  const rolePillRef = useRef<HTMLDivElement>(null);
  const [passStrength, setPassStrength] = useState(0); // 0-100
  const passStrengthBarRef = useRef<HTMLDivElement>(null);

  // Tab switcher animation
  useEffect(() => {
    if (tabPillRef.current) {
      gsap.to(tabPillRef.current, {
        x: isLogin ? 0 : "100%",
        duration: 0.3,
        ease: "power2.out"
      });
    }

    if (loginFormRef.current && registerFormRef.current) {
      if (isLogin) {
        gsap.to(registerFormRef.current, { opacity: 0, x: 20, duration: 0.2, display: "none" });
        gsap.fromTo(loginFormRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, display: "block", delay: 0.1 });
      } else {
        gsap.to(loginFormRef.current, { opacity: 0, x: -20, duration: 0.2, display: "none" });
        gsap.fromTo(registerFormRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, display: "block", delay: 0.1 });
      }
    }
  }, [isLogin]);

  // Role switcher animation
  useEffect(() => {
    if (rolePillRef.current) {
      gsap.to(rolePillRef.current, {
        x: regRole === "Analyst" ? 0 : "100%",
        duration: 0.25,
        ease: "power2.out"
      });
    }
  }, [regRole]);

  // Password strength animation
  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = e.target.value;
    let s = 0;
    if (p.length > 5) s += 30;
    if (p.length > 8) s += 20;
    if (/[A-Z]/.test(p)) s += 20;
    if (/[0-9]/.test(p)) s += 15;
    if (/[^A-Za-z0-9]/.test(p)) s += 15;
    setPassStrength(s);

    if (passStrengthBarRef.current) {
      gsap.to(passStrengthBarRef.current, { width: `${s}%`, duration: 0.3 });
    }
  };

  const getStrengthColor = () => {
    if (passStrength < 30) return "bg-risk-critical";
    if (passStrength < 70) return "bg-risk-medium";
    return "bg-risk-low";
  };
  const getStrengthText = () => {
    if (passStrength === 0) return "";
    if (passStrength < 30) return <span className="text-risk-critical">Weak</span>;
    if (passStrength < 70) return <span className="text-risk-medium">Fair</span>;
    return <span className="text-risk-low">Strong</span>;
  };

  const shakeForm = (formRef: React.RefObject<HTMLFormElement | null>) => {
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { x: 0 },
        { x: 8, duration: 0.08, yoyo: true, repeat: 5, ease: "power1.inOut", clearProps: "x" }
      );
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/dashboard";
  };

  const InputField = ({ label, type, state, setState, id }: any) => {
    return (
      <div className="relative mb-5 group">
        <input
          id={id}
          type={type}
          required
          className={`peer w-full bg-[#171717] border border-[#1F1F1F] rounded-lg px-4 pt-6 pb-2 text-primary-text text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${state ? "border-risk-critical focus:border-risk-critical focus:ring-risk-critical/10" : ""}`}
          placeholder=" "
          autoComplete="off"
        />
        <label
          htmlFor={id}
          className="absolute left-4 top-4 text-secondary-text text-sm transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-primary peer-valid:top-2 peer-valid:text-[11px]"
        >
          {label}
        </label>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative z-10 w-[420px] bg-[#111111]/85 backdrop-blur-[24px] border border-primary/15 rounded-[20px] shadow-[0_0_60px_rgba(249,115,22,0.08),0_40px_80px_rgba(0,0,0,0.6)] p-10">

      {/* Logo */}
      <div className="flex justify-center items-center gap-2 mb-8">
        <span className="font-display font-semibold text-2xl text-primary-text tracking-tight">UCRIS</span>
        <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
      </div>

      {/* Tabs */}
      <div className="relative flex bg-[#171717] rounded-lg p-1 mb-8">
        <div ref={tabPillRef} className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-md shadow-sm z-0"></div>
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-1.5 text-sm font-medium z-10 transition-colors ${isLogin ? "text-inverse" : "text-secondary-text hover:text-primary-text"}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-1.5 text-sm font-medium z-10 transition-colors ${!isLogin ? "text-inverse" : "text-secondary-text hover:text-primary-text"}`}
        >
          Register
        </button>
      </div>

      {/* LOGIN FORM */}
      <form ref={loginFormRef} onSubmit={handleLogin} className="block">
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-primary-text">Welcome back</h2>
          <p className="text-secondary-text text-sm mt-1">Sign in to your UCRIS account</p>
        </div>

        <InputField id="login-email" label="Email address" type="email" state={loginError} />

        <div className="relative mb-2">
          <InputField id="login-password" label="Password" type={showLoginPass ? "text" : "password"} state={loginError} />
          <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-3 top-4 text-muted-text hover:text-secondary-text transition-colors">
            {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex justify-end mb-6">
          <a href="#" className="text-[12px] text-primary hover:underline">Forgot password?</a>
        </div>

        {loginError && <p className="text-risk-critical text-xs mb-4">{loginError}</p>}

        <button type="submit" disabled={loginLoading} className="w-full h-11 bg-primary text-white font-bold rounded-lg hover:bg-[#ea6c0a] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center">
          {loginLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign in"}
        </button>
      </form>

      {/* REGISTER FORM */}
      <form ref={registerFormRef} className="hidden" onSubmit={handleRegister}>
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-primary-text">Create account</h2>
          <p className="text-secondary-text text-sm mt-1">Join the risk intelligence platform</p>
        </div>

        <div className="relative flex bg-[#171717] rounded-lg p-1 mb-5">
          <div ref={rolePillRef} className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-primary/20 border border-primary/40 rounded-md z-0"></div>
          <button type="button" onClick={() => setRegRole("Analyst")} className={`flex-1 py-1.5 text-xs font-medium z-10 transition-colors ${regRole === "Analyst" ? "text-primary" : "text-muted-text"}`}>Analyst</button>
          <button type="button" onClick={() => setRegRole("Manager")} className={`flex-1 py-1.5 text-xs font-medium z-10 transition-colors ${regRole === "Manager" ? "text-primary" : "text-muted-text"}`}>Manager</button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <InputField id="reg-name" label="Full name" type="text" />
          </div>
        </div>

        <InputField id="reg-email" label="Email address" type="email" />

        <div className="relative mb-2">
          <div className="relative group">
            <input
              aria-label="Password"
              id="reg-pass"
              type={showRegPass ? "text" : "password"}
              required
              onChange={handlePassChange}
              className="peer w-full bg-[#171717] border border-[#1F1F1F] rounded-lg px-4 pt-6 pb-2 text-primary-text text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              placeholder=" "
            />
            <label
              htmlFor={"reg-pass"}
              className="absolute left-4 top-4 text-secondary-text text-sm transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-primary peer-valid:top-2 peer-valid:text-[11px]"
            >
              Password
            </label>
          </div>
          <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-3 top-4 text-muted-text hover:text-secondary-text transition-colors">
            {showRegPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Strength Bar */}
        <div className="w-full h-1 bg-[#1F1F1F] rounded-full mb-1 overflow-hidden">
          <div ref={passStrengthBarRef} className={`h-full w-0 ${getStrengthColor()} rounded-full`}></div>
        </div>
        <div className="flex justify-end mb-4">
          <span className="text-[11px] font-medium">{getStrengthText()}</span>
        </div>

        <button type="submit" className="w-full h-11 bg-primary text-white font-bold rounded-lg hover:bg-[#ea6c0a] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all mt-4">
          Create Account
        </button>
      </form>

    </div>
  );
}
