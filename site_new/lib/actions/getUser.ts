"server-only";
// getUser should wrap in cache for frequently auth
import { db } from "../dbInit";
import { buildServerQuery } from "../services/builder";
import { IntSchema, StringSchema } from "../types/zparams";

const IncludeGames = {
  include: {
    games: {
      select: {
        id: true,
        title: true,
        coverImage: true,
      },
    },
  },
};

const SelectThumbnail = {
  select: {
    id: true,
    name: true,
    avatar: true,
  },
};

export const getAllUser = buildServerQuery(
  [],
  () =>
    db.user.findMany({
      select: {
        ...SelectThumbnail.select,
        createdAt: true,
      },
    }) // not include game, only show user info that enough for thumbnail.
);

export const getUserById = buildServerQuery([IntSchema], (userId) =>
  db.user.findUnique({
    where: { id: userId },
    ...IncludeGames,
  })
);

// only used for search, not include user_game.
export const getUsersByNameOrQQ = buildServerQuery([StringSchema], (name_qq) =>
  db.user.findMany({
    ...SelectThumbnail,
    where: {
      OR: [{ name: { contains: name_qq } }, { qq: { contains: name_qq } }],
    },
    take: 10, // Limit to 10 results
  })
);