import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { handleCheckout } from "../core/checkout";

/** POST /api/checkout — Azure Functions v4 adapter over the shared core logic. */
export async function checkout(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = await request.json().catch(() => ({}));
  const origin =
    request.headers.get("origin") ??
    (request.headers.get("host") ? `https://${request.headers.get("host")}` : "http://localhost:5173");
  const result = await handleCheckout({ body, origin });
  return { status: result.status, jsonBody: result.body };
}

app.http("checkout", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "checkout",
  handler: checkout,
});
