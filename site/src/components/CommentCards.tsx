"use client";
import React from "react";
import {
  Avatar,
  Typography,
  Box,
  Link,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import { IComment } from "@/types/icomment";
import { ALL_NAVPATH } from "@/services/router_info";
import useCurUserId from "@/hooks/getCurUserId";
import { useClientFetch } from "@/services/utils";
import { useSWRConfig } from "swr";
import { useUserMsg } from "@/hooks/getUserMsg";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

interface CommentCardsProps {
  comments: IComment[];
  isUserPage: boolean;
}

const CommentCards: React.FC<CommentCardsProps> = ({
  comments,
  isUserPage,
}) => {
  const curUserId = useCurUserId();
  const { user: curUserMsg } = useUserMsg(curUserId);

  const client_fetch = useClientFetch();
  const { mutate: mutate_path } = useSWRConfig();

  const handleDeleteComment = async (comment: IComment) => {
    const res = await client_fetch(`/comment?id=${comment.id}`, {
      method: "DELETE",
    });
    if (res) {
      mutate_path(`/comment?user_id=${comment.user_id}`);
      mutate_path(`/comment?game_id=${comment.game_id}`);
    }
  };
  return (
    <Box className="w-full flex flex-col items-center mt-6">
      {comments.map((comment, index) => (
        <div key={comment.id} className="w-full my-2">
          {index > 0 && <Divider />}
          <div className=" mt-2">
            <Box className="flex items-center justify-between mb-1">
              <Link href={ALL_NAVPATH.user_id.href(comment.user_id)}>
                <Box className="flex items-center gap-2">
                  <Avatar
                    src={comment.user_profile}
                    alt={comment.user_name}
                    sx={{ width: 32, height: 32 }}
                  />
                  <Typography
                    variant="subtitle2"
                    className="font-semibold"
                    color="text.primary"
                  >
                    {comment.user_name}
                  </Typography>
                </Box>
              </Link>
              <Typography variant="caption" color="text.secondary">
                {comment.created_time}
              </Typography>
            </Box>
            <div className=" flex flex-row items-start">
              <Typography variant="body1" className="pl-10 whitespace-pre-line grow">
                {comment.content}
              </Typography>
                {isUserPage && (
                    <Link href={ALL_NAVPATH.game_id.href(comment.game_id)}>
                      <Button variant="outlined" size="small">
                        跳转到游戏详情页
                      </Button>
                    </Link>
                )}
                {(curUserId === comment.user_id || curUserMsg?.is_admin) && (
                  <IconButton
                    aria-label="删除"
                    onClick={() => handleDeleteComment(comment)}
                    size="small"
                    color="primary"
                  >
                    <DeleteOutline/>
                  </IconButton>
                )}
            </div>
          </div>
        </div>
      ))}
    </Box>
  );
};

export default CommentCards;
