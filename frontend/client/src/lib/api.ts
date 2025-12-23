// API utility to connect to the Java backend
const API_BASE_URL = 'http://localhost:8081';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith('/api') ? `${API_BASE_URL}${url}` : url;
  
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

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiRequest('PATCH', url, data);
  return await res.json();
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await apiRequest('DELETE', url);
  return await res.json();
}