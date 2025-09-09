import { useEffect, useState } from "react";
import useSWR from "swr";

type SearchKind = "game" | "user" | "admin_game" | "admin_user";

interface Options<T = any> {
  searchOptions: T[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isLoading: boolean;
}

const PATH_MAP: Record<SearchKind, string> = {
  game: "games?name=",
  admin_game: "games?include=admin&name=",
  user: "users?name_qq=",
  admin_user: "users?include=admin&name_qq=",
};

/**
 * Debounced search with SWR
 * - Debounces input before triggering SWR
 * - Resets results on clear
 * - URL-encodes query
 * - Optional minChars threshold (default 1)
 */
export default function useSearchOptionsDebounce<T = any>(
  kind: SearchKind,
  delay = 1000,
  minChars = 1
): Options<T> {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);


  // Debounce logic
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed.length === 0) {
      setDebounced("");
      setIsDebouncing(false);
      return;
    }
    setIsDebouncing(true);
    const t = setTimeout(() => {
      setDebounced(trimmed);
      setIsDebouncing(false);
    }, delay);
    return () => clearTimeout(t);
  }, [searchTerm, delay]);

  const base = PATH_MAP[kind];
  const shouldSearch =
    debounced.length >= minChars && debounced.trim().length >= minChars;

  const key = shouldSearch
    ? `/${base}${encodeURIComponent(debounced)}`
    : null;

  const { data, isLoading } = useSWR<T[]>(key, {
    fallbackData: [],
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });


  return {
    searchOptions: data || [],
    searchTerm,
    setSearchTerm,
    isLoading: isLoading || isDebouncing,
  };
}