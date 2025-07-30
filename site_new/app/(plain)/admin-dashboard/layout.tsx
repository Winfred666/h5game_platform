import AdminTabs from "./AdminTabs";
import Link from "next/link";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import { Button } from "@/components/ui/button";

export default function AdminDashboardLayOut({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col justify-start items-stretch min-h-screen p-6">
      <div className="flex flex-row gap-6 items-baseline">
        <h2 className="text-3xl font-bold tracking-tight mb-4">管理员面板</h2>
        <Button asChild variant="outline">
          <Link href={ALL_NAVPATH.home.href()}>回到主页</Link>
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        欢迎来到管理员面板！在这里，您可以审核、修改游戏与账号
      </p>
      <AdminTabs />
      {children}
    </div>
  );
}
