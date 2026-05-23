import { useEffect, useState, useCallback } from "react";
import { getFavorites, toggleFavorite as toggle, subscribeFavorites } from "@/lib/favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  useEffect(() => {
    return subscribeFavorites(() => setFavorites(getFavorites()));
  }, []);

  const toggleFavorite = useCallback((id: string) => toggle(id), []);
  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, isFavorite, toggleFavorite };
}
