"use client";

import React, { useEffect, useRef } from "react";
import { display, mono, sans } from "./fonts";
import SignalLattice from "./SignalLattice";

export interface HeroProps {
  titlePrimary?: string;
  titleHighlight?: string;
  titleSecondary?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

/* Brand tokens (from the logo) */
const LIME = "#c6ff2e";
const INK = "#09090c";
const BONE = "#ece9e0";

const METRICS = [
  { to: 10, suffix: "+", decimals: 0, label: "Websites & apps launched" },
  { to: 14, suffix: " days", decimals: 0, label: "To your first working version" },
  { to: 99.99, suffix: "%", decimals: 2, label: "Uptime - your site stays online" },
  { to: 5, suffix: "×", decimals: 1, label: "Faster than the usual way" },
];

const STACK = [
  "TypeScript",
  "Next.js & React",
  "Node, Python & Go",
  "AWS, Google Cloud & Cloudflare",
  "PostgreSQL & Redis",
  "UPI & payment gateways",
  "AI & smart assistants",
];

const PROOF = [
  "Clear, jargon-free communication",
  "You own everything we build",
  "See a working first version in 14 days",
  "Support even after launch",
];

// High-performance DOM-direct countup (0 React re-renders during animation)
function CountUp({ to, decimals = 0, prefix = "", suffix = "" }: { to: number; decimals?: number; prefix?: string; suffix?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`;
      return;
    }
    const start = performance.now() + 600;
    let raf = 0;
    const tick = (n: number) => {
      const p = Math.min(1, Math.max(0, (n - start) / 1600));
      const v = to * (1 - Math.pow(1 - p, 4));
      el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, decimals, prefix, suffix]);

  return <span ref={spanRef}>{`${prefix}0${suffix}`}</span>;
}

export default function Hero({
  titlePrimary = "Turn your dream of owning a",
  titleHighlight = "website",
  titleSecondary = "into reality",
  description = "Whether you run a shop in a small town or a growing business in a big city, we'll build you a website you're proud of - and walk with you at every step. No confusing tech talk, just honest advice and good work.",
  primaryCtaText = "Get a Free Quote",
  primaryCtaLink = "https://wa.me/916360344703?text=want%20a%20website%20please%20send%20the%20quote",
  secondaryCtaText = "See Our Work",
  secondaryCtaLink = "#work",
}: HeroProps) {
  const words = [
    ...titlePrimary.split(" ").map((w) => ({ w, hl: false })),
    ...titleHighlight.split(" ").map((w) => ({ w, hl: true })),
    ...titleSecondary.split(" ").map((w) => ({ w, hl: false })),
  ];

  return (
    <section
      id="top"
      className={`${sans.className} relative isolate flex min-h-[100svh] flex-col overflow-hidden selection:bg-[#c6ff2e] selection:text-[#09090c]`}
      style={{ background: INK, color: BONE }}
    >
      <style>{`
        @keyframes dgm-rise { from { transform: translateY(115%); } to { transform: none; } }
        @keyframes dgm-fade { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes dgm-marquee { to { transform: translateX(-50%); } }
        @keyframes dgm-sheen { from { transform: translateX(-130%) skewX(-20deg); } to { transform: translateX(330%) skewX(-20deg); } }
        .dgm-rise { animation: dgm-rise 0.8s cubic-bezier(.16,1,.3,1) both; }
        .dgm-fade { animation: dgm-fade 0.8s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .dgm-rise, .dgm-fade { animation: none !important; }
          .dgm-marquee { animation: none !important; }
        }
      `}</style>

      {/* ───────── Interactive background ───────── */}
      <SignalLattice />

      {/* Atmosphere: calm the centre for legibility, lift the edges */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 58% 46% at 50% 46%, rgba(9,9,12,.82), rgba(9,9,12,0) 72%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 30% at 50% -5%, rgba(198,255,46,.09), transparent 70%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-56" style={{ background: `linear-gradient(to top, ${INK}, transparent)` }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,.55))" }} />
        {/* Hardware-accelerated ambient grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ───────── Centre stage ───────── */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-5 pb-14 pt-36 text-center sm:px-8">
        <h1
          className={`${display.className} max-w-[17ch] text-[clamp(2.1rem,5.4vw,5.2rem)] font-bold leading-[1.05] tracking-[-0.04em] sm:max-w-5xl`}
          style={{ color: BONE }}
        >
          {words.map(({ w, hl }, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.14em] align-bottom" style={{ marginBottom: "-0.14em", marginRight: "0.26em" }}>
              <span
                className="dgm-rise inline-block"
                style={{
                  animationDelay: `${0.15 + i * 0.06}s`,
                  color: hl ? LIME : undefined,
                  textShadow: hl ? "0 0 32px rgba(198,255,46,.32)" : undefined,
                }}
              >
                {w}
              </span>
            </span>
          ))}
        </h1>

        <p className="dgm-fade mt-8 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg" style={{ animationDelay: "0.65s" }}>
          {description}
        </p>

        <div className="dgm-fade mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row" style={{ animationDelay: "0.8s" }}>
          <a
            href={primaryCtaLink}
            className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 text-sm font-bold transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_0_50px_-8px_rgba(198,255,46,.6)] active:scale-[0.98] sm:w-auto"
            style={{ background: LIME, color: INK }}
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/50 opacity-0 blur-md group-hover:animate-[dgm-sheen_0.9s_ease] group-hover:opacity-100" />
            <span className="relative">{primaryCtaText}</span>
            <svg className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
              <path strokeLinecap="square" d="M4 12h15m0 0l-6-6m6 6l-6 6" />
            </svg>
          </a>

          <a
            href={secondaryCtaLink}
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-sm font-medium backdrop-blur-md transition-all duration-300 hover:border-[#c6ff2e]/50 hover:bg-white/[0.08] sm:w-auto"
            style={{ color: BONE }}
          >
            <span className={`${mono.className} font-bold transition-transform duration-300 group-hover:-translate-x-0.5`} style={{ color: LIME }}>
              {"</"}
            </span>
            <span>{secondaryCtaText}</span>
            <span className={`${mono.className} font-bold transition-transform duration-300 group-hover:translate-x-0.5`} style={{ color: LIME }}>
              {">"}
            </span>
          </a>
        </div>

        <ul className="dgm-fade mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-7 gap-y-2" style={{ animationDelay: "1s" }}>
          {PROOF.map((p) => (
            <li key={p} className="flex items-center gap-2 text-[13px] text-neutral-400">
              <span className="h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: LIME }} />
              {p}
            </li>
          ))}
        </ul>

        <p className="dgm-fade mt-10 text-xs text-neutral-600" style={{ animationDelay: "1.2s" }}>
          Psst - try moving your mouse, or tapping anywhere on the screen.
        </p>
      </div>

      {/* ───────── Numbers + tools ───────── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8">
        <div className="grid grid-cols-2 border-y border-white/10 md:grid-cols-4">
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`px-2 py-6 text-center md:px-6 md:text-left ${i > 0 ? "md:border-l md:border-white/10" : ""} ${i % 2 === 1 ? "border-l border-white/10" : ""} ${i > 1 ? "border-t border-white/10 md:border-t-0" : ""}`}
            >
              <div className={`${display.className} text-3xl font-bold tabular-nums tracking-[-0.03em] sm:text-4xl`} style={{ color: i === 1 ? LIME : BONE }}>
                <CountUp to={m.to} decimals={m.decimals} suffix={m.suffix} />
              </div>
              <div className="mt-2 text-xs text-neutral-500 sm:text-[13px]">{m.label}</div>
            </div>
          ))}
        </div>

        <div
          className="mt-6 flex items-center gap-8 overflow-hidden"
          style={{ maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)" }}
        >
          <span className="shrink-0 text-xs text-neutral-500">Tools we trust</span>
          <div className="dgm-marquee flex w-max shrink-0 animate-[dgm-marquee_38s_linear_infinite] items-center gap-10 will-change-transform">
            {[...STACK, ...STACK].map((s, i) => (
              <span key={i} className={`${mono.className} flex items-center gap-10 whitespace-nowrap text-xs text-neutral-400`}>
                {s}
                <span className="h-1 w-1 rotate-45" style={{ background: LIME, opacity: 0.6 }} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
