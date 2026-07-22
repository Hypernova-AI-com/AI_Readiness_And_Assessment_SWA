import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

type CoreResult = { status: number; body: unknown };

/**
 * Dev-only: run the Azure Functions' shared *core* logic inside the Vite dev
 * server, so `npm run dev` serves the SPA AND the API together — no Azure
 * Functions Core Tools / SWA CLI required. In production the very same core runs
 * behind the Azure Functions v4 adapters in `api/src/functions/*` on Azure
 * Static Web Apps. Nothing here ships to the browser or to Azure.
 */
function devApi(mode: string): Plugin {
  return {
    name: "dev-api-functions",
    apply: "serve", // dev only — never part of the production build
    configureServer(server) {
      // Expose server-only env (GRAPH_*, RESEND_*, STRIPE_*, LEAD_*) to the core.
      // loadEnv with prefix "" reads every key in .env, not just VITE_*.
      const env = loadEnv(mode, process.cwd(), "");
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();
        const route = req.url.split("?")[0].replace(/^\/api\//, "").replace(/\/+$/, "");

        // Buffer + JSON-parse the body (Azure Functions auto-populates this in prod).
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const raw = Buffer.concat(chunks).toString("utf8");
        const body = raw ? safeJson(raw) : {};

        const json = (status: number, payload: unknown) => {
          res.statusCode = status;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(payload));
        };

        try {
          if (route === "lead") {
            if (req.method !== "POST") return json(405, { ok: false, error: "Method not allowed." });
            const mod = (await server.ssrLoadModule("/api/src/core/lead.ts")) as {
              handleLead: (b: unknown) => Promise<CoreResult>;
            };
            const r = await mod.handleLead(body);
            return json(r.status, r.body);
          }
          if (route === "checkout") {
            if (req.method !== "POST") return json(405, { error: "Method not allowed." });
            const mod = (await server.ssrLoadModule("/api/src/core/checkout.ts")) as {
              handleCheckout: (i: { body: unknown; origin: string }) => Promise<CoreResult>;
            };
            const origin = (req.headers.origin as string | undefined) ?? "http://localhost:5173";
            const r = await mod.handleCheckout({ body, origin });
            return json(r.status, r.body);
          }
          return json(404, { ok: false, error: `No API route: /api/${route}` });
        } catch (err) {
          server.config.logger.error(`[dev-api] /api/${route} failed: ${String(err)}`);
          if (!res.writableEnded) json(500, { ok: false, error: "Server error (dev)." });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), devApi(mode)],
}));
