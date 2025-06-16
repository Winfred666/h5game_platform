"use client";

import React, {useState} from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";
import { useRouter, useSearchParams } from "next/navigation";
import {ALL_NAVPATH} from "@/services/router_info";
import { encryptPassword } from "@/services/utils";
import { setCurUserIdCookie } from "@/hooks/getCurUserId";
import { useSnackBar } from "@/components/SnackBarContext";
import { use } from "react";

export default function LoginPage({searchParams}:{searchParams: Promise<{ callback?: string }>}) {
  const router = useRouter();
  const {callback} = use(searchParams);
  console.log("callback:", callback);
  
  const [isSubmitting, setIsSubmitting] = useState(false); // 控制提交状态

  const snackBar = useSnackBar();

  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;//获取当前对象的name属性以及当前值
    setFormData((prev) => ({ ...prev, [name]: value }));//根据name的值动态选择属性名
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true); //设置为已提交以禁用各个输入框

    // WARNING: 对password进行SHA-256加密，后续版本应该移到服务器中。
    const hashedPassword = encryptPassword(formData.password);
    //构造新的登录数据
    const reg_data = new FormData();
    reg_data.append("qq", formData.id);
    reg_data.append("hash", hashedPassword); 
    // console.log("登录数据:", hashedPassword);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/user", {
        method: "POST",
        body: reg_data,
        credentials: "include"
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      console.log(data); // 处理服务器响应
      // find query callback in pathname, if exists, redirect to that page
      const queryCallback = callback;
      console.log("queryCallback:", queryCallback);
      const userId = data.id; // my_id
      setCurUserIdCookie(userId);
      if (queryCallback) {
        // console.log(queryCallback);
        router.replace(queryCallback);
      }else{
        router.replace(ALL_NAVPATH.user_id.href(userId));
      }
    } catch (error) {
      snackBar.open("登录失败，检查QQ号和密码是否正确！");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className=" grow flex items-center">
      <Paper className="shadow-md rounded-lg max-w-4xl mx-auto mb-8 space-y-2 py-5 px-10 flex flex-col items-center">
        <Typography variant="h4" gutterBottom>
          登录账号
        </Typography>
        <div className="p-5">
          <TextField
            id="id"
            name="id"
            label="QQ号"
            placeholder="请输入QQ号"
            variant="outlined"
            fullWidth
            required
            margin="normal"
            value={formData.id}
            onChange={handleChange}
            disabled={isSubmitting} //正在提交时禁用
          />
          <TextField
            id="password"
            name="password"
            label="密码"
            placeholder="初始密码需从群聊获取"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        <div className="mt-4">
          <Button
            variant="contained"
            type="submit"
            color="primary"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null} //在按钮左侧动态显示转圈图标
          >
            {isSubmitting ? "登录中..." : "登录"}
          </Button>
        </div>
      </Paper>
    </form>
  );
}