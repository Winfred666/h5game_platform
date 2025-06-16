"use client"
import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";
import useCurUserId from "@/hooks/getCurUserId";
import { ALL_NAVPATH } from "@/services/router_info";
import { useClientFetch } from "@/services/utils";
import { useSWRConfig } from "swr";

interface CommentAdderProps {
  gameId: string;
}

const CommentAdder: React.FC<CommentAdderProps> = ({ gameId }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const client_fetch = useClientFetch();

  const {mutate:mutate_path} = useSWRConfig();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);//提交状态下禁止修改输入
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("game_id", gameId);

    for (const sth of formData.keys()) {
      console.log(sth, formData.get(sth));
    }
    
    // 发送POST请求到服务器
    const response = await client_fetch("/comment", {
      method: "POST",
      body: formData,
    }, "添加评论失败！");
    if (response){
      const commentId = response.id;
      console.log("commentId = " + commentId);
      mutate_path(`/comment?game_id=${gameId}`); // 更新评论列表
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false); // 如果出错，允许用户重新提交
  };

  // 若未登录，该按钮会先转到登录
  const cur_user_id = useCurUserId();

  const handleLoginRedirect = () => {
    router.push( ALL_NAVPATH.login.href(window.location.pathname));
  }

  return (
    <Box component="form" onSubmit={cur_user_id ? handleSubmit : handleLoginRedirect } className="flex flex-col gap-2 mt-4 w-full max-w-2xl mx-auto">
      <TextField
        name="content"
        label="写下你的评论"
        variant="outlined"
        fullWidth
        multiline
        minRows={4}
        required
        disabled={loading || !cur_user_id}
      />
      <Button
        variant="contained"
        type="submit"
        color="primary"
        size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null} //在按钮左侧动态显示转圈图标
      >
        {loading ? "提交中..." : ( cur_user_id ? "发表评论" : "登录后发表评论")}
      </Button>
    </Box>
  );
}

export default CommentAdder;