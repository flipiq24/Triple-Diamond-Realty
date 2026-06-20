import { http, STORAGE_KEYS } from "@/lib/http-client";
import { decodeJwt } from "@/lib/jwt";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isAdmin?: boolean;
  isAcquisitionManager?: boolean;
  isStaff?: boolean;
  phoneNumber?: string;
  contact_id?: number;
  orgId?: number | null;
  orgName?: string | null;
  isImpersonating?: boolean;
  impersonatorId?: number | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.token, token);
    const decoded = decodeJwt(token);
    const orgId = decoded?.org_id ?? decoded?.orgId;
    if (orgId !== undefined && orgId !== null) {
      localStorage.setItem(STORAGE_KEYS.orgId, String(orgId));
    } else {
      localStorage.removeItem(STORAGE_KEYS.orgId);
    }
  } else {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.orgId);
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await http.post("/auth/login", credentials);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Login failed");
    }

    const data = (await response.json()) as LoginResponse;
    setToken(data.accessToken);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
    return data;
  },

  async refresh(): Promise<string | null> {
    const response = await http.post("/auth/refresh");
    if (!response.ok) return null;
    const data = (await response.json()) as { accessToken: string };
    if (data.accessToken) {
      setToken(data.accessToken);
      return data.accessToken;
    }
    return null;
  },

  logout(): void {
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.user);
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.token);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
