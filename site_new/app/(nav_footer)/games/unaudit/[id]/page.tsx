import { getSelfGameById } from "@/lib/querys&actions/getGame";
import DevBanner from "./DevBanner";
import { GameIdPage } from "../../[id]/page";

export default async function UnauditGameIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getSelfGameById(id);
  return (
    <>
      <DevBanner gameId={game.id} isPrivate={game.isPrivate} />
      <GameIdPage game={game} />
    </>
  );
}
