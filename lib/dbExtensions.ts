import "server-only";

import { Prisma } from "@prisma/client";
import { byteToMB } from "./utils";

import {
  genGameCoverURL,
  genGameDownloadURL,
  genGamePlayableURL,
  genGameScreenshotsURL,
  genUserAvatarURL,
} from "./clientConfig";

export const GameExtension = Prisma.defineExtension({
  query: {
    // WARNING: do not use allOperations as it is execute manually by calling convertToPlainObj !!!
    // async $allOperations({ operation, model, args, query }) {
    //   const result = await query(args);
    //   return JSON.parse(JSON.stringify(result, customReplacer));
    // },
    game: {
      async findMany({ args, query }) {
        return query({
          ...args,
          orderBy: {
            updatedAt: "desc", // order by updated time
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
        needs: {
          id: true,
          isPrivate: true,
          assetsType: true,
        },
        compute({ id, isPrivate, assetsType }) {
          const attrs = assetsType.split("|");
          switch (attrs[0]) {
            case "jump":
              return {
                mode: "jump" as const,
                url: attrs[1],
              };
            case "fullscreen": {
              const useSharedArrayBuffer = attrs[1] === "1";
              return {
                mode: "fullscreen" as const,
                url: genGamePlayableURL(id, isPrivate, useSharedArrayBuffer),
                useSharedArrayBuffer,
              };
            }
            case "embed": {
              const width = parseInt(attrs[1]);
              const height = parseInt(attrs[2]);
              const useSharedArrayBuffer = attrs[3] === "1";
              const isAutoStarted = attrs[4] === "1";
              const hasFullscreenButton = attrs[5] === "1";
              const enableScrollbars = attrs[6] === "1";
              return {
                mode: "embed" as const,
                width,
                height,
                url: genGamePlayableURL(id, isPrivate, useSharedArrayBuffer),
                useSharedArrayBuffer,
                isAutoStarted,
                hasFullscreenButton,
                enableScrollbars,
              };
            }
            default:
              return undefined;
          }
        },
      },
      downloadUrl: {
        needs: { id: true, isPrivate: true, assetsType: true },
        compute: ({ id, isPrivate, assetsType }) => assetsType.split("|")[0] !== "jump" ?genGameDownloadURL(id, isPrivate) : "",
      },
      
      // do not expose raw assetsType to client
      assetsType: {
        needs: {},
        compute: () => undefined,
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

      // is private is protected by omit.
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
    },
  },
});

export const UserExtension = Prisma.defineExtension({
  query: {
    user: {
      async findMany({ args, query }) {
        return query({
          ...args,
          orderBy: {
            createdAt: "desc", // order by creation time
            ...args.orderBy, // keep other orderBy clauses
          },
        });
      },
    },
  },
  result: {
    user: {
      contacts: {
        needs: { contacts: true },
        compute: ({ contacts }) => {
          if (!contacts) return [];
          return contacts.split(",").map((contact) => {
            const [way, content] = contact.split(":");
            return { way, content };
          });
        },
      },
      avatar: {
        needs: { hasAvatar: true, id: true },
        compute: ({ hasAvatar, id }) =>
          hasAvatar ? genUserAvatarURL(id) : undefined,
      },
      hasAvatar: {
        needs: {},
        compute: () => undefined,
      },
    },
  },
});

export const TagExtension = Prisma.defineExtension({
  query: {
    tag: {
      async findMany({ args, query }) {
        return query({
          ...args,
          where: {
            hide: false, // only return visible tags
            ...args.where,
          },
        });
      },
    },
  },
});
