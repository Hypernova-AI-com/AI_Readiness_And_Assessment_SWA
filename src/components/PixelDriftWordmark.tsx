import { useEffect, useRef } from "react";

/**
 * Pixel Drift wordmark (Originkit `Pixel Drift`, ported to React).
 * Text is rasterised to an offscreen canvas, opaque pixels sampled into
 * particles that fly in from a ring outside the frame, hold, then a scripted
 * cursor sweeps a void through them on an autoplay loop. A real cursor takes
 * over the moment it moves. Logic is a faithful port of the original vanilla
 * IIFE, wrapped so React owns setup/teardown.
 */
export default function PixelDriftWordmark({ text = "HyperNova AI" }: { text?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Props (Originkit preview values) ─────────────────────────────────
    const TEXT = text;
    const PALETTE = ["#FFFFFF", "#95ff00", "#FFFFFF"];
    const PARTICLE_SZ = 10;
    const P_COUNT = 50;
    const FONT_SIZE = 140;
    const MOUSE_ON = true;
    const MOUSE_RAD = 50;
    const MOUSE_FORCE = 30;
    const FORM_MS = 1100;
    const ease = (t: number) => 1 - (1 - t) * (1 - t);
    const FONT_FAMILY = "Anton, Almarai, sans-serif";

    let cssW = 0,
      cssH = 0,
      dpr = 1,
      count = 0;
    let ox = new Float32Array(0),
      oy = new Float32Array(0),
      sx = new Float32Array(0),
      sy = new Float32Array(0),
      px = new Float32Array(0),
      py = new Float32Array(0),
      repX = new Float32Array(0),
      repY = new Float32Array(0),
      cIdx = new Uint8Array(0);
    const buckets: number[][] = PALETTE.map(() => []);

    let formVal = 0,
      lastFrame: number | null = null,
      hidden = true,
      reverse = false;
    let prevMx = -99999,
      prevMy = -99999,
      mouseSpeed = 0;
    let smoothX = -99999,
      smoothY = -99999;
    const pointer = { x: -99999, y: -99999, active: false };

    const CYCLE = [
      { name: "form", ms: 1200, reverse: false },
      { name: "hold", ms: 650, reverse: false },
      { name: "sweep", ms: 2700, reverse: false },
      { name: "settle", ms: 1000, reverse: false },
      { name: "dissolve", ms: 1200, reverse: true },
      { name: "gap", ms: 450, reverse: true },
    ];
    let phaseIdx = 0,
      phaseT = 0;
    let lastRealMove = -1e9;
    let vHas = false,
      vLastX = 0,
      vLastY = 0;
    let visible = true;
    let raf = 0;

    function respawn() {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.max(cssW, cssH) * (0.6 + Math.random() * 0.5);
        sx[i] = cssW / 2 + Math.cos(ang) * rad;
        sy[i] = cssH / 2 + Math.sin(ang) * rad;
        repX[i] = 0;
        repY[i] = 0;
      }
      vHas = false;
    }

    function fitFontSize(mctx: CanvasRenderingContext2D, label: string, maxW: number, maxH: number, cap: number) {
      let lo = 8,
        hi = cap,
        best = lo;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        mctx.font = `${mid}px ${FONT_FAMILY}`;
        const m = mctx.measureText(label);
        const h = (m.actualBoundingBoxAscent || mid * 0.8) + (m.actualBoundingBoxDescent || mid * 0.2);
        if (m.width <= maxW && h <= maxH) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      return Math.max(8, Math.floor(best));
    }

    function sampleText() {
      const W = cssW,
        H = cssH;
      if (W <= 0 || H <= 0) return;

      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.floor(W * dpr));
      off.height = Math.max(1, Math.floor(H * dpr));
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.scale(dpr, dpr);

      const size = fitFontSize(o, TEXT, W * 0.92, H * 0.92, FONT_SIZE);
      o.clearRect(0, 0, W, H);
      o.fillStyle = "#fff";
      o.font = `${size}px ${FONT_FAMILY}`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillText(TEXT, W / 2, H / 2);

      const img = o.getImageData(0, 0, Math.floor(W * dpr), Math.floor(H * dpr));
      const data = img.data;
      const stride = Math.max(2, Math.round(150 / P_COUNT));

      let candidates = 0;
      for (let y = 0; y < H; y += stride)
        for (let x = 0; x < W; x += stride)
          if (data[(Math.floor(y * dpr) * img.width + Math.floor(x * dpr)) * 4 + 3] > 128) candidates++;

      const downsample = candidates > 30000 ? Math.ceil(candidates / 30000) : 1;
      const alloc = Math.min(candidates, 30000);

      ox = new Float32Array(alloc);
      oy = new Float32Array(alloc);
      sx = new Float32Array(alloc);
      sy = new Float32Array(alloc);
      px = new Float32Array(alloc);
      py = new Float32Array(alloc);
      repX = new Float32Array(alloc);
      repY = new Float32Array(alloc);
      cIdx = new Uint8Array(alloc);

      let i = 0,
        seen = 0;
      for (let y = 0; y < H && i < alloc; y += stride) {
        for (let x = 0; x < W && i < alloc; x += stride) {
          if (data[(Math.floor(y * dpr) * img.width + Math.floor(x * dpr)) * 4 + 3] > 128) {
            if (seen % downsample === 0) {
              ox[i] = x;
              oy[i] = y;
              const ang = Math.random() * Math.PI * 2;
              const rad = Math.max(W, H) * (0.6 + Math.random() * 0.5);
              sx[i] = px[i] = W / 2 + Math.cos(ang) * rad;
              sy[i] = py[i] = H / 2 + Math.sin(ang) * rad;
              cIdx[i] = Math.floor(Math.random() * PALETTE.length);
              i++;
            }
            seen++;
          }
        }
      }
      count = i;
      formVal = 0;
      lastFrame = null;
    }

    function resize() {
      const r = host!.getBoundingClientRect();
      const w = Math.floor(r.width),
        h = Math.floor(r.height);
      if (w <= 0 || h <= 0) return;
      dpr = Math.max(1, Math.min(2, devicePixelRatio || 1));
      cssW = w;
      cssH = h;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      sampleText();
    }

    function drawFrame() {
      if (!visible) {
        lastFrame = performance.now();
        return;
      }

      ctx!.clearRect(0, 0, cssW, cssH);
      if (!count) return;

      const drawSize = Math.max(1, PARTICLE_SZ / 4);
      const half = drawSize / 2;

      const now = performance.now();
      const dt = Math.min(64, Math.max(0, now - (lastFrame ?? now)));
      lastFrame = now;

      const realActive = now - lastRealMove < 1200;
      if (!REDUCED) {
        phaseT += dt;
        if (phaseT >= CYCLE[phaseIdx].ms) {
          phaseT -= CYCLE[phaseIdx].ms;
          phaseIdx = (phaseIdx + 1) % CYCLE.length;
          if (CYCLE[phaseIdx].name === "form") respawn();
        }
        const cur = CYCLE[phaseIdx];
        reverse = cur.reverse;
        if (!cur.reverse) hidden = false;

        if (cur.name === "sweep" && !realActive) {
          const p = phaseT / cur.ms;
          const vx = -0.08 * cssW + p * 1.16 * cssW;
          const vy = cssH / 2 + Math.sin(p * Math.PI * 2) * cssH * 0.22;
          mouseSpeed = vHas ? Math.hypot(vx - vLastX, vy - vLastY) : 0;
          vLastX = vx;
          vLastY = vy;
          vHas = true;
          pointer.x = vx;
          pointer.y = vy;
          pointer.active = true;
        } else if (!realActive) {
          vHas = false;
          pointer.active = false;
        }
      }

      const target = reverse ? 0 : 1;
      if (REDUCED || FORM_MS <= 0) formVal = target;
      else if (formVal < target) formVal = Math.min(target, formVal + dt / FORM_MS);
      else if (formVal > target) formVal = Math.max(target, formVal - dt / FORM_MS);

      if (reverse && formVal <= 0) hidden = true;
      if (hidden) return;

      const forming = formVal < 1;
      const factor = ease(formVal);

      const hitSpeed = mouseSpeed;
      mouseSpeed *= 0.88;
      const active = !forming && MOUSE_ON && pointer.active;
      if (active) {
        const lf = Math.max(0.08, 0.3 - hitSpeed * 0.006);
        if (smoothX < -9000) {
          smoothX = pointer.x;
          smoothY = pointer.y;
        } else {
          smoothX += (pointer.x - smoothX) * lf;
          smoothY += (pointer.y - smoothY) * lf;
        }
      } else {
        smoothX = -99999;
        smoothY = -99999;
      }

      const cutoff = Math.max(1, MOUSE_RAD),
        cutoffSq = cutoff * cutoff;
      for (let b = 0; b < buckets.length; b++) buckets[b].length = 0;

      for (let i = 0; i < count; i++) {
        const oxi = ox[i],
          oyi = oy[i];

        if (forming) {
          px[i] = sx[i] + (oxi - sx[i]) * factor;
          py[i] = sy[i] + (oyi - sy[i]) * factor;
          buckets[cIdx[i]].push(i);
          continue;
        }

        let inZone = false;
        if (active) {
          const dx = oxi - smoothX,
            dy = oyi - smoothY;
          const dsq = dx * dx + dy * dy;
          if (dsq > 0 && dsq < cutoffSq) {
            const d = Math.sqrt(dsq),
              nx = dx / d,
              ny = dy / d;
            const push = (1 - d / cutoff) * hitSpeed * MOUSE_FORCE * 0.05;
            repX[i] += nx * push;
            repY[i] += ny * push;
            repX[i] += (nx * (cutoff - d) - repX[i]) * 0.06;
            repY[i] += (ny * (cutoff - d) - repY[i]) * 0.06;
            inZone = true;
          }
        }
        if (!inZone) {
          repX[i] *= 0.97;
          repY[i] *= 0.97;
        }

        px[i] = oxi + repX[i];
        py[i] = oyi + repY[i];
        buckets[cIdx[i]].push(i);
      }

      ctx!.globalAlpha = forming ? Math.min(1, Math.max(0, factor)) : 1;
      for (let b = 0; b < buckets.length; b++) {
        const bucket = buckets[b];
        if (!bucket.length) continue;
        ctx!.fillStyle = PALETTE[b];
        for (let k = 0; k < bucket.length; k++) {
          const i = bucket[k];
          ctx!.fillRect(px[i] - half, py[i] - half, drawSize, drawSize);
        }
      }
      ctx!.globalAlpha = 1;
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!MOUSE_ON) return;
      const r = canvas!.getBoundingClientRect();
      const mx = (e.clientX - r.left) * (r.width > 0 ? cssW / r.width : 1);
      const my = (e.clientY - r.top) * (r.height > 0 ? cssH / r.height : 1);
      if (prevMx > -9000) mouseSpeed = Math.hypot(mx - prevMx, my - prevMy);
      prevMx = mx;
      prevMy = my;
      pointer.x = mx;
      pointer.y = my;
      pointer.active = true;
      lastRealMove = performance.now();
    };

    const leave = () => {
      pointer.x = pointer.y = -99999;
      pointer.active = false;
      prevMx = prevMy = -99999;
      lastRealMove = -1e9;
    };

    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", leave, { passive: true });
    canvas.addEventListener("pointercancel", leave, { passive: true });

    const ro = new ResizeObserver(() => resize());
    ro.observe(host);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          phaseIdx = 0;
          phaseT = 0;
          formVal = 0;
          hidden = false;
          reverse = false;
          respawn();
          lastFrame = null;
        }
      },
      { threshold: 0 },
    );
    io.observe(host);

    function loop() {
      drawFrame();
      raf = requestAnimationFrame(loop);
    }

    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointercancel", leave);
    };
  }, [text]);

  return (
    <div ref={hostRef} role="img" aria-label={text} className="pixeldrift-host relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
