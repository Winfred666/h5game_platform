// WARNING: getGame is only get props in server component, not action
import { db } from "@/lib/dbInit";
import { IGame } from "../types/igame";
import { Prisma } from "@prisma/client";
import { IntSchema, StringSchema } from "../types/zparams";
import { Schema } from "zod";

import { revalidatePath } from "next/cache";
import { cache } from "react"; // for single term of build.

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

function processClientWorkload(params: unknown, validator: Schema<any>): any {
  const validation = validator.safeParse(params);
  if (!validation.success) {
    throw new Error("Invalid parameters: " + validation.error.message);
  }
  return validation.data;
}

async function processGamePost(
  game: Prisma.GameGetPayload<typeof includeIDNames>
): Promise<IGame> {
  return {
    ...game,
    online: game.isOnline
      ? undefined
      : {
          url: "https://example.com/game/" + game.id,
          width: game.width ?? undefined,
          height: game.height ?? undefined,
        },
    createdAt: game.createdAt.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    tags: game.tags.split(","),
    joinDevelopers: game.developers.map((dev) => dev.name).join(", "),
    size: (game.size / 1024).toFixed(2) + " MB", // 转换为MB并保留两位小数,
    coverImage:
      "/h5game/mocks/cat_mouse_fullscreen/map/background/map1_kitchen.png",
    screenshots: [
      "/h5game/mocks/cat_mouse_fullscreen/map/background/map2_garden.png",
      "/h5game/mocks/cat_mouse_fullscreen/background13.png",
    ],
    downloadUrl: "/h5game/mocks/cat_mouse_fullscreen.zip",
  };
}

async function processGameManyPublic({
  where,
  skip,
  take,
}: {
  where?: Prisma.GameWhereInput;
  skip?: number;
  take?: number;
}): Promise<IGame[]> {
  return db.game
    .findMany({
      orderBy: {
        createdAt: "desc", // leverage partial index
      },
      skip,
      take,
      where: {
        isPrivate: false, // only get public games
        ...where,
      },
      ...includeIDNames, // include developers id and name
    })
    .then((games) => Promise.all(games.map(processGamePost)));
}

export const getTopGames = cache(async (): Promise<IGame[]> => {
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
    .then((games) => Promise.all(games.map(processGamePost)));
});

export const getGameCount = cache(async (): Promise<number> => {
  return db.game.count({
    where: {
      isPrivate: false, // only count public games
    },
  });
});


export async function getAllGames(
  _page: unknown,
  _pageSize: number = 30
): Promise<IGame[]> {
  const page = processClientWorkload(_page, IntSchema);
  const pageSize = processClientWorkload(_pageSize, IntSchema);
  return processGameManyPublic({
    skip: page * pageSize,
    take: pageSize,
  });
}

export async function getGameById(_id: unknown): Promise<IGame | undefined> {
  // TODO: auth first. could get private game if user is developer or admin.
  const id = processClientWorkload(_id, IntSchema);
  const game = await db.game.findUnique({
    where: { id: id },
    ...includeIDNames,
  });
  if (!game) return undefined; // WARNING: using undefined (not found, not error) if cannot find game.
  return processGamePost(game);
}

export async function getAllTags(): Promise<string[]> {
  const tags = await db.tag.findMany();
  return tags.map((tag) => tag.name);
}

export async function getGamesByTitle(_title: unknown): Promise<IGame[]> {
  // could be used in client side search
  const title = processClientWorkload(_title, StringSchema);
  return processGameManyPublic({
    where: {
      title: {
        contains: title,
      },
    },
    take: 10, // limit to 10 results for performance
  });
}

export async function getGamesByTag(_tag: unknown, _page: unknown): Promise<IGame[]> {
  const tag = processClientWorkload(_tag, StringSchema);
  const page = processClientWorkload(_page, IntSchema);
  return processGameManyPublic({
      where: {
        tags: {
          contains: tag, // in sqlite tags is string of tag joint by ","
        },
      },
      skip: page * 20,
      take: 20,
    });
}

export async function getGameByTagCount(_tag: unknown): Promise<number> {
  const tag = processClientWorkload(_tag, StringSchema);
  return db.game.count({
    where: {
      tags: {
        contains: tag, // in sqlite tags is string of tag joint by ","
      },
      isPrivate: false, // only count public games
    },
  });
}