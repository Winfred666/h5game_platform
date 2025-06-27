import { Prisma } from "@prisma/client";
import {
  byteToMB,
  genGameCoverURL,
  genGameDownloadURL,
  genGamePlayableURL,
  genGameScreenshotsURL,
} from "./utils";


export const GameExtension = Prisma.defineExtension({
  query: {
    // WARNING: do not use allOperations as it is execute before "result"!!!
    // async $allOperations({ operation, model, args, query }) {
    //   const result = await query(args);
    //   return JSON.parse(JSON.stringify(result, customReplacer));
    // },d
    game: {
      async findMany({ args, query }) {
        return query({
          ...args,
          orderBy: {
            createdAt: "desc", // order by creation time
            ...args.orderBy, // keep other orderBy clauses
          },
          where: {
            isPrivate: false, // only return public games for safety
            ...args.where,
          },
        });
      },
      async count({ args, query }) {
        return query({
          ...args,
          where: {
            isPrivate: false, // only count public games for safety
            ...args.where,
          },
        });
      },
    },
  },

  result: {
    // here is the post-processing of game result
    game: {
      online: {
        needs: { id: true, isOnline: true, width: true, height: true },
        compute({ id, isOnline, width, height }) {
          if (isOnline) return undefined; // online game does not need this
          if (!width || !height) {
            return {
              url: genGamePlayableURL(id),
            };
          }
          return {
            url: genGamePlayableURL(id),
            width,
            height,
          };
        },
      },
      // createdAt: { // later done at $allOperations
      //   // Date is not pure JSON type, so we need to convert it to string.
      //   needs: { createdAt: true },
      //   compute: ({ createdAt }) => dateToLocaleString(createdAt),
      // },
      // updatedAt: {
      //   needs: { updatedAt: true },
      //   compute: ({ updatedAt }) => dateToLocaleString(updatedAt),
      // },
      size: {
        needs: { size: true },
        compute: ({ size }) => byteToMB(size), // 转换为MB并保留两位小数
      },
      coverImage: {
        needs: { id: true },
        compute: ({ id }) => genGameCoverURL(id),
      },
      screenshots: {
        needs: { id: true, screenshotCount: true },
        compute: ({ id, screenshotCount }) =>
          genGameScreenshotsURL(id, screenshotCount),
      },
      downloadUrl: {
        needs: { id: true },
        compute: ({ id }) => genGameDownloadURL(id),
      },
    },
  },
});
