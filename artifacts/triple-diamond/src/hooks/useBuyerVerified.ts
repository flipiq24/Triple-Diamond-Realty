import { useEffect, useState } from "react";
import { isVerified, getVerifiedBuyer, type VerifiedBuyer } from "@/lib/buyerAccess";

export function useBuyerVerified(): { verified: boolean; buyer: VerifiedBuyer | null } {
  const [verified, setVerified] = useState<boolean>(() => isVerified());
  const [buyer, setBuyer] = useState<VerifiedBuyer | null>(() => getVerifiedBuyer());

  useEffect(() => {
    const handler = () => {
      setVerified(isVerified());
      setBuyer(getVerifiedBuyer());
    };
    window.addEventListener("tdr-verified-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("tdr-verified-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { verified, buyer };
}
