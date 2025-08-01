import { getAllTags } from "@/lib/querys&actions/getTag";
import TagsManagerTab from "./TagsManagerTab";

export default async function AdminReviewPage() {
  const tags = await getAllTags();
  return (
    <TagsManagerTab tags={tags} />
  )
}