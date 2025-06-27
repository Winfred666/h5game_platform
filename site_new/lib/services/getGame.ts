// WARNING: getGame is only get props in server component, not action
import { db } from "@/lib/dbInit";
import { IGame, IGameTag } from "../types/igame";
import { IntSchema, StringSchema } from "../types/zparams";
import { cache } from "react"; // for single term of build.
import { convertToPlainObj, processClientWorkload } from "../utils";

const IncludeDeveloperTag = { // for include developers in game
  include: {
    developers: {
      select: {
        id: true,
        name: true,
      },
    },
    tags: {
      select: {
        id: true,
        name: true,
      }
    }, // include tags
  },
};

export const getTopGames = cache(async (): Promise<IGame[]> => {
  return db.game.findMany({
    ...IncludeDeveloperTag,
    take: 3, // limit to top 3 games
  }).then(convertToPlainObj); // convert to plain object to pass to client side safely
});

export const getGameCount = cache(async (): Promise<number> => {
  return db.game.count();
});

export async function getAllGames(
  _page: unknown,
  _pageSize: number = 30
): Promise<IGame[]> {
  const page = processClientWorkload(_page, IntSchema);
  const pageSize = processClientWorkload(_pageSize, IntSchema);
  return db.game.findMany({
    ...IncludeDeveloperTag,
    skip: page * pageSize,
    take: pageSize,
  }).then(convertToPlainObj);
}

export async function getGameById(_id: unknown): Promise<IGame | undefined> {
  // TODO: auth first. could get private game if user is developer or admin.
  const id = processClientWorkload(_id, IntSchema);
  const game = await db.game.findUnique({
    where: { id: id },
    ...IncludeDeveloperTag
  });
  if (!game) return undefined; // WARNING: using undefined (not found, not error) if cannot find game.
  return convertToPlainObj(game);
}

export const getAllTags = cache(async (): Promise<IGameTag[]> => {
  return await db.tag.findMany();
});

export const getTagById = async (_id: unknown): Promise<IGameTag | undefined> => {
  const id = processClientWorkload(_id, IntSchema);
  const tag = await db.tag.findUnique({
    where: { id: id },
  });
  if (!tag) return undefined; // WARNING: using undefined (not found, not error) if cannot find tag.
  return tag;
}

export async function getGamesByTitle(_title: unknown): Promise<IGame[]> {
  // could be used in client side search
  const title = processClientWorkload(_title, StringSchema);
  return db.game.findMany({
    ...IncludeDeveloperTag,
    where: {
      title: {
        contains: title,
      },
    },
    take: 10, // limit to 10 results for performance
  }).then(convertToPlainObj);
}

export async function getGamesByTag(
  _tagId: unknown,
  _page: unknown
): Promise<IGame[]> {
  const tagId = processClientWorkload(_tagId, IntSchema);
  const page = processClientWorkload(_page, IntSchema);
  return db.game.findMany({
    ...IncludeDeveloperTag,
    where: {
      tags: {
        some: {
          id: tagId
        }
      }
    },
    skip: page * 20,
    take: 20,
  }).then(convertToPlainObj);
}

export async function getGameByTagCount(_tagId: unknown): Promise<number> {
  const tagId = processClientWorkload(_tagId, StringSchema);
  return db.game.count({
    where: {
      tags: {
        some : {
          id: tagId
        }
      },
    },
  });
}
