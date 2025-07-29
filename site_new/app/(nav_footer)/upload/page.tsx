import { getAllTags } from "@/lib/actions/getGame";
import GameForm from "./GameForm";

export default async function UploadPage() {
  const allTags = await getAllTags();
  return (
    <>
      <h2 className="my-4"> 上传新游戏 </h2>
      <div className="flex flex-col lg:flex-row w-full justify-between">
      <GameForm allTags={allTags} />
      </div>
    </>
  );
}
