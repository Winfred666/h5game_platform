import "server-only";

import { db } from "../dbInit";
import { authProtectedModule } from "./builder";

export const authDeveloperofGameOrAdmin = async (gameId: string) => {
  // 1. Auth users as admin or this game developer
  const userSession = await authProtectedModule(false); // false means this action do not need admin privilege
  const oldGame = await db.game.findUnique({
    where: { id: gameId },
    include: {
      developers: {
        select: {
          id: true,
        },
      },
    },
  });

  // 2. validate game ownership
  if (!oldGame) {
    throw new Error("游戏不存在或已被删除。");
  }
  if (
    !(
      userSession.isAdmin ||
      oldGame.developers.some((dev) => dev.id === userSession.id)
    )
  ) {
    throw new Error("非管理员或作者，无权更新游戏。");
  }

  return { oldGame, userSession };
};
