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
import { UserThumbnail } from "@/components/UserListItem";
import { ALL_NAVPATH } from "@/lib/clientConfig";
import Link from "next/link";
import { getPublicUserById } from "@/lib/querys&actions/getUser";
import { GameCard } from "@/components/GameCards";
import CommentCards from "@/components/CommentCards";
import { IUser } from "@/lib/types/iuser";

function UserGameCards({
  games,
  isMeOrAdmin,
}: {
  games: { id: number; title: string; coverImage: string }[];
  isMeOrAdmin: boolean;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto py-2">
      {games.map((game) => (
        <div
          key={`game_${game.id}`}
          className="w-48 lg:w-56 flex flex-col items-center"
        >
          <GameCard game={{ ...game, isMeOrAdmin }} small />
          {isMeOrAdmin && (
            <Link href={ALL_NAVPATH.game_update.href(game.id)}>
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

export async function UserPage({
  user,
  isMe,
  isAdmin,
  unauditGames,
}: {
  user: IUser;
  isMe: boolean;
  isAdmin: boolean;
  unauditGames?: { id: number; title: string; coverImage: string }[];
}) {
  return (
    <main className="max-w-full lg:w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <UserThumbnail user={user} size="large" />
            {isMe && (
              <>
                <Button asChild className=" ml-4">
                  <Link href={ALL_NAVPATH.user_update.href}>
                    <Edit className="mr-1 h-4 w-4" />
                    编辑个人信息
                  </Link>
                </Button>
                {isAdmin && (
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
                <table className="text-left">
                  <tbody>
                    {user.contacts.map((contact, index) => (
                      <tr key={`contact_${index}`}>
                        <th className="text-primary mr-2">{contact.way}</th>
                        <td>{contact.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>该开发者未提供联系方式。</p>
              )}
            </div>

            <Separator />

            {/* --- Developed Games --- */}
            <div>
              <h3 className="font-semibold mb-3">上传游戏</h3>
              {user.games.length > 0 ? (
                <UserGameCards
                  games={user.games}
                  isMeOrAdmin={isMe || isAdmin}
                />
              ) : (
                <p>该开发者尚未上传任何游戏。</p>
              )}
            </div>

            {/* --- Unaudited Games (Visible to self + admin) --- */}
            {(isMe || isAdmin) && unauditGames && unauditGames.length > 0 && (
              <div className="my-4">
                <h3 className="font-semibold mb-3">待审核游戏</h3>
                <UserGameCards
                  games={unauditGames}
                  isMeOrAdmin={isMe || isAdmin}
                />
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

// WARNING: this is the tourist page.
export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getPublicUserById(userId); // auto handle 404
  // console.log(user);
  // const comments = useCommentsByUserId(userId);
  // when visit user id page, only show public games.
  return <UserPage user={user} isMe={false} isAdmin={false} />;
}

export const dynamic= "force-static"; // force static generation for user page, no need to revalidate