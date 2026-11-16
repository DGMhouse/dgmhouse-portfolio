"use client";

/**
 * Process — "How we work" / the life cycle of owning a website
 *
 * A scroll-driven journey in plain English:
 *   intro  →  pinned stage with 7 steps  →  closing call-to-action
 *
 * While the section is pinned, scrolling moves you through the steps. A browser
 * window on the right "grows" with each step (a chat, a plan, a design, the build,
 * testing, launch day, growth) while the explanation on the left swaps in.
 * The progress path underneath is clickable and fills as you scroll.
 *
 * Add id="process" so the navbar's "How We Work" link lands here (already set).
 * Edit the copy via the `steps` prop or the DEFAULT_STEPS array below.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { display, mono, sans } from "./fonts";

const LIME = "#c6ff2e";
const INK = "#09090c";
const BONE = "#ece9e0";
const EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

/* ═════════════════════════ Content ═════════════════════════ */

export interface ProcessStep {
  short: string;
  title: string;
  blurb: string;
  you: string[];
  we: string[];
  time: string;
  /** Little status tag shown in the browser bar */
  status: string;
}

export interface ProcessProps {
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  intro?: string;
  steps?: ProcessStep[];
  closingTitle?: string;
  closingHighlight?: string;
  closingText?: string;
  ctaText?: string;
  ctaLink?: string;
}

const DEFAULT_STEPS: ProcessStep[] = [
  {
    short: "Say hello",
    title: "We start with a friendly chat",
    blurb:
      "Tell us about your business, who your customers are and what you'd love your website to do. No tech knowledge needed. We ask simple questions and listen carefully.",
    you: ["Share your idea and goals", "Show us sites you like"],
    we: ["Understand your business", "Give you an honest plan and price"],
    time: "Day 1 · a free call",
    status: "Just an idea",
  },
  {
    short: "Plan",
    title: "Together, we plan everything",
    blurb:
      "We map out the pages, the features and the timeline, and we put the price in writing. You'll know exactly what you're getting before we begin. No surprises later.",
    you: ["Check and approve the plan"],
    we: ["List every page and feature", "Fix the price and timeline"],
    time: "A couple of days",
    status: "Planning",
  },
  {
    short: "Design",
    title: "You see it before we build it",
    blurb:
      "We design how your website will look: colours, photos, fonts, and how it feels on a phone. You tell us what you think, we refine it, until you say, \"Yes, this is us.\"",
    you: ["Share feedback on the look", "Send your logo and photos"],
    we: ["Design for phones and computers", "Change things until you love it"],
    time: "About a week",
    status: "Designing",
  },
  {
    short: "Build",
    title: "We build it, for real",
    blurb:
      "Once you approve the design, we turn it into a real, working website. You can peek at progress whenever you like, and your first working version is ready in about 14 days.",
    you: ["Peek at progress anytime"],
    we: ["Build every page and feature", "Connect payments, forms and WhatsApp"],
    time: "First version in ~14 days",
    status: "Building",
  },
  {
    short: "Review",
    title: "We test it. You check it.",
    blurb:
      "We try your website on different phones and browsers, check how fast it loads, and test every button and payment. Then it's your turn: tell us what to change and we'll fix it.",
    you: ["Review and ask for changes"],
    we: ["Test on phones and browsers", "Fix everything you point out"],
    time: "A few days",
    status: "Testing",
  },
  {
    short: "Go live",
    title: "Launch day",
    blurb:
      "We set up your web address (like yourshop.in) and hosting, then switch your website on. You're live. Customers can find you, call you and order from you.",
    you: ["Celebrate. We'll cheer with you."],
    we: ["Set up your domain and hosting", "Launch and double-check everything"],
    time: "Launch day",
    status: "Live",
  },
  {
    short: "Grow",
    title: "Your website keeps growing with you",
    blurb:
      "A website is never really \"finished\". It's alive. We keep it safe, fast and up to date, add new offers and pages when you need them, and help whenever you have a question. And the journey goes on.",
    you: ["Tell us what's new in your business"],
    we: ["Keep it secure and backed up", "Add new pages, offers and features", "Answer your questions quickly"],
    time: "Ongoing support",
    status: "Live · growing",
  },
];

/* ═════════════════════════ Helpers ═════════════════════════ */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** staggered transition-delay, only when `on` */
const stag = (on: boolean, i: number, base = 250, step = 300): React.CSSProperties => ({
  transitionDelay: on ? `${base + i * step}ms` : "0ms",
});
const pop = (on: boolean) =>
  `transition-all duration-700 ${EASE} ${on ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"}`;

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-1000 ${EASE} ${on ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-sm"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const CheckIcon = ({ className = "", stroke = INK }: { className?: string; stroke?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 8.5 6.5 12 13 4.5" />
  </svg>
);
const LoopIcon = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3" />
    <path d="M18 3v4h-4M6 21v-4h4" />
  </svg>
);

/* ═════════════════════════ Scenes (artboard 420 × 320) ═════════════════════════ */

/** The little website that every scene plays with */
function Mock({ designed, on = true, anim = false }: { designed: boolean; on?: boolean; anim?: boolean }) {
  const a = (i: number): { className: string; style: React.CSSProperties } =>
    anim
      ? {
          className: `transition-all duration-700 ${EASE} ${on ? "translate-x-0 translate-y-0 opacity-100" : i % 2 ? "translate-x-6 opacity-0" : "-translate-y-4 opacity-0"}`,
          style: stag(on, i, 200, 280),
        }
      : { className: "", style: {} };
  const nav = a(0);
  const hero = a(1);
  const img = a(2);
  const cards = [a(3), a(4), a(5)];
  const tones = ["linear-gradient(135deg,#f5a524,#f97316)", "linear-gradient(135deg,#c6ff2e,#4ade80)", "linear-gradient(135deg,#fb7185,#f59e0b)"];
  const names = ["Kaju Katli", "Motichoor Ladoo", "Gift Boxes"];
  const prices = ["₹ 650", "₹ 420", "₹ 899"];
  const dash = "border border-dashed border-white/25";

  return (
    <div className="flex h-full w-full flex-col gap-2.5">
      <div className={`flex h-6 items-center justify-between ${nav.className}`} style={nav.style}>
        {designed ? (
          <span className={`${display.className} text-[11px] font-bold`} style={{ color: LIME }}>
            Your Shop
          </span>
        ) : (
          <span className="h-2.5 w-14 rounded border border-dashed border-white/30" />
        )}
        <span className="flex gap-3">
          {[0, 1, 2].map((k) => (
            <span key={k} className={`h-1.5 w-7 rounded-full ${designed ? "bg-white/30" : dash}`} />
          ))}
        </span>
      </div>

      <div className="flex h-[118px] gap-2.5">
        <div
          className={`flex flex-1 flex-col justify-center gap-2 rounded-lg p-3 ${designed ? "border border-[#c6ff2e]/20" : dash} ${hero.className}`}
          style={{ ...hero.style, background: designed ? "linear-gradient(120deg, rgba(198,255,46,.16), rgba(198,255,46,.02))" : undefined }}
        >
          {designed ? (
            <>
              <p className={`${display.className} text-[15px] font-bold leading-tight`} style={{ color: BONE }}>
                Fresh sweets, made with love.
              </p>
              <p className="text-[9px] text-neutral-400">Order online. Delivered to your door.</p>
              <span className="w-fit rounded-full px-3 py-1.5 text-[10px] font-bold" style={{ background: LIME, color: INK }}>
                Order now
              </span>
            </>
          ) : (
            <>
              <span className="h-2.5 w-3/4 rounded border border-dashed border-white/30" />
              <span className="h-2.5 w-1/2 rounded border border-dashed border-white/30" />
              <span className="h-2 w-2/3 rounded border border-dashed border-white/20" />
              <span className="h-5 w-16 rounded-full border border-dashed border-white/30" />
            </>
          )}
        </div>
        <div
          className={`relative w-[104px] shrink-0 overflow-hidden rounded-lg ${designed ? "" : dash} ${img.className}`}
          style={{ ...img.style, background: designed ? "linear-gradient(135deg,#f5a524,#f97316 55%,#c6ff2e)" : undefined }}
        >
          {designed ? (
            <>
              <span className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-white/25" />
              <span className="absolute bottom-3 left-3 h-9 w-9 rounded-full bg-[#09090c]/25" />
            </>
          ) : (
            <svg className="absolute inset-0 h-full w-full text-white/20" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 0 100 100M100 0 0 100" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2.5">
        {cards.map((c, i) => (
          <div key={i} className={`flex flex-col overflow-hidden rounded-lg ${designed ? "border border-white/10 bg-white/[0.04]" : dash} ${c.className}`} style={c.style}>
            <div className="min-h-[40px] flex-1" style={{ background: designed ? tones[i] : undefined }} />
            <div className="flex items-center justify-between p-2">
              {designed ? (
                <>
                  <span className="text-[9px]" style={{ color: BONE }}>
                    {names[i]}
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: LIME }}>
                    {prices[i]}
                  </span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-12 rounded-full border border-dashed border-white/25" />
                  <span className="h-1.5 w-6 rounded-full border border-dashed border-white/25" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneChat({ on }: { on: boolean }) {
  const msgs = [
    { me: true, t: "Hi! I run a sweet shop and I'd love customers to order online." },
    { me: false, t: "Lovely! Tell us a little about your customers." },
    { me: true, t: "Mostly families nearby. Some ask for home delivery." },
    { me: false, t: "Perfect! We'll share a clear plan and we'll move forward." },
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2.5 px-5">
      {msgs.map((m, i) => (
        <div
          key={i}
          className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${m.me ? "self-end rounded-br-md" : "self-start rounded-bl-md"} ${pop(on)}`}
          style={{
            ...stag(on, i, 300, 650),
            background: m.me ? BONE : "rgba(198,255,46,.14)",
            color: m.me ? INK : BONE,
            border: m.me ? "none" : "1px solid rgba(198,255,46,.28)",
          }}
        >
          {m.t}
        </div>
      ))}
      <div className={`flex gap-1 self-start px-3 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`} style={stag(on, 0, 3300, 0)} aria-hidden>
        {[0, 1, 2].map((d) => (
          <span key={d} className="h-1.5 w-1.5 rounded-full bg-neutral-500" style={{ animation: on ? `dgm-proc-dot 1.2s ease-in-out ${d * 0.15}s infinite` : "none" }} />
        ))}
      </div>
    </div>
  );
}

function ScenePlan({ on }: { on: boolean }) {
  const kids = ["About us", "Our products", "Order online", "Contact"];
  const xs = [58, 160, 262, 364];
  const chips = ["Pages listed", "Price fixed", "Timeline set"];
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 420 320" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
        {xs.map((x, i) => (
          <path
            key={i}
            pathLength={1}
            d={`M210 80 C210 112, ${x} 102, ${x} 138`}
            stroke={LIME}
            strokeOpacity=".6"
            strokeWidth="1.5"
            strokeDasharray="1"
            style={{ strokeDashoffset: on ? 0 : 1, transition: `stroke-dashoffset 900ms ease ${450 + i * 150}ms` }}
          />
        ))}
      </svg>
      <div className={`absolute left-1/2 top-9 -translate-x-1/2 rounded-xl px-6 py-2.5 text-[13px] font-bold ${pop(on)}`} style={{ background: LIME, color: INK, ...stag(on, 0, 150, 0) }}>
        Home
      </div>
      {kids.map((k, i) => (
        <div
          key={k}
          className={`absolute top-[138px] w-[88px] rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-center text-[11px] ${pop(on)}`}
          style={{ left: xs[i] - 44, color: BONE, ...stag(on, i, 800, 150) }}
        >
          {k}
        </div>
      ))}
      <div className="absolute inset-x-4 bottom-7 flex justify-center gap-2">
        {chips.map((c, i) => (
          <span key={c} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] ${pop(on)}`} style={{ borderColor: "rgba(198,255,46,.3)", background: "rgba(198,255,46,.08)", color: BONE, ...stag(on, i, 1600, 280) }}>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full" style={{ background: LIME }}>
              <CheckIcon className="h-2.5 w-2.5" />
            </span>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function SceneDesign({ on }: { on: boolean }) {
  return (
    <div className="absolute inset-0 p-3">
      <div className="relative h-full w-full">
        <Mock designed={false} />
        <div className="absolute inset-0" style={{ clipPath: on ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)", transition: "clip-path 1.6s cubic-bezier(.65,0,.35,1) .35s" }}>
          <Mock designed />
        </div>
        <span
          aria-hidden
          className="absolute bottom-0 top-0 w-[2px]"
          style={{ background: LIME, boxShadow: "0 0 18px 2px rgba(198,255,46,.8)", opacity: 0, animation: on ? "dgm-proc-scan 1.6s cubic-bezier(.65,0,.35,1) .35s both" : "none" }}
        />
        <div className={`absolute bottom-1 right-1 flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/75 px-3 py-2 backdrop-blur-md ${pop(on)}`} style={stag(on, 0, 2100, 0)}>
          <span className={`${display.className} text-[15px] font-bold`} style={{ color: BONE }}>
            Aa
          </span>
          {[LIME, BONE, "#f5a524", "#f97316"].map((c) => (
            <span key={c} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneBuild({ on }: { on: boolean }) {
  const code: [string, string][][] = [
    [["<Page", LIME], [" name=", "#8b8b93"], ['"Home"', BONE], [" />", LIME]],
    [["<Products", LIME], [" list=", "#8b8b93"], ['"sweets"', BONE], [" />", LIME]],
    [["<Cart", LIME], [" pay=", "#8b8b93"], ['"UPI + cards"', BONE], [" />", LIME]],
    [["<Button", LIME], [" on=", "#8b8b93"], ['"WhatsApp"', BONE], [" />", LIME]],
    [["<Site", LIME], [" status=", "#8b8b93"], ['"ready"', BONE], [" />", LIME]],
  ];
  return (
    <div className="absolute inset-0">
      <div className="absolute left-3 top-[34px]" style={{ width: 396, height: 296, transform: "scale(.58)", transformOrigin: "top left" }}>
        <Mock designed anim on={on} />
      </div>
      <div className={`absolute right-3 top-[38px] w-[158px] rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-sm ${pop(on)}`} style={stag(on, 0, 200, 0)}>
        <div className={`${mono.className} space-y-1.5 text-[9px] leading-none`}>
          {code.map((ln, i) => (
            <div key={i} className={`whitespace-nowrap transition-all duration-500 ${on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`} style={stag(on, i, 700, 380)}>
              {ln.map(([t, c], k) => (
                <span key={k} style={{ color: c }}>
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-5 bottom-4">
        <div className="mb-2 flex items-center justify-between text-[11px]" style={{ color: BONE }}>
          <span>Building your website</span>
          <span className={`flex items-center gap-1.5 font-bold transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`} style={{ color: LIME, transitionDelay: on ? "3300ms" : "0ms" }}>
            <CheckIcon className="h-3 w-3" stroke={LIME} />
            First version ready
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full" style={{ width: on ? "100%" : "0%", background: LIME, boxShadow: "0 0 12px rgba(198,255,46,.7)", transition: "width 3.2s cubic-bezier(.4,0,.2,1) .5s" }} />
        </div>
      </div>
    </div>
  );
}

function SceneReview({ on }: { on: boolean }) {
  const items = ["Looks great on phones", "Loads fast", "Forms and payments work", "Your changes are done"];
  return (
    <div className="absolute inset-0">
      <div className={`absolute left-8 top-5 h-[250px] w-[112px] rounded-[20px] border-2 border-white/20 bg-[#0b0b0f] p-2.5 ${pop(on)}`} style={stag(on, 0, 150, 0)}>
        <span className="mx-auto mb-2 block h-1 w-8 rounded-full bg-white/15" />
        <div className="flex h-[calc(100%-14px)] flex-col gap-1.5">
          <span className={`${display.className} text-[8px] font-bold`} style={{ color: LIME }}>
            Your Shop
          </span>
          <div className="rounded-md p-2" style={{ background: "linear-gradient(120deg, rgba(198,255,46,.18), rgba(198,255,46,.02))", border: "1px solid rgba(198,255,46,.2)" }}>
            <p className={`${display.className} text-[8px] font-bold leading-tight`} style={{ color: BONE }}>
              Fresh sweets, made with love.
            </p>
            <span className="mt-1.5 block w-fit rounded-full px-2 py-1 text-[6px] font-bold" style={{ background: LIME, color: INK }}>
              Order now
            </span>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-1.5">
            <span className="rounded-md" style={{ background: "linear-gradient(135deg,#f5a524,#f97316)" }} />
            <span className="rounded-md" style={{ background: "linear-gradient(135deg,#c6ff2e,#4ade80)" }} />
          </div>
        </div>
      </div>

      {/* review comment: "Make the button bigger?" → "Done" */}
      <span className="absolute left-[112px] top-[104px] rounded-xl rounded-bl-sm px-3 py-1.5 text-[10.5px] font-medium opacity-0" style={{ background: BONE, color: INK, animation: on ? "dgm-proc-pin1 4.4s ease 1.2s both" : "none" }}>
        Make the button bigger?
      </span>
      <span className="absolute left-[112px] top-[104px] flex items-center gap-1.5 rounded-xl rounded-bl-sm px-3 py-1.5 text-[10.5px] font-bold opacity-0" style={{ background: LIME, color: INK, animation: on ? "dgm-proc-pin2 4.4s ease 1.2s both" : "none" }}>
        <CheckIcon className="h-3 w-3" /> Done!
      </span>

      <div className="absolute left-[176px] right-5 top-9 flex flex-col gap-4">
        {items.map((t, i) => (
          <div key={t} className={`flex items-center gap-3 ${pop(on)}`} style={stag(on, i, 600, 650)}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: LIME }}>
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[13px]" style={{ color: BONE }}>
              {t}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneLive({ on }: { on: boolean }) {
  const pieces = Array.from({ length: 16 }, (_, i) => {
    const ang = (i / 16) * Math.PI * 2 + (i % 2) * 0.2;
    const d = 95 + (i % 4) * 22;
    return { tx: Math.cos(ang) * d, ty: Math.sin(ang) * d, r: (i * 47) % 360, c: [LIME, BONE, "#f5a524"][i % 3], w: 5 + (i % 3) * 2 };
  });
  return (
    <div className="absolute inset-0">
      {[0, 1, 2].map((i) => (
        <span key={i} className="absolute left-1/2 top-[42%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-0" style={{ borderColor: "rgba(198,255,46,.5)", animation: on ? `dgm-proc-ripple 2.8s ease-out ${0.6 + i * 0.9}s infinite` : "none" }} />
      ))}
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-[42%] rounded-[2px] opacity-0"
          style={{
            width: p.w,
            height: p.w * 1.6,
            background: p.c,
            ["--tx" as string]: `${p.tx}px`,
            ["--ty" as string]: `${p.ty}px`,
            ["--r" as string]: `${p.r}deg`,
            animation: on ? `dgm-proc-confetti 1.7s cubic-bezier(.2,.8,.3,1) ${0.5 + (i % 4) * 0.06}s both` : "none",
          }}
        />
      ))}
      <div className={`absolute left-1/2 top-[42%] flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-700 ${EASE} ${on ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} style={{ background: LIME, boxShadow: "0 0 60px rgba(198,255,46,.55)", transitionDelay: on ? "300ms" : "0ms" }}>
        <CheckIcon className="h-8 w-8" />
      </div>
      <div className={`absolute inset-x-0 top-[62%] text-center ${pop(on)}`} style={stag(on, 0, 800, 0)}>
        <p className={`${display.className} text-[22px] font-bold tracking-tight`} style={{ color: BONE }}>
          You&apos;re live!
        </p>
        <p className="mt-1 text-[12px] text-neutral-400">yourshop.in is open for customers</p>
      </div>
      <div className={`absolute inset-x-8 bottom-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 backdrop-blur-md ${pop(on)}`} style={stag(on, 0, 2200, 0)}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: LIME }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: LIME }} />
        </span>
        <span className="text-[12px]" style={{ color: BONE }}>
          Your first customer just arrived
        </span>
      </div>
    </div>
  );
}

function SceneGrow({ on }: { on: boolean }) {
  const chips = ["Updates", "Backups", "Security", "Quick help"];
  const line = "M6 118 C50 112, 80 100, 120 90 S190 66, 230 56 S320 30, 382 14";
  return (
    <div className="absolute inset-0">
      <div className={`absolute left-4 right-4 top-4 h-[196px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ${pop(on)}`} style={stag(on, 0, 150, 0)}>
        <div className="flex items-center justify-between px-4 pt-3 text-[11px]">
          <span style={{ color: BONE }}>Visitors to your website</span>
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: LIME }}>
            <LoopIcon className="h-3.5 w-3.5" style={{ animation: on ? "dgm-proc-spin 6s linear infinite" : "none" }} />
            Always improving
          </span>
        </div>
        <svg viewBox="0 0 388 140" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-[140px] w-full" fill="none" aria-hidden>
          <defs>
            <linearGradient id="dgm-proc-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={LIME} stopOpacity=".32" />
              <stop offset="1" stopColor={LIME} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L382 140 L6 140 Z`} fill="url(#dgm-proc-area)" style={{ opacity: on ? 1 : 0, transition: "opacity 1.2s ease 1.4s" }} />
          <path d={line} pathLength={1} stroke={LIME} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1" style={{ strokeDashoffset: on ? 0 : 1, transition: "stroke-dashoffset 2s cubic-bezier(.4,0,.2,1) .5s", filter: "drop-shadow(0 0 6px rgba(198,255,46,.8))" }} />
        </svg>
        <span className={`absolute right-[2px] top-[58px] h-3 w-3 rounded-full transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`} style={{ background: LIME, transitionDelay: on ? "2400ms" : "0ms", boxShadow: "0 0 14px 3px rgba(198,255,46,.6)" }} />
      </div>
      <div className="absolute inset-x-4 bottom-4 flex flex-wrap justify-center gap-2">
        {chips.map((c, i) => (
          <span key={c} className={`flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] ${pop(on)}`} style={{ color: BONE, ...stag(on, i, 1800, 220) }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: LIME }} />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

const SCENES = [SceneChat, ScenePlan, SceneDesign, SceneBuild, SceneReview, SceneLive, SceneGrow];

/* ═════════════════════════ Browser window ═════════════════════════ */

function Window({ active, status }: { active: number; status: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const live = active >= 5;
  const rectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const upd = () => setScale(el.clientWidth / 420);
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!rectRef.current) rectRef.current = e.currentTarget.getBoundingClientRect();
    const r = rectRef.current;
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    if (tilt.current) tilt.current.style.transform = `perspective(1200px) rotateX(${y * -6}deg) rotateY(${x * 8}deg)`;
  };
  const onLeave = () => {
    rectRef.current = null;
    if (tilt.current) tilt.current.style.transform = "perspective(1200px) rotateX(0) rotateY(0)";
  };

  return (
    <div className="relative flex w-full items-center justify-center" onMouseEnter={onMouseEnter} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="relative w-[min(100%,calc(34svh*1.1667))] lg:w-[min(100%,calc(58svh*1.1667))]">
        {/* glow behind */}
        <div aria-hidden className="absolute -inset-6 -z-10 rounded-[3rem] blur-2xl transition-opacity duration-700 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(198,255,46,.25), transparent 70%)", opacity: live ? 0.6 : 0.28 }} />
        <div ref={tilt} className="transition-transform duration-300 ease-out will-change-transform" style={{ transformStyle: "preserve-3d" }}>
          <div ref={outer} className="relative aspect-[7/6] w-full overflow-hidden rounded-2xl border border-white/12 bg-[#0c0c10] shadow-[0_30px_70px_-20px_rgba(0,0,0,.8)]" style={{ borderColor: "rgba(255,255,255,.12)" }}>
            <div className="absolute left-0 top-0 origin-top-left" style={{ width: 420, height: 360, transform: `scale(${scale})` }}>
              {/* browser bar */}
              <div className="flex h-10 items-center gap-3 border-b border-white/10 bg-white/[0.03] px-3.5">
                <span className="flex gap-1.5" aria-hidden>
                  {[0, 1, 2].map((d) => (
                    <i key={d} className="block h-2.5 w-2.5 rounded-full bg-white/15" />
                  ))}
                </span>
                <div className="flex h-6 flex-1 items-center gap-1.5 rounded-full bg-black/40 px-3 text-[11px] text-neutral-400">
                  <svg className="h-3 w-3 transition-colors duration-700" viewBox="0 0 16 16" fill="none" stroke={live ? LIME : "#737373"} strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" />
                    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
                  </svg>
                  <span style={{ color: live ? BONE : undefined }}>yourshop.in</span>
                </div>
                <span key={active} className="rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider" style={{ animation: "dgm-proc-chip .5s ease both", background: live ? LIME : "rgba(255,255,255,.08)", color: live ? INK : "#a3a3a3" }}>
                  {status}
                </span>
              </div>

              {/* scenes */}
              <div className="absolute inset-x-0 bottom-0 top-10 overflow-hidden">
                {SCENES.map((Sc, i) => (
                  <div key={i} aria-hidden className={`absolute inset-0 transition-all duration-500 ${EASE} ${active === i ? "scale-100 opacity-100" : "pointer-events-none scale-[0.98] opacity-0"}`}>
                    <Sc on={active === i} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════ Main ═════════════════════════ */

export default function Process({
  eyebrow = "How it works",
  title = "Owning a website is a journey.",
  titleHighlight = "We'll walk it with you.",
  intro = "Whether it's your first website or your fifth, here's exactly what happens: from our first chat to a website that keeps growing with your business.",
  steps = DEFAULT_STEPS,
  closingTitle = "Step one is just",
  closingHighlight = "a friendly chat.",
  closingText = "It's free to talk. Tell us your idea and we'll tell you honestly how we'd bring it to life: what it takes, how long it'll be, and what it'll cost.",
  ctaText = "Connect with us",
  ctaLink = "tel:+6360344703",
}: ProcessProps) {
  const n = steps.length;
  const sectionRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  /* scroll → progress (reflow-free measurement) */
  useEffect(() => {
    let ticking = false;
    let cachedTop = 0;
    let cachedTotal = 0;

    const measure = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      cachedTop = r.top + window.scrollY;
      cachedTotal = r.height - window.innerHeight;
    };
    measure();

    const update = () => {
      ticking = false;
      if (cachedTotal <= 0) return;
      const y = window.scrollY;
      const p = clamp((y - cachedTop) / cachedTotal, 0, 1);
      const idx = Math.min(n - 1, Math.floor(p * n));
      setActive((prev) => (prev === idx ? prev : idx));
      const f = clamp((p * n - 0.5) / (n - 1), 0, 1);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${f})`;
      if (headRef.current) headRef.current.style.left = `${f * 100}%`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      onScroll();
    }, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [n]);

  const jump = useCallback(
    (i: number) => {
      const el = sectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const total = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + ((i + 0.5) / n) * total, behavior: "smooth" });
    },
    [n]
  );

  /* text part reveal helper */
  const rv = (on: boolean, k: number): { className: string; style: React.CSSProperties } => ({
    className: `transition-all duration-700 ${EASE} ${on ? "translate-y-0 opacity-100 blur-0" : "translate-y-5 opacity-0 blur-sm"}`,
    style: { transitionDelay: on ? `${180 + k * 90}ms` : "0ms" },
  });

  return (
    <section id="process" className={`${sans.className} dgm-proc relative text-white selection:bg-[#c6ff2e] selection:text-[#09090c]`} style={{ background: INK, color: BONE }}>
      <style>{`
        @keyframes dgm-proc-dot { 0%,60%,100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-4px); opacity: 1; } }
        @keyframes dgm-proc-scan { 0% { left: 0; opacity: 1; } 92% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
        @keyframes dgm-proc-pin1 { 0% { opacity: 0; transform: scale(.8); } 10%,68% { opacity: 1; transform: scale(1); } 80%,100% { opacity: 0; transform: scale(.9); } }
        @keyframes dgm-proc-pin2 { 0%,70% { opacity: 0; transform: scale(.8); } 84%,100% { opacity: 1; transform: scale(1); } }
        @keyframes dgm-proc-ripple { from { transform: translate(-50%,-50%) scale(.5); opacity: .7; } to { transform: translate(-50%,-50%) scale(3.2); opacity: 0; } }
        @keyframes dgm-proc-confetti { 0% { transform: translate(-50%,-50%) rotate(0) scale(1); opacity: 1; } 100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--r)) scale(.5); opacity: 0; } }
        @keyframes dgm-proc-chip { from { opacity: 0; transform: scale(.85) translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes dgm-proc-spin { to { transform: rotate(360deg); } }
        @keyframes dgm-proc-ring { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.9); opacity: 0; } }
        @keyframes dgm-proc-nudge { 0%,100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
        @keyframes dgm-proc-sheen { from { transform: translateX(-130%) skewX(-20deg); } to { transform: translateX(330%) skewX(-20deg); } }
        @media (prefers-reduced-motion: reduce) {
          .dgm-proc *, .dgm-proc *::before, .dgm-proc *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; transition-delay: 0ms !important; }
        }
      `}</style>

      {/* ───────── Intro ───────── */}
      <div className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(198,255,46,.5), transparent)" }} />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]" style={{ background: "rgba(198,255,46,.07)" }} />
        <div className="relative mx-auto flex min-h-[78svh] max-w-5xl flex-col items-center justify-center px-5 py-28 text-center sm:px-8">
          <Reveal>
            <p className={`${mono.className} mb-6 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em]`} style={{ color: LIME }}>
              <span className="h-px w-8" style={{ background: LIME }} />
              {eyebrow}
              <span className="h-px w-8" style={{ background: LIME }} />
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className={`${display.className} text-[clamp(2rem,5vw,4.4rem)] font-bold leading-[1.06] tracking-[-0.04em]`} style={{ color: BONE }}>
              {title}{" "}
              <span style={{ color: LIME, textShadow: "0 0 44px rgba(198,255,46,.35)" }}>{titleHighlight}</span>
            </h2>
          </Reveal>
          <Reveal delay={220}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">{intro}</p>
          </Reveal>
          <Reveal delay={340}>
            <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
              {["No tech knowledge needed", "A clear price before we start", "You're involved at every step"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-[13px] text-neutral-400">
                  <span className="h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: LIME }} />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={480} className="mt-14">
            <div className="flex flex-col items-center gap-3 text-neutral-500">
              <span className="text-xs">Scroll to begin</span>
              <span className="relative block h-12 w-px overflow-hidden bg-white/10">
                <span className="absolute inset-x-0 top-0 h-5" style={{ background: `linear-gradient(to bottom, ${LIME}, transparent)`, animation: "dgm-proc-nudge 1.8s ease-in-out infinite" }} />
              </span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ───────── Pinned journey ───────── */}
      <div ref={sectionRef} className="relative" style={{ height: `calc(100svh + ${n * 70}svh)` }}>
        <div className="sticky top-0 flex h-[100svh] flex-col overflow-clip">
          {/* ambient */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-transform duration-[1200ms] ease-out will-change-transform" style={{ transform: `translate3d(${12 + (active / Math.max(1, n - 1)) * 76}vw, 0, 0)`, background: "rgba(198,255,46,.08)" }} />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: `linear-gradient(to top, ${INK}, transparent)` }} />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-5 pt-[76px] sm:px-8 lg:pt-[88px]">
            {/* stage */}
            <div className="grid min-h-0 flex-1 items-center gap-4 lg:grid-cols-12 lg:gap-12">
              {/* text */}
              <div className="order-2 lg:order-1 lg:col-span-5">
                <div className="grid">
                  {steps.map((s, i) => {
                    const on = i === active;
                    return (
                      <article key={s.short} aria-hidden={!on} className={`col-start-1 row-start-1 ${on ? "" : "pointer-events-none"}`}>
                        <div {...rv(on, 0)} className={`flex items-end gap-3 ${rv(on, 0).className}`}>
                          <span
                            className={`${display.className} text-[clamp(2.6rem,8.5vw,6.5rem)] font-black leading-[.85] tracking-[-0.05em]`}
                            style={{ color: "transparent", WebkitTextStroke: `1.5px ${LIME}` }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className={`${mono.className} mb-1 text-[11px] uppercase tracking-[0.25em] text-neutral-500`}>
                            Step {i + 1} of {n} · {s.short}
                          </span>
                        </div>
                        <h3 {...rv(on, 1)} className={`${display.className} mt-4 text-[clamp(1.35rem,2.7vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.035em] ${rv(on, 1).className}`} style={{ ...rv(on, 1).style, color: BONE }}>
                          {s.title}
                        </h3>
                        <p className={`mt-3 text-[14px] leading-relaxed text-neutral-400 sm:text-base lg:mt-4 ${rv(on, 2).className}`} style={rv(on, 2).style}>
                          {s.blurb}
                        </p>
                        <div className={`mt-6 hidden gap-8 sm:grid sm:grid-cols-2 ${rv(on, 3).className}`} style={rv(on, 3).style}>
                          {[
                            { label: "You", list: s.you },
                            { label: "We", list: s.we },
                          ].map((col) => (
                            <div key={col.label}>
                              <p className={`${mono.className} mb-2 text-[10px] font-bold uppercase tracking-[0.25em]`} style={{ color: LIME }}>
                                {col.label}
                              </p>
                              <ul className="space-y-1.5">
                                {col.list.map((li) => (
                                  <li key={li} className="flex gap-2 text-[13px] leading-snug text-neutral-300">
                                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: LIME }} />
                                    {li}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-neutral-300 ${rv(on, 4).className}`} style={rv(on, 4).style}>
                          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke={LIME} strokeWidth="1.8" strokeLinecap="round">
                            <circle cx="8" cy="8" r="6" />
                            <path d="M8 4.5V8l2.2 1.4" />
                          </svg>
                          {s.time}
                        </div>
                      </article>
                    );
                  })}
                </div>
                <p className={`${mono.className} mt-6 hidden items-center gap-2 text-[11px] text-neutral-600 transition-opacity duration-700 lg:flex ${active === 0 ? "opacity-100" : "opacity-0"}`}>
                  <span style={{ animation: "dgm-proc-nudge 1.8s ease-in-out infinite" }}>↓</span> Keep scrolling to see each step
                </p>
              </div>

              {/* visual */}
              <div className="order-1 lg:order-2 lg:col-span-7">
                <Window active={active} status={steps[active].status} />
              </div>
            </div>

            {/* stepper */}
            <nav aria-label="Steps" className="relative mx-auto mt-3 w-full max-w-5xl lg:mt-6">
              <div aria-hidden className="absolute top-[13px] h-px bg-white/10 sm:top-[17px]" style={{ left: `${50 / n}%`, right: `${50 / n}%` }}>
                <div ref={fillRef} className="h-full origin-left" style={{ transform: "scaleX(0)", background: LIME, boxShadow: "0 0 10px rgba(198,255,46,.8)" }} />
                <span ref={headRef} className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: 0, background: LIME, boxShadow: "0 0 14px 3px rgba(198,255,46,.7)" }} />
              </div>
              <ol className="relative flex">
                {steps.map((s, i) => {
                  const done = i < active;
                  const cur = i === active;
                  return (
                    <li key={s.short} className="flex flex-1 justify-center">
                      <button
                        type="button"
                        onClick={() => jump(i)}
                        aria-label={`Go to step ${i + 1}: ${s.short}`}
                        aria-current={cur ? "step" : undefined}
                        className="group flex flex-col items-center gap-2 focus-visible:outline-none"
                      >
                        <span
                          className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold transition-all duration-500 sm:h-9 sm:w-9 sm:text-xs ${
                            done ? "" : cur ? "scale-110" : "border-white/15 text-neutral-500 group-hover:border-white/40 group-hover:text-neutral-300 group-focus-visible:border-white/60"
                          }`}
                          style={{
                            background: done ? LIME : INK,
                            borderColor: done || cur ? LIME : undefined,
                            color: done ? INK : cur ? LIME : undefined,
                            boxShadow: cur ? "0 0 24px -2px rgba(198,255,46,.6)" : undefined,
                          }}
                        >
                          {cur && <span aria-hidden className="absolute inset-0 rounded-full border" style={{ borderColor: LIME, animation: "dgm-proc-ring 1.8s ease-out infinite" }} />}
                          {done ? <CheckIcon className="h-3.5 w-3.5" /> : cur && i === n - 1 ? <LoopIcon className="h-4 w-4" style={{ animation: "dgm-proc-spin 5s linear infinite" }} /> : i + 1}
                        </span>
                        <span className={`hidden text-[11px] transition-colors duration-500 md:block ${cur ? "text-white" : done ? "text-neutral-400" : "text-neutral-600 group-hover:text-neutral-400"}`}>{s.short}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* ───────── Closing call-to-action ───────── */}
      <div className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]" style={{ background: "rgba(198,255,46,.09)" }} />
        <div aria-hidden className={`${display.className} pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[min(60vw,42rem)] font-black leading-none`} style={{ color: "transparent", WebkitTextStroke: "1px rgba(198,255,46,.07)" }}>
          01
        </div>
        <div className="relative mx-auto flex min-h-[70svh] max-w-4xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
          <Reveal>
            <p className={`${mono.className} mb-6 text-[11px] font-semibold uppercase tracking-[0.3em]`} style={{ color: LIME }}>
              Ready when you are
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className={`${display.className} text-[clamp(2rem,5.2vw,4.6rem)] font-bold leading-[1.06] tracking-[-0.04em]`} style={{ color: BONE }}>
              {closingTitle} <span style={{ color: LIME, textShadow: "0 0 44px rgba(198,255,46,.35)" }}>{closingHighlight}</span>
            </h2>
          </Reveal>
          <Reveal delay={220}>
            <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">{closingText}</p>
          </Reveal>
          <Reveal delay={340} className="mt-10">
            <a
              href={ctaLink}
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-9 py-4 text-sm font-bold transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_-8px_rgba(198,255,46,.7)] active:scale-95"
              style={{ background: LIME, color: INK }}
            >
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/50 opacity-0 blur-md group-hover:animate-[dgm-proc-sheen_0.9s_ease] group-hover:opacity-100" />
              <span className="relative">{ctaText}</span>
              <svg className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
                <path strokeLinecap="square" d="M4 12h15m0 0l-6-6m6 6l-6 6" />
              </svg>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}