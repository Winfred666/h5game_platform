"use server";

import { db } from "../dbInit";
import { authProtectedModule, buildServerAction } from "../services/builder";
import {
  deleteGameFolder,
  switchBucketGameFolder,
} from "../services/uploadGameZip";
import {
  BooleanSchema,
  IDArrayStringSchema,
  IDSchema,
  PasswordSchema,
  StringSchema,
  SwitcherStringSchema,
  TagSchema,
} from "../types/zparams";
import { ALL_NAVPATH, MINIO_BUCKETS } from "../clientConfig";
import { deleteImage, deleteImageFolder, uploadImageFromWebURL } from "../services/uploadImage";
import {
  AddUserServerSchema,
  UserAdminEditServerSchema,
} from "../types/zforms";
import {
  DEFAULT_HASH_KEY,
  ENABLE_DAILY_RECOMMENDATION_KEY,
  getConfigurationValue,
  SALT_ROUNDS,
  setConfigurationValue,
  SWIPER_ID_KEY,
} from "../serverConfig";
import bcrypt from "bcryptjs";
import {
  revalidateAsGameChange,
  revalidateAsTagChange,
  revalidateAsUserChange,
} from "../services/revalidate";
import {
  startAutoTopGamesCalc,
  stopAutoTopGamesCalc,
} from "../services/dailyTopGame";
import { revalidatePath } from "next/cache";

const adminSelectOption = {
  id: true,
  isPrivate: true,
  title: true,
  developers: { select: { id: true } },
};

export const approveGameAction = buildServerAction(
  [IDSchema, BooleanSchema],
  async (gameId, goingToApprove) => {
    // 1. check user is admin, game is private
    await authProtectedModule(true);
    const game = await db.game.findUnique({
      where: { id: gameId, isPrivate: undefined },
      select: adminSelectOption,
    });

    if (
      !game ||
      (!game.isPrivate && goingToApprove) ||
      (game.isPrivate && !goingToApprove)
    )
      throw Error(`所选游戏不存在或${goingToApprove ? "已审核" : "尚未审核"}`);

    // 2. switch game from UNAUDIT bucket to GAME bucket or from GAME to UNAUDIT
    await switchBucketGameFolder(game);

    // 3. update game isPrivate to false
    await db.game.update({
      where: { id: gameId },
      data: { isPrivate: !game.isPrivate },
    });

    // 4. revalidate admin game list page
    revalidateAsGameChange({ id: gameId, isPrivate: true, developers: [] });
    revalidateAsGameChange({
      id: gameId,
      isPrivate: false,
      developers: game.developers,
    });
  }
);

export const setAutoTopGameAction = buildServerAction(
  [SwitcherStringSchema],
  async (enabler) => {
    await setConfigurationValue(ENABLE_DAILY_RECOMMENDATION_KEY, enabler);
    if (enabler === "0") {
      stopAutoTopGamesCalc();
    } else {
      await startAutoTopGamesCalc();
    }
    revalidatePath(ALL_NAVPATH.admin_games.href);
  }
);

export const updateTopGameAction = buildServerAction(
  [IDArrayStringSchema],
  async (gameIds) => {
    await setConfigurationValue(SWIPER_ID_KEY, gameIds);
    revalidatePath(ALL_NAVPATH.admin_games.href);
    revalidatePath(ALL_NAVPATH.home.href());
  }
);

export const deleteGameAction = buildServerAction(
  [IDSchema],
  async (gameId) => {
    // 1. check user is admin
    await authProtectedModule(true);

    // 2. find game
    const game = await db.game.findUnique({
      where: { id: gameId, isPrivate: undefined },
      select: adminSelectOption,
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
    revalidateAsGameChange(game);
    // console.log(`Game deleted: ${game.title} (ID: ${game.id})`);
  }
);

// WARNING: should not delete tag, only decide whether to let it becomes options when uploading game.
export const deleteTagAction = buildServerAction([IDSchema], async (tagId) => {
  // 1. check user is admin
  await authProtectedModule(true);
  // 1.5 get games using this tag (for revalidation)
  const tagWithGames = await db.tag.findUnique({
    where: { id: tagId },
    include: { games: { select: { id: true, isPrivate: true } } },
  });
  // 2. delete tag
  const tag = await db.tag.deleteMany({
    where: { id: tagId },
  });
  if (tag.count === 0) throw Error("所删标签不存在");
  // 3. revalidate admin tag list page
  revalidateAsTagChange(tagWithGames?.games || []);
});

export const changeTagAction = buildServerAction(
  [IDSchema, TagSchema],
  async (tagId, { name: newName, hide: newHide }) => {
    // 1. check user is admin
    await authProtectedModule(true);

    // 2. check tag exists
    const oldTag = await db.tag.findUnique({
      where: { id: tagId },
      include: { games: { select: { id: true, isPrivate: true } } }, // need games for merging tags
    });

    if (!oldTag) throw Error("所改标签不存在");

    // 3. if the name is repeated, then merge the two tags.
    const existingTag = await db.tag.findUnique({
      where: { name: newName },
    });
    const shouldMerge = existingTag && existingTag.id !== tagId;
    if (shouldMerge) {
      // 3.1 merge tags to the existing one
      if (oldTag.games.length > 0)
        await db.tag.update({
          where: { id: existingTag.id },
          data: {
            games: {
              connect: oldTag.games.map((game) => ({ id: game.id })),
            },
          },
        });
      // 3.2 delete the old tag
      await db.tag.delete({
        where: { id: tagId },
      });
    } else {
      // 4. just update tag's name and hide state if not merged
      await db.tag.update({
        where: { id: tagId },
        data: {
          name: newName,
          hide: newHide,
        },
      });
    }

    // 5. revalidate admin tag list page
    revalidateAsTagChange(oldTag.name !== newName ? oldTag.games : []);
    return `${shouldMerge ? "合并" : "修改"}标签成功！`;
  }
);

export const addTagAction = buildServerAction(
  [StringSchema],
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
    revalidateAsTagChange();
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

    // 3. prepared default hash for new users
    const hash = await getConfigurationValue(DEFAULT_HASH_KEY);

    // 4. Filter out the users that already exist, add avatar and hash
    const usersToCreate = data
      .filter((user) => !existingQQs.has(user.qq))
      .map((user) => ({
        qq: user.qq,
        name: user.name,
        isAdmin: user.isAdmin,
        hasAvatar: !!user.avatar,
        hash,
      }));

    // 5. create new users in a batch
    if (usersToCreate.length > 0) {
      await db.user.createMany({
        data: usersToCreate,
      });
    }

    // 6. if has avatar url, download and store it according to user's id,
    const addedAvatarIds = await db.user.findMany({
      where: {
        qq: { in: usersToCreate.map((user) => user.qq) },
        hasAvatar: true,
      },
      select: { id: true, qq: true },
    });

    for (const user of addedAvatarIds) {
      const url = data.find(u => u.qq === user.qq)?.avatar || "";
      console.log(`Uploading avatar for user ${user.qq} (ID: ${user.id}) from URL: ${url}`);
      await uploadImageFromWebURL(MINIO_BUCKETS.AVATAR, `${user.id}.webp`,
        url, false);
    }

    // 7. revalidate admin user list page
    revalidateAsUserChange();
    return usersToCreate.length;
  }
);

export const editUserAction = buildServerAction(
  [UserAdminEditServerSchema],
  async (data) => {
    // 1. check user is admin
    await authProtectedModule(true);
    // 2. validate: prevent qq duplication
    const existingUser = await db.user.findUnique({
      where: { qq: data.qq },
      select: { id: true, name: true },
    });
    if (existingUser && existingUser.id !== data.id)
      throw Error(`QQ 号 ${data.qq} 已被用户 ${existingUser.name} 使用。`);

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
    revalidateAsUserChange();
  }
);

export const deleteUserAction = buildServerAction(
  [IDSchema],
  async (userId) => {
    // 1. check user is admin
    await authProtectedModule(true);

    // 2. find user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        qq: true,
        name: true,
        games: { select: { id: true, isPrivate: true } },
      },
    });
    if (!user) throw Error("所删用户不存在");

    // 3. delete user
    await db.user.delete({
      where: { id: userId },
    });

    // also delete user's avatar
    await deleteImage(MINIO_BUCKETS.AVATAR, `${userId}.webp`);

    // 4. revalidate admin user list page
    revalidateAsUserChange(userId, user.games);
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
