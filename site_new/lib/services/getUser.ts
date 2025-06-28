// getUser should wrap in cache for frequently auth

import { db } from "../dbInit";
import { IUser } from "../types/iuser";
import { IntSchema, StringSchema } from "../types/zparams";
import { convertToPlainObj, processClientWorkload } from "../utils";

const IncludeGames = {
  include:{
    games: {
      select:{
        id: true,
        title: true,
        coverImage: true,
      }
    }
  }
}

export const getUserById = async(_userId: unknown): Promise<IUser> => {
  const userId:number = processClientWorkload(_userId, IntSchema);
  return db.user.findUnique({
    where: { id: userId },
    ...IncludeGames
  }).then(convertToPlainObj);
}

// only used for search, not include user_game.
export const getUsersByNameOrQQ = async(_name_qq: unknown): Promise<(Omit<IUser,"games">)[]> => {
  const name_qq:string = processClientWorkload(_name_qq, StringSchema);
  return db.user.findMany({
    where: {
      OR: [
        { name: { contains: name_qq } },
        { qq: { contains: name_qq } }
      ]
    },
    take: 10 // Limit to 10 results
  }).then(convertToPlainObj);
}
