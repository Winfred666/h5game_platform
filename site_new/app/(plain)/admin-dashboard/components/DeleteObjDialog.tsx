// src/app/admin/users/components/DeleteUserDialog.tsx
import { useLoading } from "@/components/LoadingProvider";
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
import { ActionResponse } from "@/lib/types/iaction";

interface DeleteUserDialogProps<Obj> {
  obj: Obj | undefined;
  thing: "用户" | "游戏" | "标签";
  onDeleteAction: (obj: Obj) => Promise<ActionResponse<void>>;
  onClose: () => void;
}
// because user state is selected and control from outside, so we cannot use useState here
// WARNING: only deleteObjDialog do not need startLoading as it already takes care of loading state internally
export function DeleteObjDialog<Obj extends { name: string }>({
  obj,
  onDeleteAction,
  onClose,
  thing,
}: DeleteUserDialogProps<Obj>) {
  const { startLoading, isPending } = useLoading();
  if (!obj) return null;
  
  const handleConfirm = async () => {
    if (!obj || isPending) return;
    startLoading(async () => await onDeleteAction(obj), {
      loadingMsg: `正在删除${thing} ${obj.name}...`,
      successMsg: `删除${thing} ${obj.name} 成功！`,
    });
    onClose();
  };

  return (
    <AlertDialog
      open={!!obj}
      onOpenChange={(isOpen) => !isOpen && !isPending && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除{thing}</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除 {obj.name}？此操作无法撤销，请谨慎操作！
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
