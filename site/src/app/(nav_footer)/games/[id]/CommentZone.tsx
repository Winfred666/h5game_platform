"use client";
import CommentCards from "@/components/CommentCards";
import CommentAdder from "@/components/CommentAdder";
import { useCommentsByGameId } from "@/hooks/getComments";


export default function CommentZone({ gameId }: { gameId: string }) {
  const comments = useCommentsByGameId(gameId);
  return (
    <div className="w-full flex flex-col items-center gap-4 px-4 box-border">
      <CommentCards comments={comments} isUserPage={false} />
      <CommentAdder gameId={gameId} />
    </div>
  );
}
