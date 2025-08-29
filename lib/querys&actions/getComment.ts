// TODO: comment zone is still a non core module, left unfinished.

// import "server-only";
// import { buildServerQuery } from "../services/builder";
// import { IDSchema } from "../types/zparams";
// import { db } from "../dbInit";

// const SelectUserGame = {
//   include: {
//     user: {
//       select: { id: true, name: true, avatar: true },
//     },
//     game: {
//       select: { id: true, title: true },
//     },
//   },
// };

// export const getCommentByGame = buildServerQuery(
//   [IDSchema],
//   async (gameId) => {
//     return db.comment.findMany({
//       where: { gameId },
//       orderBy: { createdAt: "desc" },
//       ...SelectUserGame
//     });
//   }
// );

// export const getCommentByUser = buildServerQuery(
//   [IDSchema],
//   async (userId) => {
//     return db.comment.findMany({
//       where: { userId },
//       orderBy: { createdAt: "desc" },
//       ...SelectUserGame
//     });
//   }
// );
