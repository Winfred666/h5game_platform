"use client";

import { IUser, IUserGame, IContact } from '@/types/iuser';
import { parseContactsString, preprocessGames, preprocessUser } from '@/services/utils';
import useSWR from 'swr';
import { IGame } from '@/types/igame';

function useUserMsg(userId?: string){
  const api = userId ? `/user?id=${userId}` : null; // set to null so that useSWR will not fetch
  const {data: users, error} = useSWR<IUser[] | undefined>(api, {
    fallbackData: undefined,
  })
  // if (users) {
  //     console.log(`users:`, users);
  // }
  const user = users && users.length > 0 ? preprocessUser(users[0]) : undefined;
  const userGames = user?.games ?? [];
  const userContacts = user?.contacts ?? [];
  return {user, userGames, userContacts, error};
}

//如果用户在他自己的主页,可以获取user的所有游戏(包括未发布的unreleased games)
function useUnauditGames(userId?: string): IUserGame[] {
  const api = userId ? `/user_game?id=${userId}` : null; // set to null so that useSWR will not fetch
  const {data: games} = useSWR<IGame[]>(api, {
    fallbackData: [],
  })
  // console.log(userId,games);
  
  const preGames = preprocessGames(games);
  const user_games = (preGames ?? []).map(game => ({
    id: game?.id,
    title: game?.title,
    cover_image: game?.cover_image,
  }));
  console.log(user_games);
  return user_games;
}

export { useUserMsg, useUnauditGames };
