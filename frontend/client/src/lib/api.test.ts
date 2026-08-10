import test from "node:test";
import assert from "node:assert/strict";
import { apiRequest } from "./api";

test("apiRequest keeps /api calls on the same origin", async () => {
  const requests: string[] = [];
  const originalFetch = global.fetch;

  global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push(String(input));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    await apiRequest("POST", "/api/login", { mobile_number: "9876543210", password: "secret" });
    assert.deepEqual(requests, ["/api/login"]);
  } finally {
    global.fetch = originalFetch;
  }
});
