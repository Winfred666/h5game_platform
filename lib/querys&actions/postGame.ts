"use server";

import JSZip from "jszip";
import { db } from "../dbInit";
import { MINIO_BUCKETS } from "../clientConfig";
import { authProtectedModule, buildServerAction } from "../services/builder";
import {
  checkZipHasIndexHtml,
  deleteGameFolder,
  uploadGameFolder,
} from "../services/uploadGameZip";

import {
  deleteImageFolder,
  renameImage,
  uploadImage,
} from "../services/uploadImage";
// with this mark every function exported will be server action (for mutate)
// define server actions here, directly use prisma-client to fetch data from sqlite
import {
  GameFormServerSchema,
  IncreGameFormServerSchema,
} from "../types/zforms";
import { IDSchema } from "../types/zparams";
import { revalidateAsGameChange } from "../services/revalidate";
import { authDeveloperofGameOrAdmin } from "../services/authDeveloper";

const validateGameContent = async (
  data: {
    title: string;
    isOnline: boolean;
    uploadfile: File[];
  },
  curGameId?: string
) => {
  // 3.1 check game title unique, include isPrivate games.
  const existingGame = await db.game.findFirst({
    where: { title: data.title, isPrivate: undefined },
  });
  if (existingGame && (!curGameId || existingGame.id !== curGameId)) {
    throw new Error("游戏标题已存在，请选择另一个。");
  }
  // 3.2 check index.html before any db insertion.
  let zip: JSZip | undefined;
  if (data.uploadfile.length > 0 && data.isOnline) {
    zip = await checkZipHasIndexHtml(data.uploadfile[0]);
    if (!zip) {
      throw new Error("对于在线游戏，ZIP在根目录不包含“index.html”。");
    }
  }
  return zip;
};

// WARNING: Files-first, db last allow us to upload files before inserting game metadata; MinIO naturally replaces objects with same name
export const submitNewGameAction = buildServerAction(
  [GameFormServerSchema],
  async (data) => {
    // 1. Auth users
    const userSession = await authProtectedModule(false); // false means this action do not need admin privilege

    // 2. add user id to data.developers if not in array
    if (!data.developers.some((dev) => dev.id === userSession.id)) {
      data.developers.push({ id: userSession.id });
    }

    // 3. validate game info, zip is optional, only get when online
    const zip = await validateGameContent(data);

    // 4. split files from data
    const dataWithoutFiles = {
      ...data,
      developers: {
        connect: data.developers,
      },
      tags: {
        connect: data.tags,
      },
      uploadfile: undefined,
      cover: undefined,
      screenshots: undefined,
      screenshotCount: data.screenshots.add.length,
      size: data.uploadfile[0].size,
    };

    // 5. insert game metadata to database to get game id
    const game = await db.game.create({
      data: {
        ...dataWithoutFiles,
        isPrivate: true, // default to private, need admin to publish
      },
    });

    try {
      // 6. upload game zip and image files to MinIO

      // upload game file to minio (minio may be uninit, wait for it first)
      await uploadGameFolder(
        { id: game.id, isPrivate: true },
        data.uploadfile[0],
        zip
      );

      // upload screenshots to minio
      const promiseList = data.screenshots.add.map(
        (screenshot: File, i: number) =>
          uploadImage(
            MINIO_BUCKETS.IMAGE,
            `${game.id}/screenshot${i}.webp`,
            screenshot
          )
      );

      // upload cover to minio
      promiseList.push(
        uploadImage(MINIO_BUCKETS.IMAGE, `${game.id}/cover.webp`, data.cover[0])
      );
      await Promise.all(promiseList);
      
    } catch (error) {
      // clean up game metadata if file upload failed
      await db.game.delete({ where: { id: game.id } });
      // also clean up game folder + image folder in MinIO
      await deleteGameFolder(game);
      await deleteImageFolder(MINIO_BUCKETS.IMAGE, `${game.id}/`);
      console.error("上传游戏文件失败，已删除游戏元数据：", error);
      throw error;
    }
    return game.id;
  }
);

export const updateGameAction = buildServerAction(
  [IDSchema, IncreGameFormServerSchema],
  async (gameId, data) => {
    // 1,2 get old game, auth user as admin or this game developer
    const { oldGame } = await authDeveloperofGameOrAdmin(gameId);
    // 3. validate game info.
    const zip = await validateGameContent(data, gameId);

    // 4. upload game zip and image files if needed to MinIO
    const updatePromiseList = [];

    // upload game file to minio
    if (data.uploadfile.length !== 0) {
      updatePromiseList.push(
        deleteGameFolder(oldGame).then(() =>
          uploadGameFolder(oldGame, data.uploadfile[0], zip)
        )
      );
    }

    // upload cover to minio
    if (data.cover.length !== 0) {
      updatePromiseList.push(
        uploadImage(MINIO_BUCKETS.IMAGE, `${gameId}/cover.webp`, data.cover[0])
      );
    }

    // upload screenshots, rename should done serially to avoid race condition

    let remainScreenshotIdx = 0;
    for (let i = 0; i < oldGame.screenshotCount; i++) {
      if (!data.screenshots.delete.includes(i)) {
        if (i !== remainScreenshotIdx) {
          // lazy delete, only rename
          await renameImage(
            MINIO_BUCKETS.IMAGE,
            `${gameId}/screenshot${i}.webp`,
            `${gameId}/screenshot${remainScreenshotIdx}.webp`
          );
        }
        remainScreenshotIdx++;
      }
    }

    // add new screenshots
    updatePromiseList.push(
      ...data.screenshots.add.map((screenshot: File) =>
        uploadImage(
          MINIO_BUCKETS.IMAGE,
          `${gameId}/screenshot${remainScreenshotIdx++}.webp`,
          screenshot
        )
      )
    );
    await Promise.all(updatePromiseList);

    // 5. split files from data, update data if needed.
    const dataWithoutFiles = {
      ...data,
      developers: {
        set: data.developers,
      },
      tags: {
        set: data.tags,
      },
      uploadfile: undefined,
      cover: undefined,
      screenshots: undefined,
      screenshotCount:
        oldGame.screenshotCount -
        data.screenshots.delete.length +
        data.screenshots.add.length,
      size: data.uploadfile.length > 0 ? data.uploadfile[0].size : undefined,
    };

    // 6. update game metadata in database
    // (could parallel with minio file update because id unchanged)
    await db.game.update({
      where: { id: gameId },
      data: {
        ...dataWithoutFiles,
      },
    });

    // need revalidate game page, and the affected developer(newly added or removed)
    const developers = [
      ...oldGame.developers.filter(
        (dev) => !data.developers.some((d) => d.id === dev.id)
      ),
      ...data.developers.filter(
        (dev) => !oldGame.developers.some((d) => d.id === dev.id)
      ),
    ];

    revalidateAsGameChange({
      id: gameId,
      isPrivate: oldGame.isPrivate,
      developers,
    });
    return gameId;
  }
);
