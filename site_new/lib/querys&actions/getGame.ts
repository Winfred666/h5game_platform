import "server-only";
// WARNING: getGame is only get props in server component, not action
import { db } from "@/lib/dbInit";
import { IDSchema, PositiveIntSchema, StringSchema } from "../types/zparams";
import { cache } from "react"; // for single term of build.
import { authProtectedModule, buildServerQuery } from "../services/builder";
import { redirect } from "next/navigation";
import { ALL_NAVPATH } from "../clientConfig";
import { getConfigurationValue, SWIPER_ID_KEY } from "../serverConfig";

const IncludeDeveloperTag = {
  // for include developers in game
  include: {
    developers: {
      select: {
        id: true,
        name: true,
      },
    },
    tags: true, // include tags
  },
};

export const getTopGames = cache(
  buildServerQuery(
    [], // no params
    async () =>{
      const gameIds = (await getConfigurationValue(SWIPER_ID_KEY)).split(",").filter(id=>id.trim());
      const games = await Promise.all(gameIds.map(async (id) =>
          db.game.findUnique({
            where: { id: id.trim() },
            ...IncludeDeveloperTag,
          })
        )
      );
      return games.filter(game => game !== null);
    }
  )
);

export const getGameCount = cache(buildServerQuery([], () => db.game.count()));

export const getAllGames = buildServerQuery(
  [PositiveIntSchema, PositiveIntSchema],
  (page, pageSize) =>
    db.game.findMany({
      ...IncludeDeveloperTag,
      skip: (page - 1) * pageSize, // page start from 1 while index from 0.
      take: pageSize,
    })
); // true means it is a query, not mutation, so it can return 404

// WARNING: for fast and static rendering, do not use authProtectedModule, need to decouple auth from public query.
export const getPublicGameById = buildServerQuery([IDSchema], async (id) =>
  db.game.findUnique({
    where: { id },
    ...IncludeDeveloperTag,
  })
);

export const getSelfGameById = buildServerQuery([IDSchema], async (id) => {
  const game = await db.game.findUnique({
    where: { id, isPrivate: undefined },
    ...IncludeDeveloperTag,
  }); // could search private game if has privilege

  if (!game) return game; // return null instead of call notFound(equal to throw error)

  // console.log(userSession ,game);
  const userSession = await authProtectedModule(false);
  if (
    userSession.isAdmin ||
    game.developers.some((dev) => dev.id === userSession.id)
  ) {
    // 1. authorization check: if game is private,
    // here we would add minimun protection by setting url+UUID
    return game;
  } else {
    if (game.isPrivate) {
      // 2. if the user is not admin or developer, not found this private game.
      return null;
    } else {
      // 3. tourist, redirect to public page instead of here private page.
      redirect(ALL_NAVPATH.game_id.href(game.id));
    }
  }
});

export const getGamesByTitle_thumbnail = buildServerQuery(
  [StringSchema],
  (title) =>
    db.game.findMany({
      // not include developer because only search thumbnail.
      where: {
        title: {
          contains: title,
        },
      },
      select: {
        developers: {
          select: {
            name: true,
          },
        },
        id: true,
        title: true,
        coverImage: true,
      },
      take: 10, // limit to 10 results for performance
    })
);

export const getGamesByTitle = buildServerQuery([StringSchema], (title) =>
  db.game.findMany({
    ...IncludeDeveloperTag,
    where: {
      title: {
        contains: title,
      },
    },
    take: 20, // limit to 20 for detailed page
  })
);

export const getGamesByTag = buildServerQuery(
  [IDSchema, PositiveIntSchema, PositiveIntSchema],
  (tagId, page, pageSize) =>
    db.game.findMany({
      ...IncludeDeveloperTag,
      where: {
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
);

export const getGameByTagCount = buildServerQuery([IDSchema], (tagId) =>
  db.game.count({
    where: {
      tags: {
        some: {
          id: tagId,
        },
      },
    },
  })
);

export const getAllUnauditGames = buildServerQuery([], async () => {
  await authProtectedModule(true); // true means this query need admin privilege
  return db.game.findMany({
    ...IncludeDeveloperTag,
    where: {
      isPrivate: true, // only get unaudit private games
    },
  });
}); // true means this query need admin privilege
