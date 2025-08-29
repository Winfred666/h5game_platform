import { IGameTagAdmin } from "@/lib/types/igame";
import GameTags from "@/components/GameTags";
import { useLoading } from "@/components/LoadingProvider";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { changeTagAction } from "@/lib/querys&actions/postAdminCmd";
import { Description } from "@radix-ui/react-dialog";

export default function EditTagDialog({
  tag,
  onClose,
  repeatCheck,
}: {
  tag?: IGameTagAdmin;
  onClose: () => void;
  repeatCheck: (id: string, newName: string) => boolean;
}) {
  const [tagName, setTagName] = useState("");
  const [isHide, setIsHide] = useState(false);
  // add a normal GameTag for display or searching
  const { startLoading } = useLoading();
  const [isRepeated, setIsRepeated] = useState(false);

  useEffect(() => {
    if (tag) {
      setTagName(tag.name);
      setIsHide(tag.hide);
    }
  }, [tag]);

  if (!tag) return null;

  const handleTagChange = async () => {
    await startLoading(
      () => changeTagAction(tag.id, { name: tagName, hide: isHide }),
      {
        loadingMsg: "正在修改标签...",
        successMsg: (s) => s,
      }
    );
    onClose();
  };

  return (
    <Dialog open={!!tag} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className=" flex items-center gap-2">
            <div>编辑</div>
            <GameTags size="medium" id={"edittag_" + tag.id} tags={[tag]} />
          </DialogTitle>
          <Description>共有 {tag._count.games} 个游戏使用该标签。</Description>
        </DialogHeader>
        {/* Rename tags, switch to hidden or display */}
        <div className="space-y-2">
          <Label htmlFor="tag_rename">
            标签重命名
            {isRepeated ? "（警告：名称重复，若保存，将和已有标签合并）" : ""}
          </Label>
          <Input
            id="tag_rename"
            value={tagName}
            onChange={(e) => {
              setIsRepeated(repeatCheck(tag.id, e.target.value));
              setTagName(e.target.value);
            }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="set_tag_hide"
            checked={isHide}
            onCheckedChange={(checked) => setIsHide(checked as boolean)}
          />
          <Label htmlFor="set_tag_hide">设为隐藏，新上传游戏不可添加</Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleTagChange}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
