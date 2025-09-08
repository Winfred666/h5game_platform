"use server";
import { db } from "../dbInit";
import { authProtectedModule, buildServerAction } from "../services/builder";
import { UserUpdateFormServerSchema } from "../types/zformServer";
import bcrypt from "bcryptjs";
import { MINIO_BUCKETS } from "../clientConfig";
import { SALT_ROUNDS } from "../serverConfig";
import { uploadImage } from "../services/uploadImage";
import { revalidateAsUserChange } from "../services/revalidate";

export const selfUpdateUserAction = buildServerAction(
  [UserUpdateFormServerSchema],
  async (data) => {
    // 1. authenticate the user
    const sessionUser = await authProtectedModule(false);

    // 2. only when user is logged in, we encrypt password(rsc consuming)
    const hash = data.password
      ? await bcrypt.hash(data.password, SALT_ROUNDS)
      : undefined;
    const dataWithoutFile = {
      ...data,
      avatar: undefined,
      password: undefined,
      hash,
    };

    // 3. store avatar in the database
    if (data.avatar.length > 0)
      await uploadImage(
        MINIO_BUCKETS.AVATAR,
        `${sessionUser.id}.webp`,
        data.avatar[0]
      );

    // 4. update user information in the database
    await db.user.update({
      where: {
        id: sessionUser.id,
      },
      data: dataWithoutFile,
    });

    let changedUserGames = undefined;

    if ( sessionUser.name !== data.name ){
      changedUserGames = (await db.user.findUnique({
        where: { id: sessionUser.id },
        select: {
          games: {
            select: { id: true, isPrivate: true },
          },
        }
      }))?.games ?? undefined;
    }

    // 5. revalidate the path to refresh the user data
    // no change to name, so no need to revalidate game/home page.
    revalidateAsUserChange(sessionUser.id, changedUserGames);
    // 6. need client to update the session (authSQL jwt() callback with 'update' trigger).
    return sessionUser.id;
  }
);
