// Lightweight client-side buyer verification flow.
// In production the codes would be sent via real email + SMS providers (e.g. SendGrid + Twilio).
// For now we generate codes on-device and stash verification status in localStorage.

const KEY = "tdr_buyer_verified_v1";
const DRAFT_KEY = "tdr_buyer_draft_v1";

export type VerifiedBuyer = {
  name: string;
  email: string;
  phone: string;
  verifiedAt: number;
  consent: boolean;
};

export function getVerifiedBuyer(): VerifiedBuyer | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VerifiedBuyer;
  } catch {
    return null;
  }
}

export function isVerified(): boolean {
  return !!getVerifiedBuyer();
}

export function setVerifiedBuyer(b: Omit<VerifiedBuyer, "verifiedAt">) {
  const data: VerifiedBuyer = { ...b, verifiedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("tdr-verified-change"));
}

export function clearVerified() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("tdr-verified-change"));
}

export function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
