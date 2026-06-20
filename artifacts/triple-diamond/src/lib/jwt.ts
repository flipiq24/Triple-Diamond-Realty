export interface JwtPayload {
  userId?: number;
  email?: string;
  orgId?: number;
  org_id?: number;
  impersonatorId?: number | null;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 <= Date.now();
}
