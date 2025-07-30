"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IGameTag } from "@/lib/types/igame";
import { DeletableTags } from "@/components/inputs/InteractiveTag";
import {
  addTagAction,
  deleteTagAction,
} from "@/lib/querys&actions/postAdminCmd";

export default function TagsManagerTab({ tags }: { tags: IGameTag[] }) {
  const [newTag, setNewTag] = useState("");

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault(); // 阻止默认的回车行为
    // 检查','
    if (newTag.includes(",")) {
      toast.error("标签中不能含有逗号");
      return;
    }
    if (newTag.trim() === "") {
      toast.error("标签不能为空");
      return;
    }

    if (tags.some((tag) => tag.name === newTag.trim())) {
      toast.error("标签已存在");
      return;
    }

    try {
      await addTagAction(newTag.trim());
      setNewTag("");
      toast.success("添加标签成功");
    } catch (err) {
      console.error("添加标签失败:", err);
      toast.error("添加标签失败");
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    try {
      await deleteTagAction(tagId);
      toast.success("删除标签成功");
    } catch {
      toast.error("删除标签失败");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-muted-foreground">
        这些 Tags 会在首页最下方搜索和用户上传时显示：
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <DeletableTags
          selectedTags={tags}
          onDelete={handleDeleteTag}
          emptyText="没有任何标签，请尽快补充"
        />
      </div>
      {/* Every input should be part of form, must be controllable */}
      <div className="space-y-2">
        <Label htmlFor="new-tag">回车添加标签</Label>
        <Input
          id="new-tag"
          placeholder="输入新标签..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
