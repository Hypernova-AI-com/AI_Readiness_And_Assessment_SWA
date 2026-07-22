import { useEffect, useRef } from "react";

/**
 * Black hole accretion disk (Originkit `blackhole`, ported to React).
 * Two stacked 2D canvases: particles with z >= 0 render behind the event
 * horizon, z < 0 in front, so the disk genuinely passes around the void.
 * Recoloured to brand lime; the horizon is drawn in the page background
 * colour so it occludes without reading as a black blob. Faithful port of the
 * original vanilla IIFE with React-owned setup/teardown.
 */
export default function BlackHoleDisk() {
  const hostRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const bg = bgRef.current;
    const fg = fgRef.current;
    if (!host || !bg || !fg) return;
    const ctx = bg.getContext("2d");
    const fgCtx = fg.getContext("2d");
    if (!ctx || !fgCtx) return;

    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const COLORS = ["#95ff00", "#95ff00", "#b6ff4d", "#6fbf00"];
    const VOID_COLOR = "#08090b";
    const PARTICLES = 1000;
    const PARTICLE_PX = 0.5 + (4 - 1) * (4 / 49);
    const OUTER_PCT = 70;
    const VOID_RADIUS = 50;
    const TILT = 20;
    const TILT_SIDEWAY = 160;
    const ORBIT_SPEED = 4;
    const PULL_SPEED = 1.5 / 2;
    const TRAIL_ALPHA = Math.max(0.02, 1 - (50 / 50) * 0.98);
    const PERSPECTIVE = 1300;

    const dpr = () => Math.min(devicePixelRatio || 1, 1.5);
    let w = 460,
      h = 460;
    interface Pt {
      angle: number;
      radius: number;
      height: number;
      speedOffset: number;
      colorIdx: number;
    }
    let pts: Pt[] = [];
    let raf = 0;

    const outerRadius = () => {
      const maxR = w / 2;
      return VOID_RADIUS + (OUTER_PCT / 100) * (maxR - VOID_RADIUS);
    };

    function seed() {
      const outer = outerRadius();
      pts = new Array(PARTICLES);
      for (let i = 0; i < PARTICLES; i++) {
        pts[i] = {
          angle: Math.random() * Math.PI * 2,
          radius: VOID_RADIUS + Math.pow(Math.random(), 2) * (outer - VOID_RADIUS),
          height: (Math.random() - 0.5) * 16,
          speedOffset: 0.75 + Math.random() * 0.5,
          colorIdx: Math.floor(Math.random() * COLORS.length),
        };
      }
    }

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        if (!width || !height) continue;
        const r = dpr();
        for (const c of [bg, fg]) {
          c.width = width * r;
          c.height = height * r;
        }
        const changed = width !== w || height !== h;
        w = width;
        h = height;
        if (changed) seed();
      }
    });
    ro.observe(host);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(host);

    const rgb = (hex: string) => {
      const x = hex.replace("#", "");
      return x.length === 3
        ? { r: parseInt(x[0] + x[0], 16), g: parseInt(x[1] + x[1], 16), b: parseInt(x[2] + x[2], 16) }
        : { r: parseInt(x.slice(0, 2), 16), g: parseInt(x.slice(2, 4), 16), b: parseInt(x.slice(4, 6), 16) };
    };
    const V = rgb(VOID_COLOR);

    interface Rendered {
      x: number;
      y: number;
      z: number;
      size: number;
      alpha: number;
      color: string;
    }
    const back: Rendered[] = [],
      front: Rendered[] = [];
    let last = performance.now();

    function draw(now: number) {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      if (!visible) return;

      const r = dpr();
      ctx!.setTransform(r, 0, 0, r, 0, 0);
      fgCtx!.setTransform(r, 0, 0, r, 0, 0);
      ctx!.globalAlpha = fgCtx!.globalAlpha = 1;

      for (const c of [ctx!, fgCtx!]) {
        c.globalCompositeOperation = "destination-out";
        c.fillStyle = `rgba(0,0,0,${TRAIL_ALPHA})`;
        c.fillRect(0, 0, w, h);
        c.globalCompositeOperation = "source-over";
      }

      const outer = outerRadius();
      const cx = w / 2,
        cy = h / 2;
      const tiltRad = (TILT * Math.PI) / 180;
      const sideRad = (TILT_SIDEWAY * Math.PI) / 180;
      const cosT = Math.cos(tiltRad),
        sinT = Math.sin(tiltRad);
      const cosS = Math.cos(sideRad),
        sinS = Math.sin(sideRad);

      back.length = 0;
      front.length = 0;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const speed = Math.sqrt(VOID_RADIUS / Math.max(p.radius, 10));
        p.angle += ORBIT_SPEED * speed * p.speedOffset * 0.012 * dt;
        p.radius -= PULL_SPEED * speed * p.speedOffset * dt;

        if (p.radius < VOID_RADIUS) {
          p.radius = VOID_RADIUS + (0.7 + Math.random() * 0.3) * (outer - VOID_RADIUS);
          p.angle = Math.random() * Math.PI * 2;
          p.height = (Math.random() - 0.5) * 16;
          continue;
        }

        const xb = p.radius * Math.cos(p.angle);
        const yb = p.height;
        const zb = p.radius * Math.sin(p.angle);

        const y1 = yb * cosT + zb * sinT;
        const z1 = -yb * sinT + zb * cosT;
        const x3 = xb * cosS - y1 * sinS;
        const y3 = xb * sinS + y1 * cosS;

        const scale = PERSPECTIVE / (PERSPECTIVE + z1);
        const pxv = cx + x3 * scale;
        const pyv = cy + y3 * scale;
        if (pxv < -30 || pxv > w + 30 || pyv < -30 || pyv > h + 30) continue;

        (z1 >= 0 ? back : front).push({
          x: pxv,
          y: pyv,
          z: z1,
          size: Math.max(0.3, PARTICLE_PX * scale),
          alpha: Math.max(0.35, 1 - ((z1 + outer) / (2 * outer)) * 0.45),
          color: COLORS[p.colorIdx % COLORS.length],
        });
      }

      back.sort((a, b) => b.z - a.z);
      front.sort((a, b) => b.z - a.z);

      for (const p of back) {
        ctx!.globalAlpha = p.alpha;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      const sphere = ctx!.createRadialGradient(
        cx - VOID_RADIUS * 0.25,
        cy - VOID_RADIUS * 0.3,
        VOID_RADIUS * 0.05,
        cx,
        cy,
        VOID_RADIUS,
      );
      const e = (n: number) => Math.min(255, n + 18);
      sphere.addColorStop(0, `rgb(${Math.min(255, V.r + 8)},${Math.min(255, V.g + 8)},${Math.min(255, V.b + 8)})`);
      sphere.addColorStop(0.65, `rgb(${V.r},${V.g},${V.b})`);
      sphere.addColorStop(1, `rgb(${e(V.r)},${e(V.g)},${e(V.b)})`);
      ctx!.fillStyle = sphere;
      ctx!.beginPath();
      ctx!.arc(cx, cy, VOID_RADIUS, 0, Math.PI * 2);
      ctx!.fill();

      const rim = ctx!.createRadialGradient(cx, cy, VOID_RADIUS * 0.88, cx, cy, VOID_RADIUS * 1.06);
      rim.addColorStop(0, "rgba(149,255,0,0)");
      rim.addColorStop(0.72, "rgba(149,255,0,0.10)");
      rim.addColorStop(0.9, "rgba(149,255,0,0.20)");
      rim.addColorStop(1, "rgba(149,255,0,0)");
      ctx!.fillStyle = rim;
      ctx!.beginPath();
      ctx!.arc(cx, cy, VOID_RADIUS * 1.06, 0, Math.PI * 2);
      ctx!.fill();

      for (const p of front) {
        fgCtx!.globalAlpha = p.alpha;
        fgCtx!.fillStyle = p.color;
        fgCtx!.beginPath();
        fgCtx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fgCtx!.fill();
      }
      fgCtx!.globalAlpha = 1;
    }

    function loop(now: number) {
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    const r0 = host.getBoundingClientRect();
    w = r0.width || 460;
    h = r0.height || 460;
    for (const c of [bg, fg]) {
      c.width = w * dpr();
      c.height = h * dpr();
    }
    seed();

    if (REDUCED) draw(performance.now());
    else raf = requestAnimationFrame(loop);
    const readyRaf = requestAnimationFrame(() => host.classList.add("is-ready"));

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(readyRaf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="HyperNova AI — orbiting black hole accretion disk"
      className="blackhole-host"
    >
      <canvas ref={bgRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={fgRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
