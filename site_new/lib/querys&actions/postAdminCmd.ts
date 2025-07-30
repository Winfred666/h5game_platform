"use server";

import { revalidatePath } from "next/cache";
import { db } from "../dbInit";
import { authProtectedModule, buildServerAction } from "../services/builder";
import { deleteGameFolder, switchBucketGameFolder } from "../services/uploadGameZip";
import { IntSchema, TagSchema } from "../types/zparams";
import { ALL_NAVPATH } from "../clientConfig";
import { deleteImageFolder } from "../services/uploadImage";
import { MINIO_BUCKETS } from "../serverConfig";

export const approveGameAction = buildServerAction([IntSchema],
  async (gameId: number) => {
    // 1. check user is admin, game is private
    await authProtectedModule(true);
    const game = await db.game.findUnique({
      where: { id: gameId, isPrivate: true },
      select: { id:true, isPrivate: true },
    });

    if (!game || !game.isPrivate)
      throw Error("所选游戏不存在或已经审核");

    // 2. move game from UNAUDIT bucket to GAME bucket
    await switchBucketGameFolder(game);

    // 3. update game isPrivate to false
    await db.game.update({
      where: { id: gameId },
      data: { isPrivate: false },
    });

    // 4. revalidate admin game list page
    revalidatePath(ALL_NAVPATH.admin_review.href);
    revalidatePath(ALL_NAVPATH.admin_games.href);
  }
)

export const deleteGameAction = buildServerAction([IntSchema],
  async (gameId: number) => {
    // 1. check user is admin
    await authProtectedModule(true);
    
    // 2. find game
    const game = await db.game.findUnique({
      where: { id: gameId, isPrivate: undefined },
      select: { id: true, isPrivate: true },
    });
    if (!game) throw Error("所删游戏不存在");

    // 3. delete game + user relation
    await db.game.delete({
      where: { id: gameId },
    });
    // 4. delete game folder in minio
    await deleteGameFolder(game);

    // 5. delete game cover and screenshot
    await deleteImageFolder(MINIO_BUCKETS.IMAGE, `${gameId}/`);

    // 6. revalidate admin game list page
    revalidatePath(game.isPrivate ? ALL_NAVPATH.admin_review.href : ALL_NAVPATH.admin_games.href);
  }
)

export const deleteTagAction = buildServerAction([IntSchema],
  async (tagId: number) => {
    // 1. check user is admin
    await authProtectedModule(true);

    // 2. delete tag
    const tag = await db.tag.deleteMany({
      where: { id: tagId },
    });
    if (tag.count === 0) throw Error("所删标签不存在");

    // 3. revalidate admin tag list page
    revalidatePath(ALL_NAVPATH.admin_tags.href);
    revalidatePath(ALL_NAVPATH.upload.href);
  }
);

export const addTagAction = buildServerAction([TagSchema],
  async (tagName: string) => {
    // 1. check user is admin
    await authProtectedModule(true);

    // 2. check tag not exists
    const existingTag = await db.tag.findFirst({
      where: { name: tagName },
    });
    if (existingTag) throw Error("标签已存在");

    // 3. create new tag
    const newTag = await db.tag.create({
      data: { name: tagName },
    });

    // 4. revalidate admin tag list page
    revalidatePath(ALL_NAVPATH.admin_tags.href);
    revalidatePath(ALL_NAVPATH.upload.href);

    return newTag;
  }
);