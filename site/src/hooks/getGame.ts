import { IGame } from '@/types/igame';

//import { useSnackBar } from "@/components/SnackBarContext";

import useSWR from 'swr';
import { preprocessGame } from '@/services/utils';

//由gameId获取单个game
function useGame(gameId: string): {game: IGame | undefined, isLoading:boolean} {
  const { data, isLoading } = useSWR<any>(`/game?id=${gameId}`, {
    fallbackData: undefined,
  })
  console.log(data);
  const game = preprocessGame(data);  
  return {game, isLoading};
}

export default useGame;