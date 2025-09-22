const defaultAllowed = [
  "https://jeongwooshin.github.io", // GitHub Pages origin
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

function parseAllowed() {
  const raw = Deno.env.get("CORS_ALLOWED_ORIGINS");
  if (!raw) return defaultAllowed;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = parseAllowed();
  const headers: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function handleOptions(req: Request) {
  const cors = getCorsHeaders(req);
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  return null;
}

export function jsonResponse(req: Request, body: unknown, init: number | ResponseInit = 200) {
  const cors = getCorsHeaders(req);
  const respInit = typeof init === "number" ? { status: init, headers: {} as Record<string, string> } : init;
  return new Response(JSON.stringify(body), {
    ...respInit,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors, ...(respInit as any).headers },
  });
}
