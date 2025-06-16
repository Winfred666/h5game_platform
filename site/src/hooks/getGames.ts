import { IGame } from '@/types/igame';

import useSWR from 'swr';
import { preprocessGames } from '@/services/utils';

function useGamesByName(name: string|undefined): IGame[] {
  const api = name ? `/game?name=${name}` : null;
  const { data } = useSWR<any[]>(api, {
    fallbackData: [],
  })
  const games = preprocessGames(data);
  return games;
}

function useGamesByTag(tag: string|undefined): IGame[] {
  const api = tag ? `/game?tag=${tag}` : null;
  const { data } = useSWR<any[]>(api, {
    fallbackData: [],
  })
  const games = data ? preprocessGames(data) : [];

  return games;
}

export { useGamesByName, useGamesByTag };