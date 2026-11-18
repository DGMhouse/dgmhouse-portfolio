"use client";

/**
 * Projects - DGM HOUSE selected work
 *
 * Full-viewport horizontal carousel rendered in WebGL (vanilla three, no GSAP).
 *  - Every card is a high-segment plane with its own canvas texture.
 *  - Vertex shader flares the top/bottom edges and pulls the sides outward as you
 *    move away from the centre -> concave panoramic screen. Neighbours peek in.
 *  - Post pass adds a subtle RGB split + soft falloff on the extreme left/right.
 *  - Wheel, drag and touch swipe feed a target; position eases to it (damped lerp)
 *    and snaps to the nearest slide when input stops.
 *
 * Wheel only hijacks the page while the section is in view and the carousel can still
 * move; at either end the page scrolls on as normal.
 *
 * Setup:  npm i three && npm i -D @types/three
 * Replace placeholder mockups by setting `image` (e.g. "/projects/gire.jpg") on a project.
 * Colours must be #rrggbb. Subtitles below are placeholders - edit them.
 */

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { display, mono, sans } from "./fonts";

const LIME = "#c6ff2e";
const INK = "#09090c";
const BONE = "#ece9e0";
const LAVENDER = "#cbbdf5";
const MUTED = "#d6d1c2";
const PALETTE = [MUTED, LIME, LAVENDER];

export interface Project {
    title: string;
    subtitle: string;
    url: string;
    /** Screenshot path in /public. Falls back to a generated mockup. */
    image?: string;
    /** Card background, #rrggbb. Defaults to a muted / lime / lavender cycle. */
    color?: string;
}
export interface ProjectsProps {
    projects?: Project[];
    eyebrow?: string;
    title?: string;
    titleHighlight?: string;
    intro?: string;
}

const EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

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

const DEFAULT_PROJECTS: Project[] = [
    { title: "Ruva Online", subtitle: "Online store", url: "https://www.ruvaonline.com/", image: "/projects/ruva.png" },
    { title: "Bella Vista Homestay", subtitle: "Homestay", url: "https://www.bellavistahomestay.com/", image: "/projects/bellavista.png" },
    { title: "Artsy Estate Stay", subtitle: "Estate stay", url: "https://www.artsyestatestay.com/", image: "/projects/artsy.png" },
    { title: "Holmac Interior", subtitle: "Interior design", url: "https://www.holmacinterior.com/", image: "/projects/holmac.png" },
    { title: "Trident Academy", subtitle: "SAP training · Mangaluru", url: "https://www.tridentacademy.co.in/", image: "/projects/trident.png" },
    { title: "Gire Adventures", subtitle: "Adventure travel", url: "https://gireadventures.com/", image: "/projects/gire.png" },
    { title: "SSM Skincare", subtitle: "Skincare", url: "https://www.ssmskincare.com/", image: "/projects/ssm.png" },
    { title: "Fortune Udupi", subtitle: "Academy", url: "https://www.fortuneudupi.in/", image: "/projects/fortune.png" },
    { title: "MarketSphere", subtitle: "Chikkamagaluru", url: "https://www.marketspherechikkamagaluru.in/", image: '/projects/marketsphere.png' },
];

/* ═════════════════════════ Shaders ═════════════════════════ */

const CARD_VERT = /* glsl */ `
  uniform float uViewW;
  uniform float uFlare;
  uniform float uPull;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    float nx = wp.x / (uViewW * 0.5);
    float a = nx * nx;
    wp.y *= 1.0 + uFlare * a;
    wp.x += nx * a * uPull * uViewW;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const CARD_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  void main() { gl_FragColor = texture2D(uMap, vUv); }
`;
const POST_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const POST_FRAG = /* glsl */ `
  uniform sampler2D tScene;
  uniform vec3 uInk;
  uniform float uAb;
  uniform float uTime;
  varying vec2 vUv;
  vec3 comp(vec2 uv) {
    vec4 s = texture2D(tScene, uv);
    return mix(uInk, s.rgb, s.a);
  }
  void main() {
    float nx = vUv.x * 2.0 - 1.0;
    float o = nx * nx * nx * uAb;
    float r = comp(vec2(vUv.x - o, vUv.y)).r;
    vec3 g = comp(vUv);
    float b = comp(vec2(vUv.x + o, vUv.y)).b;
    vec3 c = vec3(r, g.g, b);
    c *= 1.0 - 0.2 * abs(nx * nx * nx);
    float gr = fract(sin(dot(gl_FragCoord.xy + uTime * 60.0, vec2(12.9898, 78.233))) * 43758.5453);
    c += (gr - 0.5) * 0.028;
    gl_FragColor = vec4(c, 1.0);
  }
`;

/* ═════════════════════════ Card painter ═════════════════════════ */

type Fonts = { display: string; mono: string };
type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

const pad = (v: number) => String(v).padStart(2, "0");
const hostOf = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
};

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawCard(ctx: Ctx, w: number, h: number, p: Project, i: number, n: number, color: string, img: HTMLImageElement | null, f: Fonts) {
    const portrait = h > w;
    const ls = (v: number) => {
        if ("letterSpacing" in ctx) ctx.letterSpacing = `${v}px`;
    };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = INK;

    /* title (wraps to two balanced lines when too wide) */
    const title = p.title.toUpperCase();
    const maxW = w * 0.88;
    let fs = portrait ? Math.min(w * 0.1, h * 0.075) : Math.min(w * 0.07, h * 0.1);
    const setT = (s: number) => {
        ctx.font = `700 ${s}px ${f.display}`;
        ls(-0.03 * s);
    };
    setT(fs);
    let lines = [title];
    if (ctx.measureText(title).width > maxW) {
        const words = title.split(" ");
        if (words.length > 1) {
            let best = 1;
            let bd = Infinity;
            for (let k = 1; k < words.length; k++) {
                const d = Math.abs(ctx.measureText(words.slice(0, k).join(" ")).width - ctx.measureText(words.slice(k).join(" ")).width);
                if (d < bd) {
                    bd = d;
                    best = k;
                }
            }
            lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
        }
        const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
        if (widest > maxW) {
            fs *= maxW / widest;
            setT(fs);
        }
    }
    let y = h * 0.065;
    lines.forEach((l) => {
        ctx.fillText(l, w / 2, y);
        y += fs;
    });

    /* subtitle */
    const sfs = portrait ? w * 0.032 : Math.min(w * 0.0155, h * 0.024);
    ctx.font = `500 ${sfs}px ${f.mono}`;
    ls(sfs * 0.18);
    ctx.fillText(p.subtitle.toUpperCase(), w / 2, y + fs * 0.3);

    /* frame */
    const fw = portrait ? w * 0.82 : Math.min(w * 0.64, h * 0.58 * 1.65);
    const fh = portrait ? Math.min(h * 0.58, fw * 0.8) : Math.min(h * 0.58, fw / 1.6);
    const fx = (w - fw) / 2;
    const fy = h * 0.27;
    const r = Math.min(w, h) * 0.012;

    ctx.save();
    ctx.shadowColor = "rgba(9,9,12,.35)";
    ctx.shadowBlur = h * 0.05;
    ctx.shadowOffsetY = h * 0.02;
    ctx.fillStyle = INK;
    rr(ctx, fx, fy, fw, fh, r);
    ctx.fill();
    ctx.restore();

    ctx.save();
    rr(ctx, fx, fy, fw, fh, r);
    ctx.clip();
    if (img) {
        const iw = img.naturalWidth || img.width || 1;
        const ih = img.naturalHeight || img.height || 1;
        const s = Math.max(fw / iw, fh / ih);
        const dw = iw * s;
        const dh = ih * s;
        ctx.drawImage(img, fx + (fw - dw) / 2, fy, dw, dh);
    } else {
        const bh = fh * 0.09;
        const y0 = fy + bh;
        const bodyH = fh - bh;
        ctx.fillStyle = "#101015";
        ctx.fillRect(fx, fy, fw, fh);
        ctx.fillStyle = "#17171d";
        ctx.fillRect(fx, fy, fw, bh);
        ctx.fillStyle = "rgba(255,255,255,.2)";
        for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.arc(fx + bh * 0.7 + k * bh * 0.4, fy + bh / 2, bh * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "rgba(0,0,0,.45)";
        rr(ctx, fx + bh * 2.2, fy + bh * 0.24, fw * 0.42, bh * 0.52, bh * 0.26);
        ctx.fill();
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `500 ${bh * 0.3}px ${f.mono}`;
        ls(0);
        ctx.fillStyle = "rgba(236,233,224,.65)";
        ctx.fillText(hostOf(p.url), fx + bh * 2.2 + bh * 0.3, fy + bh / 2);

        const gx = fx + fw * 0.78;
        const gy = y0 + bodyH * 0.45;
        const gr = bodyH * 0.5;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        grad.addColorStop(0, color + "bb");
        grad.addColorStop(1, color + "00");
        ctx.fillStyle = grad;
        ctx.fillRect(fx, y0, fw, bodyH);

        let hs = bodyH * 0.1;
        ctx.font = `700 ${hs}px ${f.display}`;
        ls(-0.03 * hs);
        const mw = fw * 0.5;
        const tw = ctx.measureText(p.title).width;
        if (tw > mw) {
            hs *= mw / tw;
            ctx.font = `700 ${hs}px ${f.display}`;
            ls(-0.03 * hs);
        }
        ctx.textBaseline = "top";
        ctx.fillStyle = BONE;
        ctx.fillText(p.title, fx + fw * 0.08, y0 + bodyH * 0.2);
        ctx.fillStyle = "rgba(255,255,255,.14)";
        rr(ctx, fx + fw * 0.08, y0 + bodyH * 0.2 + hs * 1.6, fw * 0.42, bodyH * 0.025, bodyH * 0.012);
        ctx.fill();
        rr(ctx, fx + fw * 0.08, y0 + bodyH * 0.2 + hs * 1.6 + bodyH * 0.06, fw * 0.3, bodyH * 0.025, bodyH * 0.012);
        ctx.fill();
        ctx.fillStyle = color;
        rr(ctx, fx + fw * 0.08, y0 + bodyH * 0.2 + hs * 1.6 + bodyH * 0.14, fw * 0.14, bodyH * 0.075, bodyH * 0.0375);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.06)";
        const cw = (fw * 0.84 - 2 * fw * 0.03) / 3;
        for (let k = 0; k < 3; k++) {
            rr(ctx, fx + fw * 0.08 + k * (cw + fw * 0.03), y0 + bodyH * 0.7, cw, bodyH * 0.22, bodyH * 0.02);
            ctx.fill();
        }
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(236,233,224,.14)";
    ctx.lineWidth = Math.max(1, h * 0.0015);
    rr(ctx, fx, fy, fw, fh, r);
    ctx.stroke();

    /* counter */
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = INK;
    ctx.font = `500 ${sfs * 1.15}px ${f.mono}`;
    ls(sfs * 0.2);
    ctx.fillText(`${pad(i + 1)} / ${pad(n)}`, w / 2, h * 0.92);
}

/* ═════════════════════════ Component ═════════════════════════ */

export default function Projects({
    projects = DEFAULT_PROJECTS,
    eyebrow = "Our projects",
    title = "Real businesses.",
    titleHighlight = "Real launches.",
    intro = "A look at what we've built and shipped. Drag through the work, then hit the link to visit any site live.",
}: ProjectsProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const [ready, setReady] = useState(false);
    const progRef = useRef<HTMLDivElement>(null);
    const goRef = useRef<((d: number) => void) | null>(null);
    const n = projects.length;

    useEffect(() => {
        const host = hostRef.current;
        if (!host || !n) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const fams: Fonts = { display: display.style.fontFamily, mono: mono.style.fontFamily };
        let disposed = false;

        /* ---------- three ---------- */
        const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
        host.appendChild(renderer.domElement);
        const rt = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: false, samples: 4 });

        const scene = new THREE.Scene();
        const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
        cam.position.z = 5;
        const geo = new THREE.PlaneGeometry(1, 1, 120, 40);
        const shared = { uViewW: { value: 1 }, uFlare: { value: 0.42 }, uPull: { value: 0.03 } };

        const cvs = projects.map(() => document.createElement("canvas"));
        const texs = cvs.map((c) => new THREE.CanvasTexture(c));
        texs.forEach((t) => {
            t.minFilter = THREE.LinearFilter;
            t.generateMipmaps = false;
            t.anisotropy = 4;
        });
        const imgs: (HTMLImageElement | null)[] = projects.map(() => null);
        const meshes = projects.map((_, i) => {
            const mat = new THREE.ShaderMaterial({
                vertexShader: CARD_VERT,
                fragmentShader: CARD_FRAG,
                uniforms: { uMap: { value: texs[i] }, ...shared },
                depthTest: false,
                depthWrite: false,
            });
            const m = new THREE.Mesh(geo, mat);
            m.frustumCulled = false;
            scene.add(m);
            return m;
        });

        const postScene = new THREE.Scene();
        const postCam = new THREE.Camera();
        const postMat = new THREE.ShaderMaterial({
            vertexShader: POST_VERT,
            fragmentShader: POST_FRAG,
            uniforms: { tScene: { value: rt.texture }, uInk: { value: new THREE.Vector3(9 / 255, 9 / 255, 12 / 255) }, uAb: { value: 0.006 }, uTime: { value: 0 } },
            depthTest: false,
            depthWrite: false,
        });
        const postGeo = new THREE.PlaneGeometry(2, 2);
        const quad = new THREE.Mesh(postGeo, postMat);
        quad.frustumCulled = false;
        postScene.add(quad);

        /* ---------- layout / paint ---------- */
        let w = 1;
        let h = 1;
        let dpr = 1;
        let cardW = 1;
        let cardH = 1;
        let step = 1;

        const paint = (i: number) => {
            const c = cvs[i];
            const ctx = c.getContext("2d") as Ctx | null;
            if (!ctx) return;
            drawCard(ctx, c.width, c.height, projects[i], i, n, projects[i].color ?? PALETTE[i % PALETTE.length], imgs[i], fams);
            texs[i].needsUpdate = true;
        };
        const repaint = () => {
            const tw = Math.round(Math.min(cardW * Math.min(dpr, 1.5), 1400));
            const th = Math.round((tw * cardH) / cardW);
            cvs.forEach((c, i) => {
                c.width = tw;
                c.height = th;
                texs[i].dispose();
                paint(i);
            });
        };
        const layout = () => {
            w = host.clientWidth || 1;
            h = host.clientHeight || 1;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setPixelRatio(dpr);
            renderer.setSize(w, h, false);
            rt.setSize(Math.round(w * dpr), Math.round(h * dpr));
            cam.left = -w / 2;
            cam.right = w / 2;
            cam.top = h / 2;
            cam.bottom = -h / 2;
            cam.updateProjectionMatrix();
            cardW = w * (w < 700 ? 0.8 : 0.74);
            cardH = h * 0.9;
            step = cardW + w * 0.02;
            shared.uViewW.value = w;
            meshes.forEach((m) => m.scale.set(cardW, cardH, 1));
        };

        projects.forEach((p, i) => {
            if (!p.image) return;
            const imgSrc = p.image;
            const im = new Image();
            if (imgSrc.startsWith("http://") || imgSrc.startsWith("https://")) {
                im.crossOrigin = "anonymous";
            }
            im.onload = () => {
                if (disposed) return;
                imgs[i] = im;
                paint(i);
            };
            im.onerror = () => {
                if (im.crossOrigin) {
                    const fallback = new Image();
                    fallback.onload = () => {
                        if (disposed) return;
                        imgs[i] = fallback;
                        paint(i);
                    };
                    fallback.src = imgSrc;
                }
            };
            im.src = imgSrc;
            if (im.complete && im.naturalWidth > 0) {
                imgs[i] = im;
                paint(i);
            }
        });

        layout();
        repaint();
        Promise.all([document.fonts.load(`700 48px ${fams.display}`), document.fonts.load(`500 14px ${fams.mono}`)])
            .catch(() => { })
            .then(() => {
                if (disposed) return;
                repaint();
                setReady(true);
            });

        let resizeTimer: ReturnType<typeof setTimeout> | undefined;
        const ro = new ResizeObserver(() => {
            layout();
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(repaint, 150);
        });
        ro.observe(host);

        /* ---------- input ---------- */
        let target = 0;
        let pos = 0;
        let vel = 0;
        let dragging = false;
        let startX = 0;
        let lastX = 0;
        let lastT = 0;
        let t0 = 0;
        let snapTimer: ReturnType<typeof setTimeout> | undefined;
        let lastConsumed = 0;
        let isSnapping = false;

        const clampT = (v: number) => Math.min(n - 1 + 0.35, Math.max(-0.35, v));
        const clampI = (v: number) => Math.min(n - 1, Math.max(0, Math.round(v)));

        const isFullyInView = () => {
            const r = host.getBoundingClientRect();
            return Math.abs(r.top) <= 24;
        };

        const snapToFullScreen = () => {
            if (isSnapping) return;
            isSnapping = true;
            const r = host.getBoundingClientRect();
            const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
            window.scrollTo({ top: window.scrollY + r.top, behavior });
            setTimeout(() => {
                isSnapping = false;
            }, 650);
        };

        const onPointerEnterHost = () => {
            const r = host.getBoundingClientRect();
            // When cursor moves on top of the carousel while it's coming into view, glide to full screen
            if (r.top > 32 && r.top < window.innerHeight * 0.75) {
                snapToFullScreen();
            }
        };

        const onWheel = (e: WheelEvent) => {
            const r = host.getBoundingClientRect();
            const fullyDisplayed = Math.abs(r.top) <= 24;

            // If the carousel is NOT fully displayed, allow standard page scrolling
            if (!fullyDisplayed) {
                return;
            }

            let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            if (e.deltaMode === 1) d *= 16;
            if (!d) return;

            const now = performance.now();
            const atStart = d < 0 && target <= 0.05;
            const atEnd = d > 0 && target >= n - 1 - 0.05;

            // At carousel boundaries, let the page continue scrolling vertically
            if (atStart || atEnd) {
                if (now - lastConsumed < 350) e.preventDefault();
                return;
            }

            e.preventDefault();
            lastConsumed = now;
            target = clampT(target + d * 0.0022);
            clearTimeout(snapTimer);
            snapTimer = setTimeout(() => (target = clampI(target)), 130);
        };

        const onDown = (e: PointerEvent) => {
            if (!isFullyInView()) {
                // If not fully displayed yet, snap to full screen instead of moving cards
                snapToFullScreen();
                return;
            }
            if (e.pointerType === "mouse" && e.button !== 0) return;
            dragging = true;
            startX = lastX = e.clientX;
            lastT = performance.now();
            t0 = target;
            vel = 0;
            clearTimeout(snapTimer);
            host.setPointerCapture(e.pointerId);
        };

        const onMove = (e: PointerEvent) => {
            if (!dragging || !isFullyInView()) return;
            const now = performance.now();
            const dt = Math.max(1, now - lastT);
            vel = vel * 0.7 + (-(e.clientX - lastX) / step / (dt / 1000)) * 0.3;
            lastX = e.clientX;
            lastT = now;
            target = clampT(t0 - (e.clientX - startX) / step);
        };

        const onUp = (e: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
            target = clampI(target + vel * 0.18);
        };

        const onKey = (e: KeyboardEvent) => {
            if (!isFullyInView()) return;
            if (e.key === "ArrowRight") target = clampI(Math.round(target) + 1);
            else if (e.key === "ArrowLeft") target = clampI(Math.round(target) - 1);
            else return;
            e.preventDefault();
        };

        goRef.current = (d: number) => {
            if (!isFullyInView()) {
                snapToFullScreen();
            }
            target = clampI(Math.round(target) + d);
        };

        host.addEventListener("pointerenter", onPointerEnterHost);
        host.addEventListener("wheel", onWheel, { passive: false });
        host.addEventListener("pointerdown", onDown);
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerup", onUp);
        host.addEventListener("pointercancel", onUp);
        host.addEventListener("keydown", onKey);

        /* ---------- loop ---------- */
        let visible = true;
        const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0 });
        io.observe(host);

        let raf = 0;
        let last = performance.now();
        let activeIdx = 0;
        let vSm = 0;
        const loop = (now: number) => {
            raf = requestAnimationFrame(loop);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (!visible) return;
            const k = reduce ? 1 : 1 - Math.exp(-dt * (dragging ? 16 : 6.5));
            const before = pos;
            pos += (target - pos) * k;
            if (Math.abs(target - pos) < 0.0005) pos = target;
            /* speed drives the bend and the RGB split */
            if (!reduce && dt > 0) {
                vSm += ((pos - before) / dt - vSm) * Math.min(1, dt * 10);
                const av = Math.abs(vSm);
                shared.uFlare.value = 0.42 + Math.min(0.12, av * 0.04);
                postMat.uniforms.uAb.value = 0.006 + Math.min(0.014, av * 0.006);
            }
            postMat.uniforms.uTime.value = reduce ? 0 : now / 1000;
            if (progRef.current) progRef.current.style.transform = `scaleX(${n > 1 ? Math.min(1, Math.max(0, pos / (n - 1))) : 1})`;
            for (let i = 0; i < meshes.length; i++) meshes[i].position.x = (i - pos) * step;
            const idx = clampI(pos);
            if (idx !== activeIdx) {
                activeIdx = idx;
                setActive(idx);
            }
            renderer.setRenderTarget(rt);
            renderer.setClearColor(0x000000, 0);
            renderer.clear();
            renderer.render(scene, cam);
            renderer.setRenderTarget(null);
            renderer.render(postScene, postCam);
        };
        raf = requestAnimationFrame(loop);

        return () => {
            disposed = true;
            goRef.current = null;
            cancelAnimationFrame(raf);
            clearTimeout(snapTimer);
            clearTimeout(resizeTimer);
            ro.disconnect();
            io.disconnect();
            host.removeEventListener("pointerenter", onPointerEnterHost);
            host.removeEventListener("wheel", onWheel);
            host.removeEventListener("pointerdown", onDown);
            host.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerup", onUp);
            host.removeEventListener("pointercancel", onUp);
            host.removeEventListener("keydown", onKey);
            geo.dispose();
            postGeo.dispose();
            postMat.dispose();
            meshes.forEach((m) => (m.material as THREE.Material).dispose());
            texs.forEach((t) => t.dispose());
            rt.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, [projects, n]);

    const cur = projects[Math.min(active, n - 1)];
    const arrow = "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#09090c]/80 backdrop-blur-md transition-all duration-300 hover:border-[#c6ff2e]/50 active:scale-90 disabled:pointer-events-none disabled:opacity-30";

    return (
        <section id="work" className={`${sans.className} dgm-work relative text-white selection:bg-[#c6ff2e] selection:text-[#09090c]`} style={{ background: INK, color: BONE }}>
            <style>{`
        @keyframes dgm-work-marquee { to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .dgm-work *, .dgm-work *::before, .dgm-work *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; transition-delay: 0ms !important; }
        }
      `}</style>

            {/* ───────── Header ───────── */}
            <div className="relative overflow-hidden">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(198,255,46,.5), transparent)" }} />
                <div aria-hidden className="pointer-events-none absolute left-1/2 top-[42%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]" style={{ background: "rgba(198,255,46,.08)" }} />
                <div aria-hidden className={`${display.className} pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 select-none text-[min(55vw,38rem)] font-black leading-none`} style={{ color: "transparent", WebkitTextStroke: "1px rgba(198,255,46,.06)" }}>
                    {pad(n)}
                </div>

                <div className="relative mx-auto flex min-h-[72svh] max-w-5xl flex-col items-center justify-center px-5 pb-10 pt-36 text-center sm:px-8">
                    <Reveal>
                        <p className={`${mono.className} mb-6 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em]`} style={{ color: LIME }}>
                            <span className="h-px w-8" style={{ background: LIME }} />
                            {eyebrow} · {pad(n)}
                            <span className="h-px w-8" style={{ background: LIME }} />
                        </p>
                    </Reveal>
                    <Reveal delay={100}>
                        <h2 className={`${display.className} text-[clamp(2rem,5.4vw,4.8rem)] font-bold leading-[1.06] tracking-[-0.04em]`} style={{ color: BONE }}>
                            {title} <span style={{ color: LIME, textShadow: "0 0 44px rgba(198,255,46,.35)" }}>{titleHighlight}</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={220}>
                        <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">{intro}</p>
                    </Reveal>
                </div>

                <div
                    aria-hidden
                    className="relative pb-14"
                    style={{ maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)" }}
                >
                    <div className="flex w-max animate-[dgm-work-marquee_70s_linear_infinite] items-center hover:[animation-play-state:paused]">
                        {[...projects, ...projects].map((p, i) => (
                            <span
                                key={i}
                                className={`${display.className} flex items-center gap-10 whitespace-nowrap pr-10 text-[clamp(2rem,5.5vw,4.5rem)] font-bold uppercase tracking-[-0.04em]`}
                                style={{ color: "transparent", WebkitTextStroke: "1px rgba(236,233,224,.28)" }}
                            >
                                {p.title}
                                <span className="h-2 w-2 rotate-45" style={{ background: LIME }} />
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ───────── Carousel ───────── */}
            <div
                id="carousel-container"
                className="relative h-[100svh] w-full select-none overflow-hidden scroll-mt-0"
                onMouseEnter={() => {
                    if (hostRef.current) {
                        const r = hostRef.current.getBoundingClientRect();
                        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
                        if (r.top > 32 && r.top < window.innerHeight * 0.75) {
                            window.scrollTo({ top: window.scrollY + r.top, behavior });
                        }
                    }
                }}
            >
                <div
                    ref={hostRef}
                    tabIndex={0}
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Selected projects"
                    className={`absolute inset-0 cursor-grab outline-none transition-opacity duration-1000 active:cursor-grabbing ${ready ? "opacity-100" : "opacity-0"}`}
                    style={{ touchAction: "pan-y" }}
                />

                {/* keeps both fonts loaded for the canvas */}
                <span aria-hidden className={`${display.className} sr-only`}>Aa</span>
                <span aria-hidden className={`${mono.className} sr-only`}>Aa</span>
                <p className="sr-only" aria-live="polite">
                    {cur ? `${active + 1} of ${n}: ${cur.title}` : ""}
                </p>

                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[2px] bg-white/10">
                    <div ref={progRef} className="h-full origin-left" style={{ transform: "scaleX(0)", background: LIME, boxShadow: "0 0 10px rgba(198,255,46,.8)" }} />
                </div>

                <div className="pointer-events-none absolute bottom-6 right-5 z-10 flex items-center gap-2 sm:right-8">
                    <button
                        type="button"
                        aria-label="Previous project"
                        disabled={active === 0}
                        onClick={() => {
                            if (hostRef.current) {
                                const r = hostRef.current.getBoundingClientRect();
                                if (Math.abs(r.top) > 24) {
                                    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
                                    window.scrollTo({ top: window.scrollY + r.top, behavior });
                                }
                            }
                            goRef.current?.(-1);
                        }}
                        className={arrow}
                        style={{ color: BONE }}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 8H3m0 0 4-4M3 8l4 4" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        aria-label="Next project"
                        disabled={active === n - 1}
                        onClick={() => {
                            if (hostRef.current) {
                                const r = hostRef.current.getBoundingClientRect();
                                if (Math.abs(r.top) > 24) {
                                    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
                                    window.scrollTo({ top: window.scrollY + r.top, behavior });
                                }
                            }
                            goRef.current?.(1);
                        }}
                        className={arrow}
                        style={{ color: BONE }}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 8h10m0 0L9 4m4 4-4 4" />
                        </svg>
                    </button>
                    {cur && (
                        <a
                            href={cur.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${mono.className} group pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-[#09090c]/80 px-5 text-[11px] font-medium backdrop-blur-md transition-colors hover:border-[#c6ff2e]/50`}
                            style={{ color: BONE }}
                        >
                            <span className="hidden sm:inline">Visit {hostOf(cur.url)}</span>
                            <span className="sm:hidden">Visit site</span>
                            <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: LIME }}>
                                ↗
                            </span>
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}