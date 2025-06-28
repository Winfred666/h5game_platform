import { getAllTags } from "@/lib/services/getGame";
import GameForm from "./GameForm";

export default async function UploadPage() {
  const allTags = await getAllTags();
  return (
    <>
      <h2 className="my-4"> 上传新游戏 </h2>
      <div className="flex w-full justify-between">
      <GameForm allTags={allTags} />
      </div>
    </>
  );
}
