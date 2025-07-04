// provide 2 kind of interactive tag_list(badge)

import { IGameTag } from "@/lib/types/igame";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";

export function SelectableTags({
  allTags,
  selectedTagIds,
  onSelect,
  onCancel,
}: {
  allTags: IGameTag[];
  selectedTagIds: number[];
  onSelect: (id: number) => void;
  onCancel: (id: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 select-none">
      {allTags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <Badge
            key={`selectable_tag_${tag.id}`}
            variant={isSelected ? "default" : "outline"} // Visually distinguish selected tags
            className="cursor-pointer"
            onClick={() => (isSelected ? onCancel(tag.id) : onSelect(tag.id))}
            // For accessibility: make it behave like a checkbox
            role="checkbox"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                isSelected ? onCancel(tag.id) : onSelect(tag.id);
              }
            }}
          >
            {tag.name}
          </Badge>
        );
      })}
    </div>
  );
}

export function DeletableTags({
  selectedTags,
  onDelete,
  emptyText = "没有选择开发者",
}: {
  selectedTags: IGameTag[];
  onDelete: (tagId: number) => void;
  emptyText?: string;
}) {
  if (selectedTags.length === 0) {
    return <span className=" text-muted-foreground text-sm">{emptyText}</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {selectedTags.map((tag) => (
        <Badge
          key={`cancelable_tag_${tag.id}`}
          variant="static"
          className=" space-x-1"
          // For accessibility: make it behave like a button
        >
          <span> {tag.name} </span>
          <span className="cursor-pointer rounded-full bg-primary-active hover:bg-primary-accent active:bg-primary-active">
          <X
            onClick={(e) => {
              e.stopPropagation(); // Prevent badge click event
              onDelete(tag.id);
            }}
            className=" icon-sm h-5 w-5"
          />
          </span>
        </Badge>
      ))}
    </div>
  );
}
