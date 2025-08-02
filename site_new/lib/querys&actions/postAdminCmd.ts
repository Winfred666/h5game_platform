"use server";

import { revalidatePath } from "next/cache";
import { db } from "../dbInit";
import { authProtectedModule, buildServerAction } from "../services/builder";
import {
  deleteGameFolder,
  switchBucketGameFolder,
} from "../services/uploadGameZip";
import { IntSchema, PasswordSchema, TagSchema } from "../types/zparams";
import { ALL_NAVPATH, MINIO_BUCKETS } from "../clientConfig";
import { deleteImageFolder } from "../services/uploadImage";
import { AddUserServerSchema, UserAdminEditServerSchema } from "../types/zforms";
import { DEFAULT_HASH_KEY, getConfigurationValue, SALT_ROUNDS, setConfigurationValue } from "../serverConfig";
import bcrypt from "bcryptjs";

export const approveGameAction = buildServerAction(
  [IntSchema],
  async (gameId: number) => {
    // 1. check user is admin, game is private
    await authProtectedModule(true);
    const game = await db.game.findUnique({
      where: { id: gameId, isPrivate: true },
      select: { id: true, isPrivate: true },
    });

    if (!game || !game.isPrivate) throw Error("所选游戏不存在或已经审核");

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
);

export const deleteGameAction = buildServerAction(
  [IntSchema],
  async (gameId: number) => {
    // 1. check user is admin
    await authProtectedModule(true);

    // 2. find game
    const game = await db.game.findUnique({
      where: { id: gameId, isPrivate: undefined },
      select: { id: true, title: true, isPrivate: true },
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
    revalidatePath(
      game.isPrivate
        ? ALL_NAVPATH.admin_review.href
        : ALL_NAVPATH.admin_games.href
    );
    console.log(`Game deleted: ${game.title} (ID: ${game.id})`);
  }
);

// WARNING: should not delete tag, only decide whether to let it becomes options when uploading game.
export const deleteTagAction = buildServerAction(
  [IntSchema],
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

export const changeTagNameAction = buildServerAction(
  [IntSchema, TagSchema],
  async (tagId: number, tagName: string) => {
    // 1. check user is admin
    await authProtectedModule(true);

    // 2. check tag exists
    const tag = await db.tag.findUnique({
      where: { id: tagId },
    });
    if (!tag) throw Error("所改标签不存在");

    // 3. update tag name
    await db.tag.update({
      where: { id: tagId },
      data: { name: tagName },
    });

    // 4. revalidate admin tag list page
    revalidatePath(ALL_NAVPATH.admin_tags.href);
    revalidatePath(ALL_NAVPATH.upload.href);
    revalidatePath(ALL_NAVPATH.home.href());
  }
);

export const addTagAction = buildServerAction(
  [TagSchema],
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
    revalidatePath(ALL_NAVPATH.home.href());

    return newTag;
  }
);

export const addUsersAction = buildServerAction(
  [AddUserServerSchema],
  async (data) => {
    
    // 1. check user is admin
    await authProtectedModule(true);

    // 2. Find which users already exist based on their QQ number
    const incomingQQs = data.map((user) => user.qq);
    const existingUsers = await db.user.findMany({
      where: {
        qq: { in: incomingQQs },
      },
      select: { qq: true },
    });
    const existingQQs = new Set(existingUsers.map((user) => user.qq));

    // 3. Filter out the users that already exist
    const usersToCreate = data.filter((user) => !existingQQs.has(user.qq));

    // 4. prepared default hash for new users
    const hash = await getConfigurationValue(DEFAULT_HASH_KEY);
    
    // 5. create new users in a batch, if any
    if (usersToCreate.length > 0) {
      await db.user.createMany({
        data: usersToCreate.map((user) => ({
          ...user,
          hash,
        })),
      });
    }

    // 6. revalidate admin user list page
    revalidatePath(ALL_NAVPATH.admin_users.href);
    revalidatePath(ALL_NAVPATH.community.href);

    return usersToCreate.length;
  }
);

export const editUserAction = buildServerAction([UserAdminEditServerSchema],
  async (data)=> {
    // 1. check user is admin
    await authProtectedModule(true);
    // 2. validate: prevent qq duplication
    const existingUser = await db.user.findUnique({
      where: { qq: data.qq },
      select: { id:true, name: true },
    });
    if (existingUser && existingUser.id !== data.id) throw Error(`QQ 号 ${data.qq} 已被用户 ${existingUser.name} 使用。`);
    
    // 3. deal with passwordReset
    let hash: string | undefined;
    if (data.resetPassword) {
      hash = await getConfigurationValue(DEFAULT_HASH_KEY);
    }

    // 4. update user
    await db.user.update({
      where: { id: data.id },
      data: {
        qq: data.qq,
        hash, // only update if hash is defined
        isAdmin: data.isAdmin,
      },
    });

    // 5. revalidate admin user list page
    revalidatePath(ALL_NAVPATH.admin_users.href);
    revalidatePath(ALL_NAVPATH.user_id.href(data.id));
  }
);

export const deleteUserAction = buildServerAction(
  [IntSchema],
  async (userId: number) => {
    // 1. check user is admin
    await authProtectedModule(true);

    // 2. find user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, qq: true, name: true },
    });
    if (!user) throw Error("所删用户不存在");

    // 3. delete user
    await db.user.delete({
      where: { id: userId },
    });

    // 4. revalidate admin user list page
    revalidatePath(ALL_NAVPATH.admin_users.href);
    revalidatePath(ALL_NAVPATH.community.href);
    // if we use optimize static generatin, need to revalidate even game page too.
  }
);

export const setDefaultPasswordAction = buildServerAction(
  [PasswordSchema],
  async (password) => {
    // 1. check whether user is admin
    await authProtectedModule(true);
    // 2. set default password
    const defaultHash = await bcrypt.hash(password, SALT_ROUNDS);
    await setConfigurationValue(DEFAULT_HASH_KEY, defaultHash);
  }
);