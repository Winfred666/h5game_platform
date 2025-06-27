import { getAllTags } from "@/lib/services/getGame";
import GameForm from "./GameForm";

export default async function UploadPage() {
  const allTags = await getAllTags();
  return (
    <div className="my-4 mx-8 p-4 rounded-lg bg-card border">
      <h2 className="my-4"> 上传新游戏 </h2>
      <div className="flex w-full justify-between">
      <GameForm allTags={allTags} />
      </div>
    </div>
  );
}
