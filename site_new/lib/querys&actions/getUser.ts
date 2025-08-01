import "server-only";
import { redirect } from "next/navigation";
import { ALL_NAVPATH } from "../clientConfig";
// getUser should wrap in cache for frequently auth
import { db } from "../dbInit";
import { authProtectedModule, buildServerQuery } from "../services/builder";
import { IntOrMeSchema, StringSchema } from "../types/zparams";

const IncludeGames = {
  include: {
    games: {
      select: {
        id: true,
        title: true,
        coverImage: true,
      },
      where: {
        isPrivate: false, // only return public games for safety
      },
    },
  },
};

const SelectThumbnail = {
  select: {
    id: true,
    name: true,
    hasAvatar: true,
    avatar: true,
  },
};

export const getAllUsers = buildServerQuery(
  [],
  () =>
    db.user.findMany({
      select: {
        ...SelectThumbnail.select,
        createdAt: true,
      },
    }) // not include game, only show user info that enough for thumbnail.
);

export const getAllUsersWithQQ = buildServerQuery([], async () => {
  await authProtectedModule(true); // ensure only admin can access this
  return db.user.findMany({
    select: {
      ...SelectThumbnail.select,
      createdAt: true,
      isAdmin: true,
      qq: true,
    },
  });
});

export const getUserById = buildServerQuery([IntOrMeSchema], async (userId) => {
  // 1. if using authProtectedModule, this is protected and any unauthorized access will throw error.
  // so only try to get user session if userId is not 'me'.
  let isAdmin = false;
  let isMe = false;
  try {
    const userSession = await authProtectedModule(false);
    if (userId === "me") {
      userId = userSession.id; // if userId is 'me', use current user's id
    }
    isAdmin = userSession.isAdmin;
    isMe = userSession.id === userId;
  } catch (err) {
    if (userId === "me") throw err;
  }

  // 2. If admin or viewing own profile, include private games
  const hasPrivilege = isAdmin || isMe;
  return db.user
    .findUnique({
      where: { id: userId },
      include: {
        games: {
          select: {
            ...IncludeGames.include.games.select,
            isPrivate: hasPrivilege,
          },
          where: hasPrivilege ? {} : IncludeGames.include.games.where, // if not admin or self, only return public games
        },
      },
    })
    .then(async (user) => {
      if (!user) {
        if (isMe) { // if userId is 'me' and not found, sign out
          return redirect(ALL_NAVPATH.auto_signout.href);
        }
        throw new Error("未找到该用户");
      }
      return {
        ...user,
        isAdmin,
        isMe,
      };
    });
});

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
