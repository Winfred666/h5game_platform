"server-only";
// WARNING: getGame is only get props in server component, not action
import { db } from "@/lib/dbInit";
import { IntSchema, StringSchema } from "../types/zparams";
import { cache } from "react"; // for single term of build.
import { authProtectedModule, buildServerQuery } from "../services/builder";

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
    () =>
      db.game.findMany({
        ...IncludeDeveloperTag,
        take: 3, // limit to top 3 games
      })
  )
);

export const getGameCount = cache(buildServerQuery([], () => db.game.count()));

export const getAllGames = buildServerQuery(
  [IntSchema, IntSchema],
  (page, pageSize) =>
    db.game.findMany({
      ...IncludeDeveloperTag,
      skip: page * pageSize,
      take: pageSize,
    })
); // true means it is a query, not mutation, so it can return 404

export const getGameById = buildServerQuery([IntSchema], async (id) => {
  const game = await db.game.findUnique({
    where: { id: id, isPrivate: undefined },
    ...IncludeDeveloperTag,
  }); // could search private game if has privilege

  if (!game) return game; // return null instead of call notFound(equal to throw error)
  const userSession = await authProtectedModule(false);
  if (
    userSession.isAdmin ||
    game.developers.some((dev) => dev.id === userSession.id)
  ) {
    // 1. authorization check: if game is private, only developer can see it.
    return game;
  } else {
    if (game.isPrivate) {
      // 2. if not admin or developer, check if game is private
      return null;
    } else {
      // 3. remove isPrivate field to avoid exposing it to public
      return {
        ...game,
        isPrivate: undefined, // remove isPrivate field
      };
    }
  }
});

export const getAllTags = cache(buildServerQuery([], () => db.tag.findMany()));

// WARNING: using undefined (not found, not error) if cannot find tag.
export const getTagById = buildServerQuery([IntSchema], (id) =>
  db.tag.findUnique({
    where: { id: id },
  })
);

export const getTagsByTitle = buildServerQuery([StringSchema], (title) =>
  db.tag.findMany({
    where: {
      name: {
        contains: title,
      },
    },
    take: 10, // limit to 10 results for performance
  })
); // true means it is a query, not mutation, so it can return 404

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
  [IntSchema, IntSchema],
  (tagId, page) =>
    db.game.findMany({
      ...IncludeDeveloperTag,
      where: {
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      skip: page * 20,
      take: 20,
    })
);

export const getGameByTagCount = buildServerQuery([IntSchema], (tagId) =>
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
