// src/app/admin/users/components/DeleteUserDialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteUserDialogProps {
  user: { name: string; qq: string } | null;
  onConfirm: () => void;
  onClose: () => void;
}
// because user state is selected and control from outside, so we cannot use useState here
export function DeleteUserDialog({ user, onConfirm, onClose }: DeleteUserDialogProps) {
  if (!user) return null;

  return (
    <AlertDialog open={!!user} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除用户</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除 {user.name} (QQ: {user.qq})? 此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}