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

export default async function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const isMe = false;
  // --- Data Fetching Hooks (unchanged) ---
  // const unauditGames = useUnauditGames(curUserId);
  // const comments = useCommentsByUserId(userId);
  // const curUserId = useCurUserId();
  // --- Logic (unchanged) ---
  // const userInitial = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <UserThumbnail />

            {isMe && (
              <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center">
                <Button asChild>
                  <Link href={ALL_NAVPATH.user_update.href}>
                    <Edit className="mr-2 h-4 w-4" />
                    编辑个人信息
                  </Link>
                </Button>
                {user.is_admin && (
                  <Button
                    variant="secondary"
                    onClick={() => router.push(ALL_NAVPATH.admin.href)}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    进入管理员面板
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardDescription className="flex items-center gap-2 mt-2 text-md">
          <Calendar className="h-4 w-4" />
          Joined on{" "}
          {new Date(user.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </CardDescription>

        <CardContent className="pt-6">
          <div className="space-y-10">
            {/* --- Personal Introduction --- */}
            {user.introduction?.length && (
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Personal Introduction
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {user.introduction}
                </p>
              </div>
            )}

            {/* --- Contact Information --- */}
            <div>
              <h3 className="text-xl font-semibold mb-3">
                Contact Information
              </h3>
              {userContacts.length > 0 ? (
                <div className="space-y-2">
                  {userContacts.map((contact, index) => (
                    <div
                      key={`contact_${index}`}
                      className="flex items-center gap-4 text-sm"
                    >
                      <span className="font-semibold w-20 text-right text-primary">
                        {contact.way}
                      </span>
                      <span className="text-muted-foreground">
                        {contact.content}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No contact information provided.
                </p>
              )}
            </div>

            <Separator />

            {/* --- Developed Games --- */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Developed Games</h3>
              {userGames.length > 0 ? (
                <SmGameCards games={userGames} isMe={isMe} />
              ) : (
                <p className="text-muted-foreground">
                  This user has not uploaded any games yet.
                </p>
              )}
            </div>

            {/* --- Unaudited Games (Visible only to self) --- */}
            {isMe && unauditGames.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Games Pending Review
                </h3>
                <SmGameCards games={unauditGames} isMe={isMe} />
              </div>
            )}

            {/* --- Recent Comments --- */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Comments</h3>
              <CommentCards comments={comments} isUserPage={true} />
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
