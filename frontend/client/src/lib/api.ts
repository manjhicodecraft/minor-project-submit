// API utility to call the local app API.
// In development this uses the same-origin /api route so Vite/Express can handle it.
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isAbsoluteUrl = /^https?:\/\//i.test(url);
  const fullUrl = isAbsoluteUrl ? url : `${API_BASE_URL}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await apiRequest('GET', url);
  return await res.json();
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiRequest('POST', url, data);
  return await res.json();
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiRequest('PUT', url, data);
  return await res.json();
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiRequest('PATCH', url, data);
  return await res.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await apiRequest('DELETE', url);
  return await res.json();
}