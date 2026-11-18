"use client";

/**
 * Team - DGM HOUSE "meet the team"
 *
 * Desktop: three tall cards in a row. Hover / focus / click one and it widens to
 * reveal the bio, skills and links while the other two slim down. A cursor
 * spotlight follows you inside each card, and the card's initial (D / G / M)
 * fills in when it opens.
 * Mobile: cards stack and every bio is open.
 *
 * Id is "about" so the navbar's "About Us" link lands here.
 * Edit the MEMBERS array below. Roles, bios and skills are PLACEHOLDERS.
 * Add `image: "/team/gagan.jpg"` to a member to swap the initial for a photo
 * (shown greyscale, colour on open). Add `links` to show pills like GitHub / LinkedIn.
 */

import React, { useEffect, useRef, useState } from "react";
import { display, mono, sans } from "./fonts";

const LIME = "#c6ff2e";
const INK = "#09090c";
const BONE = "#ece9e0";
const EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

export interface Member {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  image?: string;
  links?: { label: string; href: string }[];
}
export interface TeamProps {
  members?: Member[];
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  intro?: string;
  values?: string[];
}

const MEMBERS: Member[] = [
  {
    name: "Deekshith",
    role: "Co-founder · Design & Frontend",
    bio: "Obsessed with how a website feels in the first three seconds. Turns your brand into pages that look sharp, load fast and make people want to scroll.",
    skills: ["UI design", "React & Next.js", "Motion", "Branding"],
    image: "/team/deeki.jpeg",
  },
  {
    name: "Gagan",
    role: "Co-founder · Full-stack & AI",
    bio: "Builds the engine under the hood: full-stack apps, payments and smart automation. If it needs to work reliably at 2 a.m., he's the one who builds it.",
    skills: ["MERN stack", "Next.js", "AI / ML", "Payments"],
    image: "/team/gagan.jpeg",
  },
  {
    name: "Mokshith",
    role: "Co-founder · Backend & Cloud",
    bio: "Keeps everything fast, secure and online. Databases, hosting and launch day are his, so your site stays up and your data stays safe.",
    skills: ["APIs & databases", "Cloud hosting", "Security", "Performance"],
    image: "/team/moki.jpeg",
  },
];

const VALUES = [
  "Talk directly with the person writing your code",
  "Honest advice, zero agency buzzwords",
  "Here with you before, during, and long after launch",
];

const INITIALS = ["D", "G", "M"];

export default function Team({
  members = MEMBERS,
  eyebrow = "The team",
  title = "Three people.",
  titleHighlight = "Zero middlemen.",
  intro = "We're Deekshith, Gagan, and Mokshith. When you work with DGM House, you deal directly with the three of us who actually design, code, and deploy your product. No account managers, no telephone games -just three builders who genuinely care about getting it right.",
  values = VALUES,
}: TeamProps) {
  const n = members.length;
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // If navigated to directly or already in viewport
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight + 150 && r.bottom > 0) {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Timely auto-rotation across members unless paused by user interaction
  useEffect(() => {
    if (!seen || isPaused || n <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % n);
    }, 3600);
    return () => clearInterval(timer);
  }, [seen, isPaused, n]);

  const spot = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const rv = (delay: number) => ({
    className: `transition-all duration-1000 ${EASE} ${seen ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-sm"}`,
    style: { transitionDelay: `${delay}ms` } as React.CSSProperties,
  });

  return (
    <section id="about" ref={sectionRef} className={`${sans.className} dgm-team relative scroll-mt-20 overflow-hidden text-white selection:bg-[#c6ff2e] selection:text-[#09090c]`} style={{ background: INK, color: BONE }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .dgm-team *, .dgm-team *::before, .dgm-team *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; transition-delay: 0ms !important; }
        }
      `}</style>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(198,255,46,.5), transparent)" }} />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[22%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]" style={{ background: "rgba(198,255,46,.07)" }} />

      <div className="relative mx-auto max-w-7xl px-5 pb-28 pt-32 sm:px-8 lg:pt-40">
        {/* ───────── Header ───────── */}
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p {...rv(0)} className={`${mono.className} mb-6 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] ${rv(0).className}`} style={{ ...rv(0).style, color: LIME }}>
            <span className="h-px w-8" style={{ background: LIME }} />
            {eyebrow}
            <span className="h-px w-8" style={{ background: LIME }} />
          </p>
          <h2 className={`${display.className} text-[clamp(2rem,5.4vw,4.8rem)] font-bold leading-[1.06] tracking-[-0.04em] ${rv(100).className}`} style={{ ...rv(100).style, color: BONE }}>
            {title} <span style={{ color: LIME, textShadow: "0 0 44px rgba(198,255,46,.35)" }}>{titleHighlight}</span>
          </h2>
          <p className={`mt-7 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg ${rv(220).className}`} style={rv(220).style}>
            {intro}
          </p>
        </div>

        {/* ───────── Cards ───────── */}
        <div
          ref={gridRef}
          className="mt-16 flex flex-col gap-3 lg:mt-20 lg:h-[min(76svh,640px)] lg:flex-row"
          onPointerEnter={() => setIsPaused(true)}
          onPointerLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {members.map((m, i) => {
            const on = i === active;
            return (
              <article
                key={m.name}
                tabIndex={0}
                aria-label={`${m.name}`}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") {
                    setActive(i);
                    setIsPaused(true);
                  }
                }}
                onPointerMove={spot}
                onFocus={() => {
                  setActive(i);
                  setIsPaused(true);
                }}
                onClick={() => {
                  setActive(i);
                  setIsPaused(true);
                }}
                className={`group relative flex min-h-[26rem] cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border p-6 outline-none transition-[flex-grow,border-color,background-color,opacity,transform] duration-[900ms] ${EASE} focus-visible:border-[#c6ff2e]/60 sm:p-8 lg:min-h-0 lg:min-w-0 lg:basis-0 ${
                  on ? "border-[#c6ff2e]/30 bg-white/[0.05] lg:grow-[2.6]" : "border-white/10 bg-white/[0.02] hover:border-white/20 lg:grow"
                } ${seen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transitionDelay: seen ? `${i * 120}ms, 0ms, 0ms, ${300 + i * 120}ms, ${300 + i * 120}ms` : "0ms" }}
              >
                {/* cursor spotlight */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(198,255,46,.13), transparent 70%)" }}
                />
                <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "26px 26px" }} />

                {/* portrait: photo or fallback */}
                {m.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.image}
                    alt=""
                    draggable={false}
                    className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ${EASE} ${on ? "scale-100 opacity-60 grayscale-0" : "scale-105 opacity-25 grayscale"}`}
                  />
                ) : null}

                {/* 'D', 'G', 'M' initial overlay on top of photo when not in focus (bottom right) */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute bottom-4 right-4 z-10 flex items-end justify-end transition-all duration-700 ${EASE} sm:bottom-6 sm:right-6 ${
                    on ? "opacity-0 scale-90 translate-y-3 blur-sm pointer-events-none" : "opacity-85 scale-100 translate-y-0 blur-0"
                  }`}
                >
                  <span
                    className={`${display.className} select-none text-[clamp(4.5rem,8.5vw,7.5rem)] font-black uppercase leading-none tracking-tighter`}
                    style={{
                      color: "rgba(198,255,46,.1)",
                      WebkitTextStroke: `2px ${LIME}`,
                      textShadow: "0 0 32px rgba(198,255,46,.4)",
                    }}
                  >
                    {INITIALS[i % INITIALS.length]}
                  </span>
                </div>

                <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5" style={{ background: `linear-gradient(to top, ${INK} 25%, transparent)` }} />

                {/* top row: status indicator without number counter */}
                <div className="relative z-10 flex items-center justify-end">
                  <span className="relative flex h-2.5 w-2.5" aria-hidden>
                    <span className={`absolute inline-flex h-full w-full rounded-full transition-opacity duration-500 ${on ? "animate-ping opacity-70" : "opacity-0"}`} style={{ background: LIME }} />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-500" style={{ background: on ? LIME : "rgba(255,255,255,.2)" }} />
                  </span>
                </div>

                {/* bottom: name + reveal */}
                <div className="relative z-10 mt-24">
                  {/* <p className={`${mono.className} mb-3 text-[10.5px] uppercase tracking-[0.22em] text-neutral-400`}>{m.role}</p> */}
                  <h3 className={`${display.className} text-[clamp(1.5rem,2.2vw,2.3rem)] font-bold uppercase leading-none tracking-[-0.04em]`} style={{ color: BONE }}>
                    {m.name}
                  </h3>

                  <div className={`grid transition-all duration-[900ms] ${EASE} grid-rows-[1fr] opacity-100 ${on ? "lg:grid-rows-[1fr] lg:opacity-100" : "lg:grid-rows-[0fr] lg:opacity-0"}`}>
                    <div className="overflow-hidden">
                      {/* <p className="mt-5 max-w-md text-[14px] leading-relaxed text-neutral-300 sm:text-[15px]">{m.bio}</p> */}
                      {/* <ul className="mt-5 flex flex-wrap gap-2">
                        {m.skills.map((s) => (
                          <li key={s} className={`${mono.className} rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-neutral-300`}>
                            {s}
                          </li>
                        ))}
                      </ul> */}
                      {!!m.links?.length && (
                        <div className="mt-5 flex flex-wrap gap-4">
                          {m.links.map((l) => (
                            <a
                              key={l.label}
                              href={l.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              tabIndex={on ? 0 : -1}
                              className={`${mono.className} group/l inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors hover:text-white`}
                              style={{ color: LIME }}
                            >
                              {l.label}
                              <span className="transition-transform duration-300 group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5">↗</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ───────── Values ───────── */}
        <ul className={`mx-auto mt-14 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 ${rv(500).className}`} style={rv(500).style}>
          {values.map((v) => (
            <li key={v} className="flex items-center gap-2 text-[13px] text-neutral-400">
              <span className="h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: LIME }} />
              {v}
            </li>
          ))}
        </ul>

        {/* ───────── Closing line ───────── */}
        <div className={`mt-20 flex flex-col items-center gap-8 text-center ${rv(650).className}`} style={rv(650).style}>
          <p className={`${display.className} text-[clamp(1.6rem,4vw,3.4rem)] font-bold leading-[1.1] tracking-[-0.04em]`} style={{ color: BONE }}>
            Want to meet us <span style={{ color: LIME, textShadow: "0 0 44px rgba(198,255,46,.35)" }}>for real?</span>
          </p>
          <a
            href="tel:+6360344703"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-9 py-4 text-sm font-bold transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_-8px_rgba(198,255,46,.7)] active:scale-95"
            style={{ background: LIME, color: INK }}
          >
            <span className="relative">Connect</span>
            <svg className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.6" viewBox="0 0 24 24">
              <path strokeLinecap="square" d="M4 12h15m0 0l-6-6m6 6l-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}