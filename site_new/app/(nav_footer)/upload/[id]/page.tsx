import { getSelfGameById } from "@/lib/querys&actions/getGame";
import { getAllTags } from "@/lib/querys&actions/getTag";
import GameForm from "../GameForm";
import { notFound } from "next/navigation";

export default async function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // await the promise to get id
  const allTags = await getAllTags();
  const game = await getSelfGameById(id);
  if (!game) notFound();
  if (game.isPrivate === undefined) return (
    <div className=" my-4">
      您不是作者或管理员，没有权限修改此游戏。
    </div>
  )
  // special authentication: only admin and developer can update game
  return (
    <>
      <h2 className="my-4"> 修改游戏 </h2>
      <div className="flex flex-col lg:flex-row w-full justify-between">
      <GameForm game={game} allTags={allTags} />
      </div>
    </>
  );
}
