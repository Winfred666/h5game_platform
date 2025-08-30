import { getAllTags } from "@/lib/querys&actions/getTag";
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

// WARNING: this is static page, only revalidate when tag changed.
// if static page being 404 at first, it is db's error because at build time we might not have proper ENV.
export const dynamic = "force-static";