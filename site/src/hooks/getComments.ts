import { IComment } from "@/types/icomment";
import useSWR from 'swr';

function useCommentsByUserId(user_id: string): IComment[] {
  const { data: comments } = useSWR<IComment[] | undefined>(`/comment?user_id=${user_id}`, {
    fallbackData: [],
  })
  //return mockComments;
  return comments ?? [];
}

function useCommentsByGameId(game_id: string): IComment[] {
  const { data: comments } = useSWR<IComment[] | undefined>(`/comment?game_id=${game_id}`, {
    fallbackData: [],
  })
  //return mockComments;
  return comments ?? [];
}

export { useCommentsByGameId, useCommentsByUserId };