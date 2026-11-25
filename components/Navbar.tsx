"use client";

/**
 * Navbar -DGM HOUSE
 *
 *  Layout (three zones across the full width)
 *  • Left   -logo, plain and uncropped, no box around it
 *  • Centre -the only bordered element: a glass pill holding the links
 *  • Right  -"Book a call", no border
 *  The whole bar glides away when you scroll down and returns when you scroll up.
 *
 *  Motion
 *  • Logo fades in from the left with a soft blur, glows on hover
 *  • Pill drops in; links appear one by one
 *  • Soft lime spotlight follows your cursor inside the pill
 *  • Links roll up to reveal a bright twin; underline grows under the section you're reading
 *  • Services menu scales in, items rise one after another
 *  • Book a call: magnetic, breathing glow, shine sweep, phone rings on hover
 *  • Reading-progress line with a glow along the pill's bottom edge
 *  • Mobile: menu opens as a circle expanding from the menu button, links stagger in
 *  • Respects "reduce motion"
 *
 * Logo: put dgm-wordmark.png in /public (transparent wordmark, no cropping needed).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { display, mono, sans } from "./fonts";

const LIME = "#c6ff2e";
const INK = "#09090c";
const BONE = "#ece9e0";
const EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

export interface NavChild {
  title: string;
  desc: string;
  href: string;
}
export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}
export interface NavbarProps {
  /** Path to the transparent wordmark inside /public */
  logoSrc?: string;
  items?: NavItem[];
  ctaText?: string;
  ctaLink?: string;
  /** e.g. "https://wa.me/91XXXXXXXXXX" -shows a WhatsApp button when provided */
  whatsappLink?: string;
  /** Shown in the mobile menu when provided */
  email?: string;
}

const DEFAULT_ITEMS: NavItem[] = [
  {
    label: "Services",
    href: "#services",
    children: [
      { title: "Business Websites", desc: "Fast, good-looking sites that help customers find and trust you.", href: "#services" },
      { title: "Online Stores", desc: "Sell your products online with easy payments and order tracking.", href: "#services" },
      { title: "Mobile Apps", desc: "Android and iPhone apps your customers will actually enjoy using.", href: "#services" },
      { title: "Custom Software", desc: "Billing, bookings, stock -tools made around the way you work.", href: "#services" },
      { title: "Smart Automation", desc: "WhatsApp helpers and chatbots that save you hours every week.", href: "#services" },
      { title: "Website Care", desc: "We keep your site safe, fast and up to date, so you don't have to.", href: "#services" },
    ],
  },
  { label: "Our Work", href: "#work" },
  { label: "How We Work", href: "#process" },
  { label: "About Us", href: "#about" },
];

const PhoneIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  </svg>
);

export default function Navbar({
  logoSrc = "/logo.svg",
  items = DEFAULT_ITEMS,
  ctaText = "Connect",
  ctaLink = "tel:+916360344703",
  whatsappLink,
  email,
}: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [active, setActive] = useState("");
  const [pill, setPill] = useState({ x: 0, w: 0, show: false });

  const progressRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const liRefs = useRef<(HTMLLIElement | null)[]>([]);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* ---------- entrance ---------- */
  useEffect(() => {
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---------- scroll: glass, hide/show, progress ---------- */
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const isScrolled = y > 24;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
      if (y > lastY + 6 && y > 160) {
        setHidden((prev) => (!prev ? true : prev));
      } else if (y < lastY - 6 || y <= 160) {
        setHidden((prev) => (prev ? false : prev));
      }
      if (Math.abs(y - lastY) > 6) lastY = y;
      if (y < 200) setActive("");
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ---------- which section is on screen ---------- */
  useEffect(() => {
    const ids = items
      .map((i) => i.href)
      .filter((h) => h.startsWith("#") && h.length > 1)
      .map((h) => h.slice(1));
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  /* ---------- mobile menu: lock scroll, Esc, resize ---------- */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDropdown(false);
      }
    };
    const onResize = () => window.innerWidth >= 1024 && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  /* ---------- smooth in-page links, offset for the bar ---------- */
  const go = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    setDropdown(false);
    if (!href.startsWith("#")) return;
    if (href === "#" || href === "#top") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      return;
    }
    const el = document.getElementById(href.slice(1));
    if (el) {
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  /* ---------- dropdown hover with a small grace delay ---------- */
  const openDD = () => {
    clearTimeout(closeTimer.current);
    setDropdown(true);
  };
  const closeDD = () => {
    closeTimer.current = setTimeout(() => setDropdown(false), 140);
  };

  /* ---------- pill spotlight ---------- */
  const onBarMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = barRef.current;
    if (!el) return;
    el.style.setProperty("--mx", `${e.nativeEvent.offsetX}px`);
  };

  /* ---------- magnetic CTA ---------- */
  const ctaRectRef = useRef<DOMRect | null>(null);
  const onCtaEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    ctaRectRef.current = e.currentTarget.getBoundingClientRect();
  };
  const onCtaMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ctaRef.current;
    if (!el) return;
    if (!ctaRectRef.current) ctaRectRef.current = el.getBoundingClientRect();
    const r = ctaRectRef.current;
    el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.22}px, ${(e.clientY - (r.top + r.height / 2)) * 0.28}px)`;
  };
  const onCtaLeave = () => {
    ctaRectRef.current = null;
    if (ctaRef.current) ctaRef.current.style.transform = "";
  };

  const isHidden = hidden && !menuOpen && !dropdown;

  return (
    <>
      <style>{`
        @keyframes dgm-nav-sheen { from { transform: translateX(-130%) skewX(-20deg); } to { transform: translateX(330%) skewX(-20deg); } }
        @keyframes dgm-nav-ring { 0%,100% { transform: rotate(0); } 15% { transform: rotate(-16deg); } 30% { transform: rotate(14deg); } 45% { transform: rotate(-10deg); } 60% { transform: rotate(8deg); } 75% { transform: rotate(0); } }
        @keyframes dgm-nav-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(198,255,46,0); } 50% { box-shadow: 0 0 30px -4px rgba(198,255,46,.5); } }
        @keyframes dgm-logo-flash { 0%,100% { filter: drop-shadow(0 0 0 rgba(198,255,46,0)); } 40% { filter: drop-shadow(0 0 16px rgba(198,255,46,.75)) brightness(1.25); } }
        @media (prefers-reduced-motion: reduce) {
          .dgm-nav, .dgm-nav * { animation: none !important; transition-duration: .01ms !important; transition-delay: 0ms !important; }
        }
      `}</style>

      {/* ───────── Header: hides as one piece on scroll down ───────── */}
      <header
        className={`dgm-nav ${sans.className} pointer-events-none fixed inset-x-0 top-0 z-[60] transition-transform duration-700 ${EASE} ${isHidden ? "-translate-y-[130%]" : "translate-y-0"}`}
      >
        {/* soft fade so logo + button stay readable over page content */}
        <div
          aria-hidden
          className={`absolute inset-x-0 top-0 h-28 transition-opacity duration-700 ${scrolled ? "opacity-100" : "opacity-0"}`}
          style={{ background: "linear-gradient(to bottom, rgba(9,9,12,.85), rgba(9,9,12,.4) 55%, transparent)" }}
        />

        <div className="relative mx-auto flex h-[76px] w-full max-w-[1760px] items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* ── Left: logo (no crop, no box) ── */}
          <a
            href="#top"
            onClick={(e) => go(e, "#top")}
            aria-label="DGM House -back to top"
            className={`pointer-events-auto relative z-[2] block shrink-0 transition-all duration-1000 ${EASE} ${mounted ? "translate-x-0 opacity-100 blur-0" : "-translate-x-6 opacity-0 blur-sm"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="DGM House"
              draggable={false}
              className={`block h-36 w-auto select-none transition-all duration-500 ${EASE} hover:-translate-y-0.5 hover:scale-[1.04] hover:drop-shadow-[0_0_14px_rgba(198,255,46,.55)] sm:h-40`}
              style={{ animation: mounted ? "dgm-logo-flash 1.6s ease 1s both" : undefined }}
            />
          </a>

          {/* ── Centre: the only bordered thing -links pill ── */}
          <div
            ref={barRef}
            onMouseMove={onBarMove}
            className={`group/bar pointer-events-auto absolute left-1/2 top-1/2 z-[1] hidden h-12 -translate-x-1/2 items-center rounded-full border px-1.5 transition-all duration-700 ${EASE} lg:flex ${
              scrolled ? "border-white/[0.12] bg-[#09090c]/70 shadow-[0_12px_40px_-12px_rgba(0,0,0,.8)] backdrop-blur-xl" : "border-white/[0.08] bg-white/[0.03] backdrop-blur-md"
            } ${mounted ? "-translate-y-1/2 opacity-100" : "-translate-y-[calc(50%+16px)] opacity-0"}`}
            style={{ transitionDelay: mounted ? "150ms" : "0ms" }}
          >
            {/* cursor spotlight */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover/bar:opacity-100"
              style={{ background: "radial-gradient(180px circle at var(--mx, 50%) 50%, rgba(198,255,46,.12), transparent 70%)" }}
            />

            <ul className="relative z-[1] flex items-center" onMouseLeave={() => setPill((p) => ({ ...p, show: false }))}>
              <span
                aria-hidden
                className="absolute top-1/2 h-9 -translate-y-1/2 rounded-full bg-white/[0.08] transition-[left,width,opacity] duration-300 ease-out"
                style={{ left: pill.x, width: pill.w, opacity: pill.show ? 1 : 0 }}
              />
              {items.map((it, i) => {
                const isActive = active === it.href.slice(1);
                return (
                  <li
                    key={it.label}
                    ref={(el) => {
                      liRefs.current[i] = el;
                    }}
                    className={`relative transition-all duration-700 ${EASE} ${mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                    style={{ transitionDelay: mounted ? `${420 + i * 90}ms` : "0ms" }}
                    onMouseEnter={() => {
                      const el = liRefs.current[i];
                      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth, show: true });
                      if (it.children) openDD();
                    }}
                    onMouseLeave={() => it.children && closeDD()}
                    onFocus={() => it.children && openDD()}
                    onBlur={(e) => {
                      if (it.children && !e.currentTarget.contains(e.relatedTarget as Node)) closeDD();
                    }}
                  >
                    <a
                      href={it.href}
                      onClick={(e) => go(e, it.href)}
                      aria-haspopup={it.children ? "true" : undefined}
                      aria-expanded={it.children ? dropdown : undefined}
                      className="group/link relative flex h-9 items-center gap-1.5 px-4 text-[13px] font-medium focus-visible:outline-none"
                    >
                      <span className="relative block h-[1.25em] overflow-hidden leading-[1.25]">
                        <span className={`block transition-transform duration-500 ${EASE} group-hover/link:-translate-y-full group-focus-visible/link:-translate-y-full`} style={{ color: isActive ? BONE : "#a3a3a3" }}>
                          {it.label}
                        </span>
                        <span aria-hidden className={`absolute left-0 top-full block transition-transform duration-500 ${EASE} group-hover/link:-translate-y-full group-focus-visible/link:-translate-y-full`} style={{ color: LIME }}>
                          {it.label}
                        </span>
                      </span>
                      {it.children && (
                        <svg className={`h-3 w-3 text-neutral-500 transition-all duration-500 ${EASE} ${dropdown ? "rotate-180 !text-[#c6ff2e]" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <span
                        aria-hidden
                        className={`absolute inset-x-4 bottom-[3px] h-px origin-center transition-transform duration-500 ${EASE} ${isActive ? "scale-x-100" : "scale-x-0"}`}
                        style={{ background: LIME, boxShadow: "0 0 8px rgba(198,255,46,.9)" }}
                      />
                    </a>

                    {it.children && (
                      <div
                        className={`absolute left-0 top-full w-[580px] origin-top-left pt-5 transition-all duration-500 ${EASE} ${
                          dropdown ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-95 opacity-0"
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-1.5 rounded-3xl border border-white/10 bg-[#0c0c10]/90 p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] backdrop-blur-2xl">
                          {it.children.map((c, ci) => (
                            <a
                              key={c.title}
                              href={c.href}
                              tabIndex={dropdown ? 0 : -1}
                              onClick={(e) => go(e, c.href)}
                              className={`group/item rounded-2xl p-3.5 duration-500 ${EASE} hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none ${dropdown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
                              style={{
                                transitionProperty: "opacity, transform, background-color",
                                transitionDelay: dropdown ? `${80 + ci * 50}ms, ${80 + ci * 50}ms, 0ms` : "0ms",
                              }}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`${mono.className} text-[10px] font-bold`} style={{ color: LIME }}>
                                  0{ci + 1}
                                </span>
                                <span className={`${display.className} text-[13px] font-semibold tracking-tight`} style={{ color: BONE }}>
                                  {c.title}
                                </span>
                                <svg className="ml-auto h-3.5 w-3.5 -translate-x-2 text-[#c6ff2e] opacity-0 transition-all duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                                  <path d="M3 8h10m0 0L9 4m4 4L9 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 transition-colors group-hover/item:text-neutral-300">{c.desc}</p>
                            </a>
                          ))}
                          <a
                            href={ctaLink}
                            tabIndex={dropdown ? 0 : -1}
                            onClick={(e) => go(e, ctaLink)}
                            className={`col-span-2 mt-1 flex items-center justify-between gap-4 rounded-2xl border p-3.5 text-[13px] duration-500 ${EASE} hover:bg-[#c6ff2e]/10 focus-visible:outline-none ${dropdown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
                            style={{
                              borderColor: "rgba(198,255,46,.22)",
                              background: "rgba(198,255,46,.05)",
                              color: BONE,
                              transitionProperty: "opacity, transform, background-color",
                              transitionDelay: dropdown ? `${80 + it.children.length * 50}ms, ${80 + it.children.length * 50}ms, 0ms` : "0ms",
                            }}
                          >
                            <span>Not sure what you need? Tell us your idea and we&apos;ll help you figure it out.</span>
                            <span className={`${mono.className} shrink-0 text-xs font-bold`} style={{ color: LIME }}>
                              Let&apos;s talk →
                            </span>
                          </a>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Reading progress */}
            <div aria-hidden className={`pointer-events-none absolute inset-x-6 bottom-0 h-[2px] transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}>
              <div ref={progressRef} className="h-full origin-left rounded-full" style={{ transform: "scaleX(0)", background: `linear-gradient(90deg, transparent, ${LIME})`, boxShadow: "0 0 12px rgba(198,255,46,.9)" }} />
            </div>
          </div>

          {/* ── Right: Book a call (no border) ── */}
          <div className="relative z-[2] flex items-center gap-2.5">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className={`pointer-events-auto hidden h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-neutral-300 transition-all duration-500 ${EASE} hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-[#c6ff2e] lg:flex ${mounted ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
                style={{ transitionDelay: mounted ? "700ms" : "0ms" }}
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5Z" />
                  <path d="M9 9.2c.3 2.4 2.4 4.5 4.8 4.8l1.2-1.3-1.8-1-.8.6a3 3 0 0 1-1.7-1.7l.6-.8-1-1.8L9 9.2Z" />
                </svg>
              </a>
            )}

            <div className={`pointer-events-auto hidden transition-all duration-700 ${EASE} lg:block ${mounted ? "scale-100 opacity-100" : "scale-90 opacity-0"}`} style={{ transitionDelay: mounted ? "780ms" : "0ms" }}>
              <a
                ref={ctaRef}
                href={ctaLink}
                onClick={(e) => go(e, ctaLink)}
                onMouseEnter={onCtaEnter}
                onMouseMove={onCtaMove}
                onMouseLeave={onCtaLeave}
                className="group/cta relative inline-flex h-11 animate-[dgm-nav-glow_3.4s_ease-in-out_infinite] items-center gap-1.5 overflow-hidden rounded-full pl-5 pr-6 text-[14px] font-bold transition-transform duration-200 ease-out hover:animate-none hover:shadow-[0_0_44px_-4px_rgba(198,255,46,.8)] active:scale-95"
                style={{ background: LIME, color: INK }}
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/60 opacity-0 blur-md group-hover/cta:animate-[dgm-nav-sheen_0.9s_ease] group-hover/cta:opacity-100" />
                <PhoneIcon className="relative h-4 w-4 origin-center group-hover/cta:animate-[dgm-nav-ring_0.9s_ease]" />
                <span className="relative">{ctaText}</span>
              </a>
            </div>

            {/* Hamburger (mobile) -no border */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="dgm-mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
              className={`pointer-events-auto relative flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] transition-all duration-500 ${EASE} hover:bg-white/[0.1] active:scale-90 lg:hidden ${mounted ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
              style={{ transitionDelay: mounted ? "300ms" : "0ms" }}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-[2px] w-full rounded transition-all duration-500 ${EASE} ${menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`} style={{ background: BONE }} />
                <span className={`absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded transition-all duration-300 ${menuOpen ? "w-0 opacity-0" : "w-3/4"}`} style={{ background: LIME }} />
                <span className={`absolute left-0 h-[2px] w-full rounded transition-all duration-500 ${EASE} ${menuOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : "bottom-0"}`} style={{ background: BONE }} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ───────── Mobile menu: opens as a circle from the menu button ───────── */}
      <div
        id="dgm-mobile-menu"
        aria-hidden={!menuOpen}
        className={`dgm-nav ${sans.className} fixed inset-0 z-[55] transition-[clip-path,visibility] duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)] lg:hidden ${menuOpen ? "visible" : "invisible"}`}
        style={{
          background: "rgba(9,9,12,.97)",
          backdropFilter: "blur(24px)",
          clipPath: menuOpen ? "circle(150vmax at calc(100% - 42px) 38px)" : "circle(0px at calc(100% - 42px) 38px)",
        }}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-32 left-1/2 h-80 w-[120%] -translate-x-1/2" style={{ background: "radial-gradient(ellipse at center, rgba(198,255,46,.14), transparent 65%)" }} />
          <div className={`${display.className} absolute -bottom-10 -right-6 select-none text-[34vw] font-black leading-none opacity-[0.035]`} style={{ color: LIME }}>
            {"</>"}
          </div>
        </div>

        <div className="relative flex h-full flex-col justify-between overflow-y-auto px-6 pb-8 pt-28">
          <nav aria-label="Mobile">
            <ul>
              {items.map((it, i) => (
                <li
                  key={it.label}
                  className={`border-b border-white/10 py-4 transition-all duration-700 ${EASE} ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                  style={{ transitionDelay: menuOpen ? `${280 + i * 80}ms` : "0ms" }}
                >
                  <a href={it.href} onClick={(e) => go(e, it.href)} className={`${display.className} flex items-baseline justify-between text-[clamp(1.6rem,7vw,2.3rem)] font-bold tracking-[-0.03em]`} style={{ color: BONE }}>
                    <span>{it.label}</span>
                    <span className={`${mono.className} text-xs font-medium`} style={{ color: LIME }}>
                      0{i + 1}
                    </span>
                  </a>
                  {it.children && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {it.children.map((c) => (
                        <a key={c.title} href={c.href} onClick={(e) => go(e, c.href)} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-neutral-300 transition-colors active:border-[#c6ff2e]/50">
                          {c.title}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div
            className={`mt-10 space-y-4 transition-all duration-700 ${EASE} ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: menuOpen ? `${280 + items.length * 80 + 80}ms` : "0ms" }}
          >
            <a href={ctaLink} onClick={(e) => go(e, ctaLink)} className="flex w-full items-center justify-center gap-2.5 rounded-full py-4 text-sm font-bold" style={{ background: LIME, color: INK }}>
              <PhoneIcon className="h-4 w-4" />
              {ctaText}
            </a>
            {(whatsappLink || email) && (
              <div className="flex flex-col gap-2 text-center text-sm text-neutral-400">
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 py-3 transition-colors active:border-[#c6ff2e]/50">
                    Message us on WhatsApp
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="py-1 transition-colors hover:text-white">
                    {email}
                  </a>
                )}
              </div>
            )}
            <p className="pt-2 text-center text-xs text-neutral-500">Let&apos;s build something you&apos;ll be proud of.</p>
          </div>
        </div>
      </div>
    </>
  );
}