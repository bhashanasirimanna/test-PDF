const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // Try refresh
    const refreshRes = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!refreshRes.ok) {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    // Retry original request
    const retryRes = await fetch(`${BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!retryRes.ok) throw new Error(await retryRes.text());
    return retryRes.json();
  }

  if (!res.ok) {
    const err = await res.text().catch(() => 'Request failed');
    throw new Error(err);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (null as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getDocumentUrl: (id: string) => `${BASE}/documents/${id}/stream`,
  getDownloadUrl: (id: string) => `${BASE}/documents/${id}/download`,
  getPrintUrl: (id: string) => `${BASE}/documents/${id}/print`,
};
