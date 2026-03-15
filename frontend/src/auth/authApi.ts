import type { UserProfile } from './AuthContext';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

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

      const msg =
        errorFromBody ||
        res.statusText ||
        'Request failed';
      return { ok: false, error: msg, status: res.status };
    }

    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export function authMe() {
  return requestJson<UserProfile | null>('/api/auth/me', { method: 'GET' });
}

export function authLogin(email: string, password: string) {
  return requestJson<{ user: UserProfile }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function authRegister(input: { firstName: string; lastName: string; email: string; phone?: string; gender?: string; dob?: string; password: string }) {
  return requestJson<{ user: UserProfile }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function authLogout() {
  return requestJson<{ ok: true }>('/api/auth/logout', { method: 'POST' });
}

export function updateMe(updates: Partial<Omit<UserProfile, 'initials'>>) {
  return requestJson<{ user: UserProfile }>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}
