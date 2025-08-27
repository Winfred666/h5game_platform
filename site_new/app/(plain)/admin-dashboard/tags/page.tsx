import { getAllTagsAdmin } from "@/lib/querys&actions/getTag";
import TagsManagerTab from "./TagsManagerTab";

export default async function AdminReviewPage() {
  const tags = await getAllTagsAdmin();
  return (
    <TagsManagerTab tags={tags} />
  )
}