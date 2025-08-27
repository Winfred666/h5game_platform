// TODO: comment zone is still a non core module, left unfinished.

// "use server";

// import { db } from "../dbInit";
// import { authProtectedModule, buildServerAction } from "../services/builder";
// import { revalidateAsCommentChange } from "../services/revalidate";
// import { IDSchema } from "../types/zparams";

// export const deleteComment = buildServerAction(
//   [IDSchema],
//   async (commentId) => {
//     // must be the publisher or admin
//     const userSession = await authProtectedModule(false);
//     const comment = await db.comment.findUnique({
//       where: { id: commentId },
//       select: {userId:true, gameId: true}
//     });
//     if (!comment) throw new Error("所删评论不存在");
//     if (!userSession.isAdmin && userSession.id !== comment.userId) {
//       throw new Error("无权删除该评论");
//     }
//     db.comment.delete({
//       where: { id: commentId },
//     });
//     revalidateAsCommentChange(comment.gameId, comment.userId);
//   }
// );
