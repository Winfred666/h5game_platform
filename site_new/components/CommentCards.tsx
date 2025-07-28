import React from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react"; // Icon replacement

// Shadcn/ui component imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Your existing hooks, types and services

import { ALL_NAVPATH } from "@/lib/clientConfig";
import { IComment } from "@/lib/types/icomment";
import { auth } from "@/lib/services/authSQL";


interface CommentCardsProps {
  comments: IComment[];
  isUserPage: boolean; // Indicates if this is on a user profile page
}

const CommentCards: React.FC<CommentCardsProps> = ({
  comments,
  isUserPage,
}) => {
  // judge whether has right to delete the comment
  const userSession = auth();

  // const { mutate: mutate_path } = useSWRConfig();

  // const handleDeleteComment = async (comment: IComment) => {
  //   const res = await client_fetch(`/comment?id=${comment.id}`, {
  //     method: "DELETE",
  //   });
  //   if (res) {
  //     // Revalidate SWR caches for user comments and game comments
  //     mutate_path(`/comment?user_id=${comment.user_id}`);
  //     mutate_path(`/comment?game_id=${comment.game_id}`);
  //   }
  // };

  // Helper to get first character for AvatarFallback
  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "";

  return (
    <div className="w-full flex flex-col mt-6">
      {comments.map((comment, index) => (
        <React.Fragment key={comment.id}>
          {index > 0 && <Separator className="my-4 bg-border" />}
          <div className="w-full">
            {/* Comment Header */}
            <div className="flex items-center justify-between mb-2">
              <Link
                href={ALL_NAVPATH.user_id.href(comment.user_id)}
                className="flex items-center gap-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={comment.user_avatar}
                    alt={comment.user_name}
                  />
                  <AvatarFallback>
                    {getInitials(comment.user_name)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold text-foreground">
                  {comment.user_name}
                </p>
              </Link>
              <p className="text-xs text-muted-foreground">
                {comment.created_time}
              </p>
            </div>

            {/* Comment Body and Actions */}
            <div className="flex items-start justify-between gap-4">
              <p className="ml-10 flex-grow whitespace-pre-line text-sm text-foreground">
                {comment.content}
              </p>

              {/* Action buttons are grouped together */}
              <div className="flex items-center gap-2 shrink-0">
                {isUserPage && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={ALL_NAVPATH.game_id.href(comment.game_id)}>
                      跳转到游戏详情页
                    </Link>
                  </Button>
                )}
                {/* {(curUserId === comment.user_id || curUserMsg?.is_admin) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="删除"
                    onClick={() => handleDeleteComment(comment)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )} */}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default CommentCards;