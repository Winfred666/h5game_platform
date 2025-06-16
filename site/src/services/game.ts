// here provide method to retrive data from backend.

import { IGame } from "@/types/igame";

// WARNING: mock is only fake data for test !
import { preprocessGame, preprocessGames } from "./utils";

export const getAllGames = async (page?: number): Promise<IGame[]> => {
  try {
    let games: any = await fetch(process.env.SERVER_URL + "/game");
    games = await games.json();
    games = preprocessGames(games);
    return games as IGame[];
  } catch (e) {
    console.error("Next.js Server: Failed to fetch games!");
    return [];
  }
};

export const getTopGames = async (): Promise<IGame[]> => {
  try {
    let games: any = await fetch(process.env.SERVER_URL + "/game/top");
    games = await games.json();
    games = preprocessGames(games);
    return games as IGame[];
  } catch (e) {
    console.error("Next.js Server:Failed to fetch Top Games!",e);
    return [];
  }
};

export const getAllTags = async (): Promise<string[]> => {
  try {
    let tags: any = await fetch(process.env.SERVER_URL + "/tag");
    tags = await tags.json();
    return tags as [];
  } catch (e) {
    console.error("Next.js Server: Failed to fetch tags!");
    return [];
  }
};


export const getGameById = async (id: string): Promise<IGame | undefined> => {
  try {
    let game: any = await fetch(process.env.SERVER_URL + `/game?id=${id}`);
    game = await game.json();
    if (!game) return undefined;
    game = preprocessGame(game);
    return game as IGame;
  } catch (e) {
    console.error("Next.js Server: Failed to fetch game by id!");
  }
}

export const getGamesByName = async (name?: string): Promise<IGame[]> => {
  try {
    if (!name) return [];
    let games: any = await fetch(process.env.SERVER_URL + `/game?name=${name}`);
    games = await games.json();
    games = preprocessGames(games);
    return games as IGame[];
  } catch (e) {
    console.error("Next.js Server: Failed to fetch games by name!");
    return [];
  }
}

export const getGamesByTag = async (tag?: string): Promise<IGame[]> => {
  try {
    if (!tag) return [];
    let games: any = await fetch(process.env.SERVER_URL + `/game?tag=${tag}`);
    games = await games.json();
    games = preprocessGames(games);
    return games as IGame[];
  } catch (e) {
    console.error("Next.js Server: Failed to fetch games by tag!");
    return [];
  }
}