// here provide method to retrive data from backend.

import { IGame } from "@/types/igame";

// WARNING: mock is only fake data for test !
import {promises as fs} from 'fs';

export const getGameById = async (id: string): Promise<IGame> => {
      // Construct the absolute path to the image
    const json_file = await fs.readFile("./public/mocks/game_table.json", "utf-8");
    return JSON.parse(json_file)[0] as IGame;
}

export const getTopGames = async (page: number, pageSize: number): Promise<IGame[]> => {

    const json_file = await fs.readFile("./public/mocks/game_table.json", "utf-8");
    return JSON.parse(json_file) as IGame[];
}