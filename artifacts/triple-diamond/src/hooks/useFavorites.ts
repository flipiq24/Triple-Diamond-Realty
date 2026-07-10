import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { buyerService } from "@/services/buyer.service";
import {
  getFavorites as getLocalFavorites,
  toggleFavorite as toggleLocal,
  subscribeFavorites,
  isFavorite as isLocalFavorite,
} from "@/lib/favorites";
import { useBuyerVerified } from "@/hooks/useBuyerVerified";

/**
 * Buyer favorites hook.
 *
 * Verified buyer (Supabase session with matching tenant):
 *   - source of truth is Supabase `public.buyer_favorites`
 *   - list cached via React Query, keyed on auth_user_id
 *   - mutations are optimistic (add/remove flip local cache immediately)
 *
 * Non-verified buyer:
 *   - source of truth is localStorage (unchanged legacy behavior)
 *   - lets casual browsers save without registering; migrates on sign-in
 *
 * First-sign-in migration:
 *   - on the FIRST verified render for a given user id, if localStorage has
 *     favorites AND Supabase returns an empty list, push all local ids up
 *     and clear localStorage. Runs at most once per user id per tab session
 *     via a ref guard.
 */
export function useFavorites() {
  const { verified } = useBuyerVerified();
  const queryClient = useQueryClient();

  // Track which auth user id we're currently syncing for, so we can detect
  // sign-in transitions and drive the one-shot migration.
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setUserId(data.session?.user?.id ?? null);
      })
      .catch(() => {
        /* silent — treated as unauth below */
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ─── Local (unverified) state ────────────────────────────────────
  const [local, setLocal] = useState<string[]>(() => getLocalFavorites());
  useEffect(() => {
    return subscribeFavorites(() => setLocal(getLocalFavorites()));
  }, []);

  // ─── Remote (verified) state via React Query ────────────────────
  const queryKey = ["buyer_favorites", userId ?? "anon"];
  const {
    data: remote = [],
  } = useQuery({
    queryKey,
    queryFn: () => buyerService.listFavorites(),
    enabled: verified && !!userId,
    staleTime: 60_000,
  });

  // ─── Mutations ───────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (id: string) => buyerService.addFavorite(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<string[]>(queryKey) ?? [];
      queryClient.setQueryData<string[]>(queryKey, [...new Set([...prev, id])]);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => buyerService.removeFavorite(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<string[]>(queryKey) ?? [];
      queryClient.setQueryData<string[]>(
        queryKey,
        prev.filter((x) => x !== id),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  // ─── One-shot migration ─────────────────────────────────────────
  const migratedForUserId = useRef<string | null>(null);
  useEffect(() => {
    if (!verified || !userId) return;
    if (migratedForUserId.current === userId) return;
    migratedForUserId.current = userId;
    const locals = getLocalFavorites();
    if (locals.length === 0) return;
    // Only migrate if the server list is currently empty — otherwise we'd
    // risk duplicating favorites the buyer already curated on another
    // device.
    if (remote.length > 0) return;
    (async () => {
      for (const id of locals) {
        try {
          await buyerService.addFavorite(id);
        } catch {
          /* keep going even if one duplicates */
        }
      }
      try {
        window.localStorage.removeItem("tdr_favorites_v1");
      } catch {
        /* ignore */
      }
      queryClient.invalidateQueries({ queryKey });
    })();
  }, [verified, userId, remote.length, queryClient, queryKey]);

  // ─── Merged view ────────────────────────────────────────────────
  // When verified, prefer the remote source. Otherwise fall through to
  // localStorage. During the brief window between sign-in and the first
  // remote fetch, we render the local list to avoid a jarring "all
  // favorites gone" flash.
  const favorites = verified && userId ? remote : local;

  const isFavorite = useCallback(
    (id: string) =>
      verified && userId ? remote.includes(id) : isLocalFavorite(id),
    [verified, userId, remote],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      if (verified && userId) {
        if (remote.includes(id)) {
          removeMutation.mutate(id);
          return false;
        }
        addMutation.mutate(id);
        return true;
      }
      return toggleLocal(id);
    },
    [verified, userId, remote, addMutation, removeMutation],
  );

  return { favorites, isFavorite, toggleFavorite };
}
