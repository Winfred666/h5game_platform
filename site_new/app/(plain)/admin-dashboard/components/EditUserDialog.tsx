// This component is more complex as it manages its own form state.
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you forgot to import this
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IUserAdmin } from "@/lib/types/iuser";

// Let's define a type for the data we send back
export interface UserUpdatePayload {
  qq: string;
  isAdmin: boolean;
  // Let parent handle password encryption
  password?: string; 
}

interface EditUserDialogProps {
  user: IUserAdmin | null;
  onSave: (data: UserUpdatePayload) => void;
  onClose: () => void;
}

export function EditUserDialog({ user, onSave, onClose }: EditUserDialogProps) {
  const [qq, setQq] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [clearPassword, setClearPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setQq(user.qq);
      setIsAdmin(user.isAdmin);
      setClearPassword(false); // Reset on open
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    const payload: UserUpdatePayload = {
      qq,
      isAdmin,
    };
    if (clearPassword) {
      payload.password = ""; // Send empty string to signify clearing
    }
    onSave(payload);
  };

  return (
    <Dialog open={!!user} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="qq-input">QQ Number</Label>
            <Input id="qq-input" value={qq} onChange={(e) => setQq(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clear-password"
              checked={clearPassword}
              onCheckedChange={(checked) => setClearPassword(checked as boolean)}
            />
            <Label htmlFor="clear-password">Clear Password</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="set-admin"
              checked={isAdmin}
              onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
            />
            <Label htmlFor="set-admin">Set as Administrator</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}