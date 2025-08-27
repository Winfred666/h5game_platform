"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IGameTagAdmin } from "@/lib/types/igame";
import {
  addTagAction,
  deleteTagAction,
} from "@/lib/querys&actions/postAdminCmd";
import { useLoading } from "@/components/LoadingProvider";
import EditTagDialog from "../components/EditTagDialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { EditIcon, X } from "lucide-react";
import { DeleteObjDialog } from "../components/DeleteObjDialog";


export default function TagsManagerTab({ tags }: { tags: IGameTagAdmin[] }) {
  const router = useRouter();
  const [newTag, setNewTag] = useState("");
  const { startLoading } = useLoading();
  const [tagToEdit, setTagToEdit] = useState<IGameTagAdmin | undefined>();
  const [tagToDelete, setTagToDelete] = useState<IGameTagAdmin | undefined>();

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


  const EditableTags = ({filter_tags}: {filter_tags: IGameTagAdmin[]}) => (<div className="flex gap-2 items-center flex-wrap">
        <div className="flex flex-wrap gap-2">
          {filter_tags.map(tag => (
            <Badge
              key={`editable_tag_${tag.id}`}
              role="button"
              onClick={() => router.push(ALL_NAVPATH.game_tag.href(tag.id))}
            >
              {tag.name}（{tag._count.games}）
              <span className="badge-button">
                <EditIcon className="icon-sm h-5 w-5" onClick={(e) => {
                  e.stopPropagation(); // Prevent badge click event
                  setTagToEdit(tag);
                }} />
              </span>
              <span className="badge-button">
                <X className="icon-sm h-5 w-5" onClick={(e) => {
                  e.stopPropagation(); // Prevent badge click event
                  setTagToDelete(tag);
                }} />
              </span>
            </Badge>
          ))}
        </div>
      </div>);

  const repeatedTagNames = (id: string, newName:string) => tags.some(t => t.name === newName && t.id !== id);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-muted-foreground">
        以下 Tag 会在首页下方和用户上传时显示，以供添加：
      </div>
      {/* Two panel for tag: tags that exist and addable (could shift to hide), or tag that exist but hide 
      (could shift to addable or delete) */}
      <EditableTags filter_tags={tags.filter(t => !t.hide)} />
      
      <div className="text-sm text-muted-foreground">
        以下陈旧 Tag 只会在游戏详情页显示，用户上传时不可选：
      </div>
      
      <EditableTags filter_tags={tags.filter(t => t.hide)} />
      
      {/* Every input should be part of form, must be controllable */}
      <div className="space-y-2">
        <Label htmlFor="new-tag">输入并回车，以添加新标签</Label>
        <Input
          id="new-tag"
          placeholder="输入新标签..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      
      <EditTagDialog
        tag={tagToEdit}
        onClose={() => setTagToEdit(undefined)}
        repeatCheck={repeatedTagNames}
      />
      <DeleteObjDialog
        obj={tagToDelete}
        onClose={() => setTagToDelete(undefined)}
        onDeleteAction={(tag) => deleteTagAction(tag.id)}
        thing="标签"
      />
    </div>
  );
}
