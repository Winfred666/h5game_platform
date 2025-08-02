import "server-only";
import { redirect } from "next/navigation";
import { ALL_NAVPATH } from "../clientConfig";
// getUser should wrap in cache for frequently auth
import { db } from "../dbInit";
import { authProtectedModule, buildServerQuery } from "../services/builder";
import { IntOrMeSchema, IntSchema, StringSchema } from "../types/zparams";

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

// could be admin or me.
export const getSelfUserById = buildServerQuery(
  [IntOrMeSchema],
  async (userId) => {
    // 1. check user session
    const userSession = await authProtectedModule(false);

    // 2. set isMe and isAdmin flags
    const isAdmin = userSession.isAdmin;
    let isMe = false;
    if (userId === "me") {
      userId = userSession.id; // if userId is 'me', use current user's id
      isMe = userId === userSession.id;
    }

    if (!isMe && !isAdmin) {
      // if not admin or self, redirect to home page
      throw Error("没有权限查看该用户信息");
    }

    // 3. get user from db
    const curUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        games: {
          select: {
            ...IncludeGames.include.games.select,
            isPrivate: true,
          },
          // select private games if admin or self
        },
      },
      omit: {
        isAdmin: false,
      },
    });

    // 4. redirect to logout if session mismatch with db. (invalid session)
    if (!curUser || (isMe && userSession.name !== curUser.name)
      || (isMe && userSession.isAdmin !== curUser.isAdmin)) {
      return redirect(ALL_NAVPATH.auto_signout.href);
    }

    // 5. return user with flags
    return {
      ...curUser,
      isAdmin,
      isMe,
    };
  }
);

export const getPublicUserById = buildServerQuery([IntSchema], (userId) =>
  db.user.findUnique({
    where: { id: userId },
    ...IncludeGames, // default include public games only
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
