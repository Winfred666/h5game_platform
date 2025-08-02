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
import { useLoading } from "@/components/LoadingProvider";
import { DeleteObjDialog } from "../components/DeleteObjDialog";

export default function TagsManagerTab({ tags }: { tags: IGameTag[] }) {
  const [newTag, setNewTag] = useState("");
  const { startLoading } = useLoading();
  
  const [tagToDelete, setTagToDelete] = useState<IGameTag | undefined>();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault(); // 阻止默认的回车行为
    // 检查','
    await startLoading(async () => {
      if (newTag.includes(",")) {
        throw Error("标签中不能含有逗号");
      }
      if (tags.some((tag) => tag.name === newTag.trim())) {
        throw Error("标签已存在");
      }
      return addTagAction(newTag.trim());
    }, {
      loadingMsg: "正在添加标签...",
      successMsg: "标签添加成功",
    })
    if (newTag.trim() === "") {
      toast.error("标签不能为空");
      return;
    }
    setNewTag(""); // 清空输入框
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-muted-foreground">
        这些 Tags 会在首页最下方搜索和用户上传时显示：
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <DeletableTags
          selectedTags={tags}
          onDelete={setTagToDelete}
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
      <DeleteObjDialog
        obj={tagToDelete}
        onClose={() => setTagToDelete(undefined)}
        onDeleteAction={(tag)=> deleteTagAction(tag.id)}
        thing="标签"
      />
    </div>
  );
}
