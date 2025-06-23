// WARNING: getGame is only get props in server component, not action
import { db } from "@/lib/db";
import { IGame } from "../types/igame";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// create views for game, just bring out developers id and name.
const includeIDNames = {
  include: {
    developers: {
      select: {
        id: true,
        name: true,
      },
    },
  },
};

async function postprocessGame(
  game: Prisma.GameGetPayload<typeof includeIDNames>
): Promise<IGame> {
  return {
    ...game,
    createdAt: game.createdAt.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    tags: game.tags.split(","),
    joinDevelopers: game.developers.map((dev) => dev.name).join(", "),
    size: (game.size / 1024).toFixed(2) + " MB", // 转换为MB并保留两位小数,
    coverImage: "/h5game/mocks/cat_mouse_fullscreen/map/background/map1_kitchen.png",
    screenshots: ["/h5game/mocks/cat_mouse_fullscreen/map/background/map2_garden.png",
                  "/h5game/mocks/cat_mouse_fullscreen/background13.png"],
    downloadUrl: "/h5game/mocks/cat_mouse_fullscreen.zip",
  };
}

export async function getTopGames(): Promise<IGame[]> {
  return db.game
    .findMany({
      orderBy: {
        downloads: "desc",
      },
      take: 10,
      ...includeIDNames,
      where: {
        isPrivate: false, // only get public games
      },
    })
    .then((games) => Promise.all(games.map(postprocessGame)));
}

export async function getAllGames(
  page: number,
  pageSize: number = 20
): Promise<IGame[]> {
  return db.game
    .findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: page * pageSize,
      take: pageSize,
      ...includeIDNames,
      where: {
        isPrivate: false, // only get public games
      },
    })
    .then((games) => Promise.all(games.map(postprocessGame)));
}

export async function getGameById(id: number): Promise<IGame | undefined> {
  // TODO: auth first. could get private game if user is developer or admin.
  return db.game
    .findUnique({
      where: { id: id },
      ...includeIDNames,
    })
    .then((game) => {
      if (!game) return undefined; // WARNING: using undefined if cannot find game.
      return postprocessGame(game);
    });
}

export async function getAllTags(): Promise<string[]> {
  return db.tag.findMany()
    .then((tags) => tags.map((tag) => tag.name));
}
