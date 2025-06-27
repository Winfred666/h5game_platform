import { IUser } from "@/lib/types/iuser";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Pencil, Trash2, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AlertDialogTrigger } from "./ui/alert-dialog";
import { cn } from "@/lib/utils";

interface UserListItemProps {
  user: IUser;
  onEdit: (user: IUser) => void;
  onDelete: (user: IUser) => void;
}

export function UserThumbnail({ user, className }: { user?: IUser, className?: string }) {
  return (
    <div className={cn(" flex items-center gap-2", className)}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.avatar} alt={user?.name ?? "用户头像"} />
        <AvatarFallback>
          <UserRound className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <span className="hidden lg:inline">{user?.name ?? "游客"}</span>
    </div>
  );
}

function UserListItem({ user, onEdit, onDelete }: UserListItemProps) {
  return (
    <div className="flex items-center p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors text-sm">
      <div className="flex-1 min-w-0 font-medium truncate pr-4">
        <UserThumbnail user={user} />
      </div>

      <div className="w-40 text-muted-foreground pr-4">{user.qq}</div>
      <div className="w-48 text-muted-foreground pr-4">
        {new Date(user.created_at).toLocaleString()}
      </div>
      <div className="w-28 pr-4">
        <Badge variant={user.is_admin ? "default" : "secondary"}>
          {user.is_admin ? "Admin" : "User"}
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
