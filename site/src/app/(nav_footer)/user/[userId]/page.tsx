"use client";

import React from "react";
import { Typography, Paper, Avatar, Button } from "@mui/material";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { ALL_NAVPATH } from "@/services/router_info";
import { useUserMsg, useUnauditGames } from "@/hooks/getUserMsg";
import { useRouter } from "next/navigation";
import Loading from "../../loading";
import { useCommentsByUserId } from "@/hooks/getComments";
import CommentCards from "@/components/CommentCards";
import useCurUserId from "@/hooks/getCurUserId";
import SmGameCards from "./SmGameCards";

export default function UserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = React.use(params);
  const {user, userGames, userContacts, error} = useUserMsg(userId);
  const router = useRouter();
  
  const comments = useCommentsByUserId(userId);
  
  const curUserId = useCurUserId();
  
  const unauditGames = useUnauditGames(curUserId);
  
  if (error) {
    return router.replace(ALL_NAVPATH.not_found_user.href);
  }

  const isMe = (curUserId === userId); // Check if the current user is viewing their own profile
  if (!user) {
    return <Loading/> // Show loading state while fetching user data
  }
  
  return (
    <Paper className="shadow-md rounded-lg max-w-4xl mx-auto mt-8 flex flex-col gap-4 py-4">
      <div className="flex items-center w-full gap-5 ml-4">
        <Avatar alt={user?.name ?? "游客"} src={user?.profile} />
        <Typography variant="h4">{user.name}</Typography>
        {isMe && (
          <Button
            variant="contained"
            onClick={() => router.push(ALL_NAVPATH.user_id.href(userId) + "/update")}
            sx={{ mt: 2 }}
          >
            修改个人资料
          </Button>
        )}
        {(isMe && user.is_admin) && (
          <Button
            variant="contained"
            onClick={() => router.push(ALL_NAVPATH.admin.href)}
            sx={{ mt: 2 }}
          >
            进入管理员面板
          </Button>
        )}
      </div>
      <div className="w-full h-15 flex items-center bg-black/20">
        <Typography variant="body1" className=" ml-4">
          用户注册于 <TimerOutlinedIcon style={{ fontSize: "15px" }} />{" "}
          {user.created_at}.
        </Typography>
      </div>
      <div className="flex flex-col mx-4 gap-4">
        <div>
          {userContacts.length > 0 ? (
            <>
              <Typography variant="h6">联系方式</Typography>
              <div>
                {userContacts.map((contact, index) => (
                    <Typography className="py-2" variant="body1" key={`contact_${index}`}>
                      <b>{contact.way}</b>: {contact.content}
                    </Typography>
                ))}
              </div>
            </>
          ) : (
            <Typography variant="h6">暂无联系方式 ~</Typography>
          )}
        </div>
        {user.introduction?.length && (
          <div>
            <Typography variant="h6">
              个人介绍
            </Typography>
            <Typography variant="body1" sx={{ ml: 4, mt: 1, whiteSpace: "pre-line" }}>
              {user.introduction}
            </Typography>
          </div>
        )}
        {userGames.length > 0 ? (
          <div>
            <Typography variant="h6">
              参与开发游戏：
            </Typography>
            <SmGameCards games={userGames} isMe={isMe}/>
          </div>
        ) : (
          <div>
            <Typography variant="h6">尚未上传任何游戏 ~</Typography>
          </div>
        )}
        {isMe && unauditGames.length > 0 && (
          <div>
            <Typography variant="h6">
              未审核通过的游戏：
            </Typography>
            <SmGameCards games={unauditGames} isMe={isMe}/>
          </div>
        )}
        <div>
          <Typography variant="h6">近期评论</Typography>
          <CommentCards comments={comments} isUserPage={true} />
        </div>
      </div>
    </Paper>
  );
}
