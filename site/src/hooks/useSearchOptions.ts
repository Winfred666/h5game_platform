import { useRef, useEffect, useState } from "react";
import useSWR from "swr";

function useSearchOptions(
  thing: "game"|"user",
) {
  const [searchTerm, setSearchTerm] = useState("");
  // for small amount of data, just get all options at once
  // const api = thing == "game" ? "/games?name=" : "user?name_qq="
  const {data : searchOptions, isLoading} = useSWR(`/${thing}`,{
    fallbackData: [],
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60 * 1000, // 60 sec deduplication interval
  });
  // post process
  return {searchOptions, searchTerm, setSearchTerm, isLoading};
}

function useSearchOptions_debounce(
  thing: "game"|"user",
  delay: number = 500, // default debounce delay
) {
  // useRef to store the search options
  // keep one function/object alive across renders and do not trigger any effect.
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermDebounced, setSearchTermDebounced] = useState("");
  const [isTimeLoading, setIsTimeLoading] = useState(false);

  const api = thing == "game" ? "/games?name=" : "user?name_qq=";
  const {data: searchOptions, isLoading} = useSWR(`/${api}${searchTermDebounced}`, {
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
  
  return {searchOptions, searchTerm, setSearchTerm, isLoading:(isLoading && isTimeLoading)};
}

export {useSearchOptions, useSearchOptions_debounce};
