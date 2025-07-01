"use client";
import { IGameTag } from "@/lib/types/igame";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge"; // Replaced MUI Chip with Badge
import { cn } from "@/lib/utils"; // Optional, but good for class merging
import { ALL_NAVPATH } from "@/lib/clientConfig";

// The props are kept the same for a seamless drop-in replacement.
export default function GameTags({
  id,
  tags,
  color = "primary",
  size = "medium",
}: {
  id?: string;
  tags: IGameTag[];
  color?: "primary" | "default";
  size?: "small" | "medium";
}) {
  const router = useRouter();

  // Map the old MUI props to the new Shadcn/Tailwind equivalents
  const variant = color === "primary" ? "default" : "secondary";
  const sizeClasses = size === "small" ? " text-xs" : " text-sm";

  return (
    <div className="my-2 flex flex-wrap gap-2">
      {tags.length > 0 ? (
        tags.map((tag) => (
          <Badge
            key={`${id || "unique"}_${tag.id}`}
            // The variant prop of Badge controls its color scheme.
            // "default" uses the primary color, "secondary" is a muted gray.
            variant={variant}
            // Add Tailwind classes for interactivity and sizing.
            // The Badge component already has hover styles built-in for its variants!
            className={sizeClasses}
            onClick={(e) => {
              // Stop propagation is important if tags are inside another clickable element.
              e.stopPropagation();
              router.push(ALL_NAVPATH.game_tag.href(tag.id));
            }}
          >
            {tag.name}
          </Badge>
        ))
      ) : (
        // A styled message for when there are no tags.
        <p className={cn(sizeClasses,"text-muted-foreground")}>无标签</p>
      )}
    </div>
  );
}