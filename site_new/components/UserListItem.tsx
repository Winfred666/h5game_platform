import { IUserAdmin } from "@/lib/types/iuser";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Pencil, Trash2, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface AdminUserListItemProps {
  user: IUserAdmin;
  onEdit: (user: IUserAdmin) => void;
  onDelete: (user: IUserAdmin) => void;
}

export function UserThumbnail({
  user,
  className,
  shrinkName = false,
  size = "default",
}: {
  user?: { id: number; name: string; avatar?: string };
  className?: string;
  shrinkName?: boolean;
  size?: "default" | "large";
}) {
  const avatarSize = size === "large" ? "h-12 w-12" : "h-8 w-8";
  return (
    <div
      className={cn(
        " flex items-center",
        size === "large" ? "gap-4" : "gap-2",
        className
      )}
    >
      <Avatar className={avatarSize}>
        <AvatarImage src={user?.avatar} alt={user?.name ?? "用户头像"} />
        <AvatarFallback>
          <UserRound className={avatarSize} />
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          shrinkName ? "hidden lg:inline" : "",
          size === "large" ? "text-xl" : ""
        )}
      >
        {user?.name ?? "游客"}
      </span>
    </div>
  );
}

export function UserListAdmin({
  users,
  onEdit,
  onDelete,
}: {
  users: IUserAdmin[];
  onEdit: (user: IUserAdmin) => void;
  onDelete: (user: IUserAdmin) => void;
}) {
  return (
    <div className="bg-card rounded-lg shadow-sm p-4 text-card-foreground">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr] gap-4 items-center px-3 py-2 border-b font-semibold text-muted-foreground text-sm">
        <h4>用户</h4>
        <h4>QQ</h4>
        <h4>创建时间</h4>
        <h4>角色</h4>
        <h4 className="justify-self-center">操作</h4>
      </div>

      {/* User Rows */}
      {users.length > 0 ? (
        users.map((user) => (
          <AdminUserListItem
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          没有找到用户。
        </div>
      )}
    </div>
  );
}

function AdminUserListItem({
  user,
  onEdit,
  onDelete,
}: AdminUserListItemProps) {
  return (
    <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr] gap-4 items-center p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors text-sm">
      <div className="min-w-0 font-medium truncate pr-4">
        <UserThumbnail user={user} />
      </div>
      <div className="text-muted-foreground truncate pr-4">{user.qq}</div>
      <div className="text-muted-foreground pr-4">
        {new Date(user.createdAt).toLocaleString()}
      </div>
      <div className="pr-4">
        <Badge variant={user.isAdmin ? "default" : "secondary"}>
          {user.isAdmin ? "Admin" : "User"}
        </Badge>
      </div>
      <div className="flex justify-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">编辑</span>
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(user)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">删除</span>
        </Button>
      </div>
    </div>
  );
}
