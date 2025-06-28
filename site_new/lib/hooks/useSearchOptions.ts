import { useEffect, useRef, useState } from "react";
import useSWR from 'swr';

export default function useSearchOptions_debounce(
  thing: "game"|"user",
  delay: number = 800, // default debounce delay
) {
  // useRef to store the search options
  // keep one function/object alive across renders and do not trigger any effect.
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermDebounced, setSearchTermDebounced] = useState("");
  const [isTimeLoading, setIsTimeLoading] = useState(false);

  // for highly dynamics data, still use swr and api router to fetch data.
  const api = thing == "game" ? "games?name=" : "users?name_qq=";
  const apiFinal = searchTermDebounced.length > 0 ? `/${api}${searchTermDebounced}` : null;
  const {data: searchOptions, isLoading} = useSWR(apiFinal, {
    fallbackData: [],
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // add debounce directly into it
  useEffect(() => {
    if (searchTerm) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setIsTimeLoading(true);
      timerRef.current = setTimeout(() => {
        setSearchTermDebounced(searchTerm);
        setIsTimeLoading(false);
      }, delay);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current); // clear the timer when the component unmounts or searchTerm changes
      }
    };
  }, [searchTerm, setSearchTermDebounced, delay]);
  
  return {searchOptions, searchTerm, setSearchTerm, isLoading:(isLoading || isTimeLoading)};
}