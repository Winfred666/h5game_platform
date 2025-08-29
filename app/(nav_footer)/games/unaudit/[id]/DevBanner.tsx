"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button" // Import the shadcn/ui Button
import { AlertTriangle, CheckCircle2 } from "lucide-react" // Optional: Icons for better UX
import { ALL_NAVPATH } from "@/lib/clientConfig"


export default function DevBanner({
  gameId,
  isPrivate,
}: {
  gameId: number,
  isPrivate: boolean | undefined, // 'isPrivate' is hidden field of bd, exposing this means developer's authority
}) {
  if (isPrivate === undefined) {
    return null // Returning null is slightly cleaner than an empty fragment
  }

  return (
    <div className="flex w-full items-center justify-center gap-x-2 bg-primary py-1 text-center text-sm text-primary-foreground">
      {isPrivate ? (
        <>
          <AlertTriangle className="h-4 w-4" />
          <span>
            正在浏览您未审核游戏的页面，仅开发者或管理员可见，可提醒 QQ
            群管理员审核。
          </span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          <span>该游戏已通过审核，所有人可正常浏览。</span>
        </>
      )}

      {/* Using the shadcn/ui Button with `asChild` is the idiomatic way to style a Next.js Link */}
      <Button
        asChild
        variant="link"
        className="h-auto p-0 text-primary-foreground underline hover:text-primary-foreground/80"
      >
        <Link href={ALL_NAVPATH.game_update.href(gameId)}>修改游戏</Link>
      </Button>
    </div>
  )
}