import { IUser, IUserSelf } from "@/lib/types/iuser";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Pencil, Trash2, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AlertDialogTrigger } from "./ui/alert-dialog";
import { cn } from "@/lib/utils";

interface UserListItemProps {
  user: IUserSelf;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
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

export function UserListItem({ user, onEdit, onDelete }: UserListItemProps) {
  return (
    <div className="flex items-center p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors text-sm">
      <div className="flex-1 min-w-0 font-medium truncate pr-4">
        <UserThumbnail user={user} />
      </div>

      <div className="w-40 text-muted-foreground pr-4">{user.qq}</div>
      <div className="w-48 text-muted-foreground pr-4">
        {new Date(user.createdAt).toLocaleString()}
      </div>
      <div className="w-28 pr-4">
        <Badge variant={user.isAdmin ? "default" : "secondary"}>
          {user.isAdmin ? "Admin" : "User"}
        </Badge>
      </div>
      <div className="w-24 flex justify-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit User</span>
        </Button>

        {/* The AlertDialogTrigger is now part of the item itself */}
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className=" bg-transparent"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete User</span>
          </Button>
        </AlertDialogTrigger>
      </div>
    </div>
  );
}
