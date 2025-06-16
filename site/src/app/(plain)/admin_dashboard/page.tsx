import { Typography } from "@mui/material";
import AdminTabs from "./AdminTabs";
import Link from "next/link";
import { ALL_NAVPATH } from "@/services/router_info";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col justify-start items-stretch min-h-screen p-6">
      <div className="flex flex-row gap-6 items-baseline">
      <Typography variant="h4" component="h1" className="mb-4">
        管理员面板
      </Typography>
      <Link href={ALL_NAVPATH.home.href}> 回到主页 </Link>
      </div>
      <Typography variant="body1" className="mb-4">
        欢迎来到管理员面板！在这里，您可以审核、修改游戏与账号
      </Typography>
      <AdminTabs />
    </div>
  );
}
