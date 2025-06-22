"use server"

import {db} from "@/lib/db";
import { revalidatePath } from "next/cache";
import { IGame } from "../types/igame";

// directly use prisma-client to fetch data from sqlite
export async function getTopGames():Promise<IGame[]> {
  try {
    const games:any[] = await db.game.findMany({
      orderBy: {
        downloads: 'desc',
      },
      take: 10,
    });
    // get cover image / screenshot from minio.
    // dummy data, replace with real data.
    for (const game of games) {
      game.cover = `/api/game/${game.id}/cover`;
      game.screenshots = [`/api/game/${game.id}/screenshot`];
    }
    return games;
  }
  catch (error) {
    console.error("Error fetching top games:", error);
    return [];
  }
}