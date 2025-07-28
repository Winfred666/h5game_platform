"use server";
import { db } from "../dbInit";
import { MINIO_BUCKETS } from "../serverConfig";
import { authModule, buildServerAction } from "../services/builder";
import { uploadGameZip } from "../services/uploadGameZip";
import { uploadImage } from "../services/uploadImage";
// with this mark every function exported will be server action (for mutate)
// define server actions here, directly use prisma-client to fetch data from sqlite
import { GameFormServerSchema } from "../types/zforms";

// need game id , so must latent
const processGameFile = async (gameFiles: any, gameId: number) => {
  const { uploadfile, cover, screenshots } = gameFiles;
  // upload cover image to minio
  const promiseList = screenshots.map((screenshot: File, i: number) =>
    uploadImage(
      MINIO_BUCKETS.IMAGE,
      `${gameId}/screenshot${i}.webp`,
      screenshot
    )
  );
  // upload game file to minio
  promiseList.push(uploadGameZip(uploadfile, gameId));
  promiseList.push(
    uploadImage(MINIO_BUCKETS.IMAGE, `${gameId}/cover.webp`, cover)
  );
  // upload screenshot images to minio
  await Promise.all(promiseList);
};

export const submitNewGameAction = buildServerAction(
  [GameFormServerSchema],
  async (data) => {
    console.log(data.cover);
    const userSession = await authModule(false); // false means this action do not need admin privilege
    // add user id to data.developers if not in array
    if (!data.developers.connect.some((dev) => dev.id === userSession.id)) {
      data.developers.connect.push({ id: userSession.id });
    }
    // process game file first
    const dataWithoutFiles = {
      ...data,
      uploadfile: undefined,
      cover: undefined,
      screenshots: undefined,
    };
    const gameFiles = {
      uploadfile: data.uploadfile[0],
      cover: data.cover[0],
      screenshots: data.screenshots.add,
    };
    // insert game metadata to database
    const newGame = await db.game.create({
      data: {
        ...dataWithoutFiles,
        isPrivate: true, // default to private, need admin to publish
      },
    });
    processGameFile(gameFiles, newGame.id);
    return newGame.id;
  }
);
