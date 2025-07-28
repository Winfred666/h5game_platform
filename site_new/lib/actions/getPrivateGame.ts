"server-only";

import { db } from "../dbInit";
import { authModule, buildServerQuery } from "../services/builder";

export const getSelfUnauditGames = buildServerQuery([], async () => {
  const userSession = await authModule(false); // false means this query do not need admin privilege
  const userGame = await db.user.findUnique({
    where: { id: userSession.id },
    select: {
      games: {
        select: {
          id: true,
          title: true,
          coverImage: true,
        },
        where: {
          isPrivate: false, // only get public games
        },
      },
    },
  });
  if (!userGame) {
    throw new Error("用户不存在！");
  }
  return userGame.games;
});

export const getAllUnauditGames = buildServerQuery([], async () => {
  await authModule(true); // true means this query need admin privilege
  return db.game.findMany({
    where: {
      isPrivate: false, // only get public games
    },
  });
}); // true means this query need admin privilege
