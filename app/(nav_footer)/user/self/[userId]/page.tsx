import { getSelfUserById } from "@/lib/querys&actions/getUser";
import { UserPage } from "../../[userId]/page";

// WARNING: this is the auth protected page.

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getSelfUserById(userId); // auto handle 404
  const unauditGames = user.games.filter((game) => game.isPrivate);
  user.games = user.games.filter((game) => !game.isPrivate);
  return <UserPage user={user} isMe={user.isMe} isAdmin={user.isAdmin} unauditGames={unauditGames} />;
}
