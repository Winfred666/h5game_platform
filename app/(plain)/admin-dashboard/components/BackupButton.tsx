"use client";

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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function AdminBackupButton() {
  const [isOpen, setIsOpen] = useState(false);
  const handleBackupConfirm = async () => {
    // Direct download - the route handles everything
    window.open(process.env.NEXT_PUBLIC_BASEPATH + "/api/backup", "_blank");
  };
  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        导出数据库
      </Button>
      <AlertDialog
        open={isOpen}
        onOpenChange={(isOpen) => !isOpen && setIsOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>导出所有游戏？</AlertDialogTitle>
            <AlertDialogDescription>
              确定要导出所有游戏吗？此操作会打开一空白界面并加载较长时间，每次导出有
              30 分钟缓存。可访问链接，查看导出文件的整理方法：
              <Button variant="link">
                <Link
                  href="https://docs.qq.com/doc/DV0xKdGxpcFBDU2ZR"
                  target="_blank"
                >
                  https://docs.qq.com/doc/DV0xKdGxpcFBDU2ZR
                </Link>
              </Button>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBackupConfirm}>
              备份
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
