import { defineConfig, loadEnv, type Plugin, type Connect } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { ServerResponse } from "node:http";

/**
 * Dev-only: run the `/api/*.ts` serverless functions *inside* the Vite dev
 * server, so `npm run dev` serves the SPA AND the API together — no Vercel, no
 * separate process. In production these same files run as the host's managed
 * functions (Vercel today, Azure Static Web Apps next), so nothing here ships.
 */
function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

function devApi(mode: string): Plugin {
  return {
    name: "dev-api-functions",
    apply: "serve", // dev only — never part of the production build
    configureServer(server) {
      // Expose server-only env (GRAPH_*, RESEND_*, LEAD_*, …) to the handlers.
      // loadEnv with prefix "" reads every key in .env, not just VITE_*.
      const env = loadEnv(mode, process.cwd(), "");
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();

        const route = req.url.split("?")[0].replace(/^\/api\//, "").replace(/\/+$/, "");

        // Resolve the handler; a genuinely missing file is a real 404.
        let handler:
          | ((req: Connect.IncomingMessage, res: ServerResponse) => unknown)
          | undefined;
        try {
          const mod = await server.ssrLoadModule(`/api/${route}.ts`);
          handler = (mod as { default?: typeof handler }).default;
        } catch {
          handler = undefined;
        }
        if (typeof handler !== "function") {
          res.statusCode = 404;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ ok: false, error: `No API route: /api/${route}` }));
          return;
        }

        // Buffer + JSON-parse the body (Vercel/Azure auto-populate req.body).
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const raw = Buffer.concat(chunks).toString("utf8");
        (req as unknown as { body: unknown }).body = raw ? safeJson(raw) : {};

        // Shim the Vercel response helpers onto Node's ServerResponse.
        const vres = res as ServerResponse & {
          status: (c: number) => typeof vres;
          json: (b: unknown) => typeof vres;
        };
        vres.status = (c) => {
          res.statusCode = c;
          return vres;
        };
        vres.json = (b) => {
          if (!res.headersSent) res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(b));
          return vres;
        };

        try {
          await handler(req, vres);
        } catch (err) {
          server.config.logger.error(`[dev-api] /api/${route} failed: ${String(err)}`);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "Server error (dev)." }));
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), devApi(mode)],
}));
