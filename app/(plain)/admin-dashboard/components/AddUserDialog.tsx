// src/app/admin/users/components/AddUserDialog.tsx
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionResponse } from "@/lib/types/iaction";
import { useLoading } from "@/components/LoadingProvider";
import { AddUserInputSchema } from "@/lib/types/zformClient";
import { cn } from "@/lib/utils";

type BatchedUsers = Array<{ qq: string; name: string; avatar: string }>;

interface AddUserDialogProps {
  isOpen: boolean;
  onAddAction: (users: BatchedUsers) => Promise<ActionResponse<number>>;
  onClose: () => void;
}

export function AddUserDialog({
  isOpen,
  onAddAction,
  onClose,
}: AddUserDialogProps) {
  const [newUsers, setNewUsers] = useState<BatchedUsers>([]);
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  const { startLoading } = useLoading();

    const handleValidation = () => {
    const lines = inputValue.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) {
      setNewUsers([]);
      setIsValid(true);
      return;
    }

    try {
      const parsedUsers: BatchedUsers = lines.map((line) => {
        const [qq, name, role, avatar] = line.split(",").map((s) => s.trim());
        // console.log(`Parsed user - QQ: ${qq}, Name: ${name}, Avatar: ${avatar}`);
        return { qq, name, isAdmin: role !== "成员", avatar };
      });
      setNewUsers(AddUserInputSchema.parse(parsedUsers));
      setIsValid(true);
    } catch {
      setNewUsers([]);
      setIsValid(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleAddClick = async () => {
    await startLoading(() => onAddAction(newUsers), {
      loadingMsg: "正在添加用户...",
      successMsg: (count) => `成功添加 ${count} 个新用户！`,
    });
    setInputValue("");
    setNewUsers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>批量添加用户</DialogTitle>
          <DialogDescription>
            已有用户不会重新创建，可放心导入全体成员。参考该共享文档，以快速从QQ群管理中导入用户信息：
            <Button asChild variant="link">
              <Link
                href="https://docs.qq.com/doc/DV0xKdGxpcFBDU2ZR"
                target="_blank"
              >
                https://docs.qq.com/doc/DV0xKdGxpcFBDU2ZR
              </Link>
            </Button>
          </DialogDescription>
        </DialogHeader>
          <Textarea
            id="users-input"
            placeholder={`12345,John Doe,管理员,https://xxx.jpg
67890,Jane Smith,成员,https://xxx.jpg`}
            rows={6}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleValidation}
            className={
              cn(!isValid ? "border-destructive focus-visible:ring-destructive/60" : "",
                  "max-h-64"
              )
            }
          />
          {!isValid && (
            <p className="text-sm text-destructive">格式无效。请使用QQ,姓名,成员/管理员,头像地址</p>
          )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleAddClick}
            disabled={!isValid || newUsers.length === 0}
          >
            添加用户
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
