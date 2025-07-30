import React from "react";
import { Calendar, Edit, ShieldCheck } from "lucide-react";

// Shadcn/ui Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// import CommentCards from "@/components/CommentCards";
import { UserThumbnail } from "@/components/UserListItem";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import Link from "next/link";
import { getUserById } from "@/lib/querys&actions/getUser";
import { GameCard } from "@/components/GameCards";
import CommentCards from "@/components/CommentCards";

function UserGameCards({
  games,
  isMe,
}: {
  games: { id: number; title: string; coverImage: string }[];
  isMe: boolean;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto py-2">
      {games.map((game) => (
        <div
          key={`game_${game.id}`}
          className="w-48 lg:w-56 flex flex-col items-center"
        >
          <GameCard game={game} small />
          {isMe && (
            <Link href={ALL_NAVPATH.game_id.href(game.id) + "/update"}>
              <Button variant="secondary" className="mt-2 w-full">
                修改
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getUserById(userId);
  const unauditGames = user.games.filter(game=>game.isPrivate); // Fetch unaudited games only if it's the user's own page
  const publicGames = user.games.filter(game => !game.isPrivate);
  // const comments = useCommentsByUserId(userId);

  return (
    <main className="max-w-full lg:w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <UserThumbnail user={user} size="large" />
            {user.isMe && (
              <>
                <Button asChild className=" ml-4">
                  <Link href={ALL_NAVPATH.user_update.href}>
                    <Edit className="mr-1 h-4 w-4" />
                    编辑个人信息
                  </Link>
                </Button>
                {user.isAdmin && (
                  <Button asChild>
                    <Link href={ALL_NAVPATH.admin_review.href}>
                      <ShieldCheck className="mr-1 h-4 w-4" />
                      进入管理员面板
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>

        <CardDescription className=" px-6 py-2 flex items-center gap-2 bg-muted">
          <Calendar className="h-4 w-4" />
          加入时间：{user.createdAt}
        </CardDescription>

        <CardContent>
          <div className=" flex flex-col gap-4">
            <div>
              <h3 className="font-semibold mb-3">个人介绍</h3>
              {/* --- Personal Introduction --- */}
              {user.introduction?.length ? (
                <p className="whitespace-pre-line">{user.introduction}</p>
              ) : (
                <p className="text-muted-foreground">
                  该开发者未提供个人介绍。
                </p>
              )}
            </div>
            {/* --- Contact Information --- */}
            <div>
              <h3 className="font-semibold mb-3">联系方式</h3>
              {user.contacts.length > 0 ? (
                user.contacts.map((contact, index) => (
                  <p
                    key={`contact_${index}`}
                    className="flex items-center gap-4 text-sm mt-2"
                  >
                    <span className="w-20 text-right text-primary">
                      {contact.way}
                    </span>
                    <span>{contact.content}</span>
                  </p>
                ))
              ) : (
                <p>该开发者未提供联系方式。</p>
              )}
            </div>

            <Separator />

            {/* --- Developed Games --- */}
            <div>
              <h3 className="font-semibold mb-3">上传游戏</h3>
              {publicGames.length > 0 ? (
                <UserGameCards games={publicGames} isMe={user.isMe} />
              ) : (
                <p>该开发者尚未上传任何游戏。</p>
              )}
            </div>

            {/* --- Unaudited Games (Visible only to self) --- */}
            {user.isMe && unauditGames.length > 0 && (
              <div className="my-4">
                <h3 className="font-semibold mb-3">待审核游戏</h3>
                <UserGameCards games={unauditGames} isMe={user.isMe} />
              </div>
            )}

            {/* --- Recent Comments --- */}
            <div>
              <h3 className="font-semibold mb-4">近期评论</h3>
              {/* <CommentCards comments={comments} isUserPage={true} /> */}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
