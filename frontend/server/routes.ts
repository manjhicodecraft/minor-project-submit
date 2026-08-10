import type { Express } from "express";
import type { Server } from "http";

const BACKEND_URL = "http://localhost:8081";

// Proxy function to forward requests to Backend
async function proxyRequest(method: string, path: string, query?: any, body?: any) {
  const url = new URL(`${BACKEND_URL}${path}`);
  if (query) {
    Object.keys(query).forEach((key) => {
      url.searchParams.append(key, query[key]);
    });
  }

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);
  return response;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Proxy all API requests to Backend
  app.use("/api", async (req, res) => {
    try {
      const path = req.path;
      const method = req.method;
      const body = req.method !== "GET" && req.method !== "DELETE" ? req.body : undefined;
      const query = req.query;

      const response = await proxyRequest(method, `/api${path}`, query, body);
      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
