// This component is more complex as it manages its own form state.
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you forgot to import this
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IUserAdmin } from "@/lib/types/iuser";
import { useLoading } from "@/components/LoadingProvider";
import { ActionResponse } from "@/lib/types/iaction";

// Let's define a type for the data we send back
interface UserUpdatePayload {
  id: number;
  qq: string;
  isAdmin: boolean;
  // Let parent handle password encryption
  resetPassword: boolean; 
}

interface EditUserDialogProps {
  user: IUserAdmin | undefined;
  onSaveAction: (data: UserUpdatePayload) => Promise<ActionResponse<void>>;
  onClose: () => void;
}

export function EditUserDialog({ user, onSaveAction, onClose }: EditUserDialogProps) {
  const [qq, setQQ] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);

  const { startLoading } = useLoading(); // Assuming you have a loading context
  
  useEffect(() => {
    if (user) {
      setQQ(user.qq);
      setIsAdmin(user.isAdmin);
      setResetPassword(false); // Reset on open
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    const payload: UserUpdatePayload = {
      id: user.id,
      qq,
      isAdmin,
      resetPassword,
    };
    await startLoading(() => onSaveAction(payload));
    // Reset state after save
    setQQ("");
    setIsAdmin(false);
    setResetPassword(false);
    onClose();
  };

  return (
    <Dialog open={!!user} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑用户：{user.name}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qq-input">QQ 号</Label>
            <Input id="qq-input" value={qq} onChange={(e) => setQQ(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="reset-password"
              checked={resetPassword}
              onCheckedChange={(checked) => setResetPassword(checked as boolean)}
            />
            <Label htmlFor="reset-password">恢复默认密码</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="set-admin"
              checked={isAdmin}
              onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
            />
            <Label htmlFor="set-admin">设为管理员</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}