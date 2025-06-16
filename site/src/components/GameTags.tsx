"use client"
import { IGameTag } from "@/types/igame";
import Chip from "@mui/material/Chip";
import { ALL_NAVPATH } from "@/services/router_info";
import { useRouter } from "next/navigation";

export default function GameTags({
  id, // because in one page there could be multiple gameTags components, need to distinguish them by id
  tags,
  color = "primary",
  size = "medium",
}: {
  id?: string | number;
  tags: IGameTag[];
  color?: "primary" | "default";
  size?: "small" | "medium";
}) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2 my-2 z-10">
      { tags.length > 0 ? tags.map((tag) => (
        <Chip
          onClick={(e) => {
            e.stopPropagation();
            router.push(`${ALL_NAVPATH.game_tag.href(tag)}`);
          }}
          key={`${id || "unique"}_${tag}`}
          label={tag}
          size={size}
          color={color}
        />
      )) :  "无标签" }
    </div>
  );
}
