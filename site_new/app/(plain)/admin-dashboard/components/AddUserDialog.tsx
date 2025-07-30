// src/app/admin/users/components/AddUserDialog.tsx
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BatchedUsers = Array<{ qq: string; name:string }>;

interface AddUserDialogProps {
  isOpen: boolean;
  onAdd: (users: BatchedUsers) => void;
  onClose: () => void;
}

export function AddUserDialog({ isOpen, onAdd, onClose }: AddUserDialogProps) {
  const [newUsers, setNewUsers] = useState<BatchedUsers>([]);
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const lines = value.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) {
      setNewUsers([]);
      setIsValid(true);
      return;
    }

    try {
      const parsedUsers: BatchedUsers = lines.map((line) => {
        const [qq, name] = line.split(",").map(s => s.trim());
        if (!qq || !name || !/^\d+$/.test(qq)) {
          throw new Error("Invalid format");
        }
        return { qq, name };
      });
      setNewUsers(parsedUsers);
      setIsValid(true);
    } catch {
      setNewUsers([]);
      setIsValid(false);
    }
  };
  
  const handleAddClick = () => {
      if (newUsers.length === 0) {
          toast.error("No new users to add.");
          return;
      }
      onAdd(newUsers);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>批量添加用户</DialogTitle>
            <DialogDescription>
              已有用户不会重新创建，可放心导入全体成员。参考该共享文档，以快速从QQ群管理中导入用户信息：
              <Link
                href="https://docs.qq.com/doc/DV0xKdGxpcFBDU2ZR"
                target="_blank"
                className="text-blue-600 underline ml-1"
              >
                https://docs.qq.com/doc/DV0xKdGxpcFBDU2ZR
              </Link>
            </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
            <Label htmlFor="users-input">New Members</Label>
            <Textarea
              id="users-input"
              placeholder="12345,John Doe
67890,Jane Smith"
              rows={6}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className={!isValid ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {!isValid && <p className="text-sm text-red-600">Invalid format. Please use QQ,Name.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddClick} disabled={!isValid || newUsers.length === 0}>Add Users</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}