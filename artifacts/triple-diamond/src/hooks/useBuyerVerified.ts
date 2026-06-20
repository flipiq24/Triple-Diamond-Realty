import { useEffect, useState } from "react";
import { getVerifiedBuyer, type VerifiedBuyer } from "@/lib/buyerAccess";
import { useSession } from "@/contexts/session";

export function useBuyerVerified(): { verified: boolean; buyer: VerifiedBuyer | null } {
  const { user } = useSession();
  const [buyer, setBuyer] = useState<VerifiedBuyer | null>(() => getVerifiedBuyer());

  useEffect(() => {
    const handler = () => setBuyer(getVerifiedBuyer());
    window.addEventListener("tdr-verified-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("tdr-verified-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { verified: !!user, buyer };
}
