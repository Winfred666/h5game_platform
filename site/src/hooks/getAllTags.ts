import useSWR from 'swr';

// import { useSnackBar } from "@/components/SnackBarContext";

function useAllTags():string[] { 
  const {data: allTags} = useSWR<string[] | undefined>(`/tag`, {
    fallbackData: [],
  })
  return allTags?? [];
}

export default useAllTags;