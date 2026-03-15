export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

export type RecordItem = {
  id: string;
  name: string;
  category: string;
  status: 'Uploaded' | 'Processing' | 'Verified';
  size: number;
  createdAt: string;
};

function apiBase() {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  return base.replace(/\/$/, '');
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      const errorFromBody = (() => {
        if (!data || typeof data !== 'object') return undefined;
        const maybeError = (data as Record<string, unknown>).error;
        return typeof maybeError === 'string' ? maybeError : undefined;
      })();

      const msg = errorFromBody || res.statusText || 'Request failed';
      return { ok: false, error: msg, status: res.status };
    }

    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export function listRecords() {
  return requestJson<{ records: RecordItem[] }>('/api/records', { method: 'GET' });
}

export function createRecord(input: { name: string; category?: string; status?: RecordItem['status']; size?: number }) {
  return requestJson<{ record: RecordItem }>('/api/records', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteRecord(id: string) {
  return requestJson<{ ok: true }>(`/api/records/${id}`, { method: 'DELETE' });
}
