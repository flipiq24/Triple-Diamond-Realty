const API_BASE_URL = import.meta.env.VITE_API_URL;
const TENANT_NAME = import.meta.env.VITE_TENANT_NAME;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not set");
}

if (!TENANT_NAME) {
  throw new Error("VITE_TENANT_NAME is not set");
}

const STORAGE_KEYS = {
  token: "auth_token",
  user: "user",
  orgId: "user_org_id",
} as const;

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/$/, "");
  const tenant = TENANT_NAME.replace(/^\/+|\/+$/g, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}/${tenant}${suffix}`;
}

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

async function handleUnauthorized() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.orgId);
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export async function apiFetch(
  path: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { body, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-User-Timezone": getTimezone(),
    ...(headers as Record<string, string> | undefined),
  };

  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined || body === null
        ? undefined
        : typeof body === "string"
          ? body
          : JSON.stringify(body),
  });

  if (response.status === 401 && token) {
    await handleUnauthorized();
  }

  return response;
}

export const http = {
  get: (path: string, options?: FetchOptions) =>
    apiFetch(path, { ...options, method: "GET" }),
  post: (path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch(path, { ...options, method: "POST", body }),
  put: (path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch(path, { ...options, method: "PUT", body }),
  patch: (path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch(path, { ...options, method: "PATCH", body }),
  delete: (path: string, options?: FetchOptions) =>
    apiFetch(path, { ...options, method: "DELETE" }),
};

export { STORAGE_KEYS };
