import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { handleLead } from "../core/lead";

/** POST /api/lead — Azure Functions v4 adapter over the shared core logic. */
export async function lead(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const body = await request.json().catch(() => ({}));
  const result = await handleLead(body);
  return { status: result.status, jsonBody: result.body };
}

app.http("lead", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "lead",
  handler: lead,
});
