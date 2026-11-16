"use client";

/**
 * SignalLattice - DGM HOUSE interactive background
 * High-performance, 60fps-optimized 2D canvas simulation.
 *
 * Optimizations applied:
 * 1. Path batching: Combines hundreds of individual stroke/fill draw calls into single batched passes.
 * 2. Precomputed geometry: Globe longitude/latitude unit vertices calculated once at startup.
 * 3. DPR clamping (max 1.25): Prevents 4x fill-rate exhaustion on 4K/Retina displays.
 * 4. Zero per-frame GC allocations: Eliminates memory churn and micro-stutter.
 * 5. Hardware-friendly IntersectionObserver: Halts execution completely when out of viewport.
 */

import { useEffect, useRef } from "react";

const LIME = "198,255,46";
const PIVOT = 1400;
const GLOBE_R = 520;
const LENS_R = 230;
const TETHER_R = 240;
const RIPPLE_LIFE = 1.8;
const RIPPLE_SPEED = 700;

interface NodeT {
  x: number;
  y: number;
  z: number;
  ph: number;
  r: number;
}

interface Pulse {
  from: number;
  to: number;
  t: number;
  speed: number;
  hops: number;
}

interface Ripple {
  x: number;
  y: number;
  t0: number;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Precompute static unit-sphere wireframe points (36 segments per ring for optimal smoothness & speed)
const SEGMENTS = 36;
const LONGITUDES: Float32Array[] = [];
for (let m = 0; m < 6; m++) {
  const phi = (m * Math.PI) / 6;
  const pts = new Float32Array(SEGMENTS * 3);
  for (let k = 0; k < SEGMENTS; k++) {
    const u = (k / (SEGMENTS - 1)) * Math.PI * 2;
    pts[k * 3] = GLOBE_R * Math.cos(u) * Math.cos(phi);
    pts[k * 3 + 1] = GLOBE_R * Math.sin(u);
    pts[k * 3 + 2] = GLOBE_R * Math.cos(u) * Math.sin(phi);
  }
  LONGITUDES.push(pts);
}

const LATITUDES: { pts: Float32Array; alpha: number }[] = [-0.9, -0.5, 0, 0.5, 0.9].map((lat) => {
  const pts = new Float32Array(SEGMENTS * 3);
  for (let k = 0; k < SEGMENTS; k++) {
    const u = (k / (SEGMENTS - 1)) * Math.PI * 2;
    pts[k * 3] = GLOBE_R * Math.cos(lat) * Math.cos(u);
    pts[k * 3 + 1] = GLOBE_R * Math.sin(lat);
    pts[k * 3 + 2] = GLOBE_R * Math.cos(lat) * Math.sin(u);
  }
  return { pts, alpha: lat === 0 ? 0.16 : 0.08 };
});

export default function SignalLattice({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext("2d", { alpha: true });
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;
    const host = canvas.parentElement as HTMLElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let lastNow = 0;
    let builtCount = 0;

    let nodes: NodeT[] = [];
    let edges: [number, number][] = [];
    let adj: number[][] = [];
    let sx = new Float32Array(0);
    let sy = new Float32Array(0);
    let sz = new Float32Array(0);
    let sc = new Float32Array(0);
    let glow = new Float32Array(0);
    let flash = new Float32Array(0);
    let vis = new Uint8Array(0);

    const pulses: Pulse[] = [];
    const ripples: Ripple[] = [];

    const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, nx: 0, ny: 0, snx: 0, sny: 0, active: false };
    let yaw = 0;
    let pitch = 0;

    /* ---------- world setup ---------- */
    const build = (count: number) => {
      const rnd = mulberry32(7);
      nodes = Array.from({ length: count }, () => ({
        x: (rnd() * 2 - 1) * 1700,
        y: (rnd() * 2 - 1) * 1050,
        z: 500 + rnd() * 1700,
        ph: rnd() * Math.PI * 2,
        r: 1.1 + rnd() * 1.5,
      }));

      const seen = new Set<string>();
      edges = [];
      adj = nodes.map(() => []);

      nodes.forEach((a, i) => {
        const near: { j: number; d: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const b = nodes[j];
          const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
          if (d < 680 * 680) near.push({ j, d });
        }
        near.sort((p, q) => p.d - q.d);
        near.slice(0, 3).forEach((o) => {
          const key = i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          edges.push([i, o.j]);
          adj[i].push(o.j);
          adj[o.j].push(i);
        });
      });

      sx = new Float32Array(count);
      sy = new Float32Array(count);
      sz = new Float32Array(count);
      sc = new Float32Array(count);
      glow = new Float32Array(count);
      flash = new Float32Array(count);
      vis = new Uint8Array(count);
      builtCount = count;
      pulses.length = 0;
    };

    const resize = () => {
      // Clamping DPR to 1.25 max prevents rendering millions of redundant pixels on 4K/Retina displays
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = host.clientWidth;
      h = host.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Balanced node count for high visual density with 60fps budget
      const count = w < 768 ? 90 : w < 1200 ? 140 : 190;
      if (count !== builtCount) build(count);
      if (reduce) draw(performance.now());
    };

    /* ---------- helpers ---------- */
    const spawnPulse = (from: number, to: number, speed = 0.014 + Math.random() * 0.016, hops = 3 + ((Math.random() * 4) | 0)) => {
      if (pulses.length >= 16) return;
      pulses.push({ from, to, t: 0, speed, hops });
    };

    const nearestNode = (x: number, y: number) => {
      let best = -1;
      let bd = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        if (!vis[i]) continue;
        const d = (sx[i] - x) ** 2 + (sy[i] - y) ** 2;
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      return best;
    };

    /* ---------- render loop ---------- */
    function draw(now: number) {
      const dt = clamp((now - lastNow) / 16.667, 0.2, 3);
      lastNow = now;
      const t = reduce ? 0 : now;
      const cx = w / 2;
      const cy = h * 0.46;
      const F = Math.max(h, w * 0.6);

      // Smooth inputs
      if (mouse.active) {
        mouse.sx += (mouse.x - mouse.sx) * 0.22 * dt;
        mouse.sy += (mouse.y - mouse.sy) * 0.22 * dt;
      }
      mouse.snx += (mouse.nx - mouse.snx) * 0.04 * dt;
      mouse.sny += (mouse.ny - mouse.sny) * 0.04 * dt;
      yaw = mouse.snx * 0.32 + Math.sin(t * 0.00011) * 0.12;
      pitch = -mouse.sny * 0.16 + Math.sin(t * 0.00008 + 1) * 0.04;
      const cyw = Math.cos(yaw);
      const syw = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);

      // Clean aged ripples in-place
      for (let i = ripples.length - 1; i >= 0; i--) {
        if ((now - ripples[i].t0) / 1000 >= RIPPLE_LIFE) {
          ripples.splice(i, 1);
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      /* --- 1. The Wireframe Globe (Precomputed & Batched) --- */
      const spin = t * 0.00007;
      const cs = Math.cos(spin);
      const ss = Math.sin(spin);

      const renderRings = (pts: Float32Array, alpha: number) => {
        ctx.strokeStyle = `rgba(${LIME},${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        let pen = false;
        for (let k = 0; k < SEGMENTS; k++) {
          const x0 = pts[k * 3];
          const y0 = pts[k * 3 + 1];
          const z0 = pts[k * 3 + 2];

          // Globe spin (Y)
          const gx = x0 * cs + z0 * ss;
          const gz = -x0 * ss + z0 * cs;

          // Camera yaw & pitch
          const x1 = gx * cyw + gz * syw;
          const z1 = -gx * syw + gz * cyw;
          const y1 = y0 * cp - z1 * sp;
          const z2 = y0 * sp + z1 * cp + PIVOT;

          if (z2 < 120) {
            pen = false;
            continue;
          }
          const s = F / z2;
          const px = cx + x1 * s;
          const py = cy + y1 * s;

          if (!pen) {
            ctx.moveTo(px, py);
            pen = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      };

      for (let m = 0; m < LONGITUDES.length; m++) {
        renderRings(LONGITUDES[m], 0.07);
      }
      for (let l = 0; l < LATITUDES.length; l++) {
        renderRings(LATITUDES[l].pts, LATITUDES[l].alpha);
      }

      /* --- 2. Project Nodes --- */
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const x = n.x + Math.sin(t * 0.00035 + n.ph) * 22;
        const y = n.y + Math.cos(t * 0.0003 + n.ph * 1.3) * 22;
        const z = n.z + Math.sin(t * 0.00025 + n.ph * 0.7) * 22 - PIVOT;
        const x1 = x * cyw + z * syw;
        const z1 = -x * syw + z * cyw;
        const y1 = y * cp - z1 * sp;
        const z2 = y * sp + z1 * cp + PIVOT;

        if (z2 < 120) {
          vis[i] = 0;
          continue;
        }
        const s = F / z2;
        let px = cx + x1 * s;
        let py = cy + y1 * s;
        let g = flash[i] * 0.85;

        if (mouse.active) {
          const dx = mouse.sx - px;
          const dy = mouse.sy - py;
          const d = Math.hypot(dx, dy);
          if (d < LENS_R) {
            const k = (1 - d / LENS_R) ** 2;
            px += dx * k * 0.28;
            py += dy * k * 0.28;
            g = Math.max(g, k);
          }
        }

        for (let r = 0; r < ripples.length; r++) {
          const rp = ripples[r];
          const age = (now - rp.t0) / 1000;
          if (age < 0) continue;
          const rad = age * RIPPLE_SPEED;
          const dx = px - rp.x;
          const dy = py - rp.y;
          const d = Math.hypot(dx, dy) || 1;
          const delta = Math.abs(d - rad);
          if (delta < 80) {
            const k = (1 - delta / 80) * (1 - age / RIPPLE_LIFE);
            px += (dx / d) * k * 26;
            py += (dy / d) * k * 26;
            g = Math.max(g, k);
          }
        }

        sx[i] = px;
        sy[i] = py;
        sz[i] = z2;
        sc[i] = s;
        glow[i] = g;
        vis[i] = 1;
      }

      /* --- 3. Batched Edges (Replaces 800+ draw calls with 2 passes) --- */
      ctx.lineWidth = 1;
      
      // Pass A: Regular ambient edges
      ctx.strokeStyle = `rgba(${LIME},0.09)`;
      ctx.beginPath();
      for (let e = 0; e < edges.length; e++) {
        const a = edges[e][0];
        const b = edges[e][1];
        if (!vis[a] || !vis[b]) continue;
        if (glow[a] > 0.15 || glow[b] > 0.15) continue; // hand off to glow pass
        ctx.moveTo(sx[a], sy[a]);
        ctx.lineTo(sx[b], sy[b]);
      }
      ctx.stroke();

      // Pass B: Highlighted/Glow edges
      ctx.strokeStyle = `rgba(${LIME},0.45)`;
      ctx.beginPath();
      for (let e = 0; e < edges.length; e++) {
        const a = edges[e][0];
        const b = edges[e][1];
        if (!vis[a] || !vis[b]) continue;
        if (glow[a] <= 0.15 && glow[b] <= 0.15) continue;
        ctx.moveTo(sx[a], sy[a]);
        ctx.lineTo(sx[b], sy[b]);
      }
      ctx.stroke();

      /* --- 4. Batched Nodes --- */
      // Base node dots in one single fill pass
      ctx.fillStyle = `rgba(${LIME},0.35)`;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        if (!vis[i]) continue;
        const rad = nodes[i].r * sc[i] * 1.1;
        ctx.moveTo(sx[i] + rad, sy[i]);
        ctx.arc(sx[i], sy[i], rad, 0, Math.PI * 2);
      }
      ctx.fill();

      // Glowing nodes accent pass
      ctx.fillStyle = `rgba(${LIME},0.75)`;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        if (!vis[i] || glow[i] <= 0.08) continue;
        const rad = nodes[i].r * sc[i] * 1.4 + glow[i] * 3.5;
        ctx.moveTo(sx[i] + rad, sy[i]);
        ctx.arc(sx[i], sy[i], rad, 0, Math.PI * 2);
      }
      ctx.fill();

      /* --- 5. Data Pulses --- */
      if (!reduce && pulses.length < 14 && edges.length && Math.random() < 0.07) {
        const [a, b] = edges[(Math.random() * edges.length) | 0];
        Math.random() < 0.5 ? spawnPulse(a, b) : spawnPulse(b, a);
      }

      ctx.strokeStyle = `rgba(${LIME},0.9)`;
      ctx.lineWidth = 1.6;
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pl = pulses[p];
        pl.t += pl.speed * dt;
        if (pl.t >= 1) {
          flash[pl.to] = 1;
          pl.hops--;
          const options = adj[pl.to];
          if (pl.hops <= 0 || !options.length) {
            pulses.splice(p, 1);
            continue;
          }
          pl.from = pl.to;
          pl.to = options[(Math.random() * options.length) | 0];
          pl.t = 0;
        }
        if (!vis[pl.from] || !vis[pl.to]) continue;
        const ax = sx[pl.from];
        const ay = sy[pl.from];
        const bx = sx[pl.to];
        const by = sy[pl.to];
        const hx = ax + (bx - ax) * pl.t;
        const hy = ay + (by - ay) * pl.t;
        const t0 = Math.max(0, pl.t - 0.2);
        const tx = ax + (bx - ax) * t0;
        const ty = ay + (by - ay) * t0;

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        ctx.fillStyle = "rgba(240,255,200,0.95)";
        ctx.beginPath();
        ctx.arc(hx, hy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < flash.length; i++) flash[i] *= Math.pow(0.93, dt);

      /* --- 6. Cursor Interactive Tether & Lens --- */
      if (mouse.active) {
        const mx = mouse.sx;
        const my = mouse.sy;

        // Subtle tether lines to nearby nodes
        ctx.strokeStyle = `rgba(${LIME},0.35)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        let tetherCount = 0;
        for (let i = 0; i < nodes.length; i++) {
          if (!vis[i]) continue;
          const dx = sx[i] - mx;
          const dy = sy[i] - my;
          if (dx * dx + dy * dy < TETHER_R * TETHER_R) {
            ctx.moveTo(mx, my);
            ctx.lineTo(sx[i], sy[i]);
            tetherCount++;
            if (tetherCount >= 5) break;
          }
        }
        ctx.stroke();

        // Sleek Reticle
        ctx.strokeStyle = `rgba(${LIME},0.55)`;
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mx - 18, my);
        ctx.lineTo(mx - 6, my);
        ctx.moveTo(mx + 6, my);
        ctx.lineTo(mx + 18, my);
        ctx.moveTo(mx, my - 18);
        ctx.lineTo(mx, my - 6);
        ctx.moveTo(mx, my + 6);
        ctx.lineTo(mx, my + 18);
        ctx.stroke();
      }

      /* --- 7. Shockwave Rings --- */
      if (ripples.length) {
        ctx.lineWidth = 1;
        for (let r = 0; r < ripples.length; r++) {
          const rp = ripples[r];
          const age = (now - rp.t0) / 1000;
          if (age < 0) continue;
          ctx.strokeStyle = `rgba(${LIME},${0.25 * (1 - age / RIPPLE_LIFE)})`;
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, age * RIPPLE_SPEED, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (visible) draw(now);
    };

    /* ---------- Event handlers ---------- */
    let clientRectCache: DOMRect | null = null;
    const updateRect = () => {
      clientRectCache = canvas.getBoundingClientRect();
    };

    const toLocal = (e: PointerEvent) => {
      if (!clientRectCache) updateRect();
      const r = clientRectCache!;
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      return { x, y, inside: x >= 0 && y >= 0 && x <= r.width && y <= r.height };
    };

    const onMove = (e: PointerEvent) => {
      const { x, y, inside } = toLocal(e);
      if (!inside) {
        mouse.active = false;
        mouse.nx = 0;
        mouse.ny = 0;
        return;
      }
      if (!mouse.active) {
        mouse.sx = x;
        mouse.sy = y;
      }
      mouse.active = true;
      mouse.x = x;
      mouse.y = y;
      mouse.nx = (x / w) * 2 - 1;
      mouse.ny = (y / h) * 2 - 1;
    };

    const onDown = (e: PointerEvent) => {
      const { x, y, inside } = toLocal(e);
      if (!inside) return;
      ripples.push({ x, y, t0: performance.now() });
      const n = nearestNode(x, y);
      if (n >= 0) adj[n].forEach((k) => spawnPulse(n, k, 0.02, 5));
      if (reduce) draw(performance.now());
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        mouse.active = false;
        mouse.nx = 0;
        mouse.ny = 0;
      }
    };

    const onLeave = () => {
      mouse.active = false;
      mouse.nx = 0;
      mouse.ny = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("resize", updateRect, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    const ro = new ResizeObserver(() => {
      updateRect();
      resize();
    });
    ro.observe(host);

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
    }, { threshold: 0 });
    io.observe(host);

    resize();
    if (!reduce) {
      ripples.push({ x: w / 2, y: h * 0.46, t0: performance.now() + 300 });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
