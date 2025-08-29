import "server-only";
import { revalidatePath } from "next/cache";
import { ALL_NAVPATH } from "../clientConfig";

// revalidate admin_page is used for client mutate on the fly.
// while revalidate tourist home/gameId page is for ISR.

export async function revalidateAsGameChange(game: {
  id: string;
  isPrivate: boolean;
  developers: { id: string }[];
}) {
  if (game) {
    if (game.isPrivate) {
      revalidatePath(ALL_NAVPATH.admin_review.href);
      // unaudit is always dynamic, needless to revalidate.
      // revalidatePath(ALL_NAVPATH.game_id_unaudit.href(game.id));
    } else {
      revalidatePath(ALL_NAVPATH.home.href());
      revalidatePath(ALL_NAVPATH.game_id.href(game.id));
      revalidatePath(ALL_NAVPATH.admin_games.href);
    }

    // Revalidate each developer's user page
    game.developers.forEach((dev) => {
      revalidatePath(ALL_NAVPATH.user_id.href(dev.id));
    });
  }
}

// WARNING: only change game / home page, if user change name !!!
export async function revalidateAsUserChange(
  userId?: string,
  userGames?: { id: string; isPrivate: boolean }[]
) {
  if (userId) {
    revalidatePath(ALL_NAVPATH.user_id.href(userId));
    // Revalidate games where this user is a developer
    if (userGames) {
      revalidatePath(ALL_NAVPATH.home.href());
      userGames.forEach((game) => {
        if (game.isPrivate) {
          revalidatePath(ALL_NAVPATH.game_id_unaudit.href(game.id));
        } else {
          revalidatePath(ALL_NAVPATH.game_id.href(game.id));
        }
      });
    }
  }
  revalidatePath(ALL_NAVPATH.admin_users.href);
  revalidatePath(ALL_NAVPATH.community.href);
}

// need to change all game using this tag..
export function revalidateAsTagChange(
  games: { id: string; isPrivate: boolean }[] = []
) {
  revalidatePath(ALL_NAVPATH.admin_tags.href);
  revalidatePath(ALL_NAVPATH.upload.href);
  if (games.length !== 0) {
    revalidatePath(ALL_NAVPATH.home.href());
    games.forEach(game => {
      revalidateAsGameChange({
        id: game.id,
        isPrivate: game.isPrivate,
        developers: [],
      });
    });
  }
}

export function revalidateAsCommentChange(gameId:string, userId:string){
  // just revalidate for both game and user display page.
  revalidatePath(ALL_NAVPATH.game_id.href(gameId));
  revalidatePath(ALL_NAVPATH.user_id.href(userId));
}