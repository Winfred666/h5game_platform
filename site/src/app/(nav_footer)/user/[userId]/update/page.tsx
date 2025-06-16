"use client";

import React, { useState, useRef, useEffect} from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Paper,
} from "@mui/material";
import { IContact } from "@/types/iuser";
import DeleteIcon from "@mui/icons-material/Delete"
import { encryptPassword, parseContactsString } from '@/services/utils';
import { useUserMsg } from "@/hooks/getUserMsg";

import CircularProgress from "@mui/material/CircularProgress";

import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/services/router_info";
import { useSWRConfig } from "swr";

export default function UserUpdatePage({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const { userId } = React.use(params);
  const {mutate: mutate_path} = useSWRConfig();

  const [isSubmitting, setIsSubmitting] = useState(false); // 控制提交状态

  const [textData, setTextData] = useState({
    name: "",
    password: "",
    introduction: "",
  });

  const [profile, setProfile] = useState<{ file: File | null; url: string | null }>(
    { file: null, url: null }
  ); //记录用户头像的file以及url
  const profileRef = useRef<HTMLInputElement>(null); //用户头像对应的<input>的引用

  const [contacts, setContacts] = useState<IContact[]>([]); // 存储联系方式的数组

  //获取改动前的用户信息
  const { user } = useUserMsg(userId);
  
  useEffect(() => {
    if(user) {
      setTextData({
        name: user.name ?? "",
        password: "", //密码不会返回,保持为空
        introduction: user.introduction ?? "",
      });
      setProfile({
        file: null, //文件不会从后端返回
        url: user.profile ?? "", 
      });
      setContacts(user.contacts);
    }
  }, [user]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;//获取当前对象的name属性以及当前值
    setTextData((prev) => ({ ...prev, [name]: value }));//根据name的值动态选择属性名
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setProfile({ file, url });
    }
  };

  const handleProfileClick = () => {
    if (profileRef.current) profileRef.current.click();
  };

  // 按按钮后添加一个空的联系方式
  const handleAddContact = () => {
    setContacts((prev) => [...prev, { way: "", content: "" }]); 
  };

  const handleContactChange = (index: number, field: keyof IContact, value: string) => {
    setContacts((prev) =>
      prev.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    );
  };

  // 删除指定索引的联系方式
  const handleRemoveContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index)); 
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //阻止默认提交行为
    setIsSubmitting(true); //设置为已提交以禁用各个输入框和按钮

    //对password进行SHA-256加密
    const hashedPassword = encryptPassword(textData.password);

    //构造更新的用户数据(以FormData的形式，它支持传递文件)
    const update_data = new FormData();
    if(textData.name.length > 0) update_data.append("name", textData.name);
    if(textData.password.length > 0) update_data.append("hash", hashedPassword); 
    if(textData.introduction.length > 0) update_data.append("introduction", textData.introduction);

    if (profile.file) {
      update_data.append("profile", profile.file);
    }

    // 将 contacts 转换为字符串
    if (contacts.length > 0) {
      const contactsString = contacts
        .map((contact) => `${contact.way}:${contact.content}`)
        .join(","); // 使用逗号分隔way和content,使用分号分隔数组元素
      update_data.append("contacts", contactsString);
    }
    

    console.log("更新用户数据:");
    for (const sth of update_data.keys()) {
      console.log(sth, update_data.get(sth));
    }

    //向后端发送请求
    try {
      //注:不需要加上?id=${userId},因为id信息会从credentials: "include"所带的鉴权信息中找到.
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user`, {
        method: "PUT",
        body: update_data,
        credentials: "include", // 这样浏览器会自动带上cookie以获得权限信息
      });
      
      const data = await response.json();
      console.log(data); // 处理服务器响应
      if (!response.ok) throw new Error("Network response was not ok");

      //收到返回信息后清空缓存，跳转到用户主页
      mutate_path(`/user?id=${userId}`);
      router.push(ALL_NAVPATH.user_id.href(userId));
      //window.location.href = `/user/${userId}`;
    } catch (error) {
      console.error("Error:", error);
      //setIsSubmitting(false); // 如果出错，允许用户重新提交
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Paper className="shadow-md rounded-lg max-w-4xl mx-auto mt-8 space-y-2 p-5">
        <Typography variant="h4" gutterBottom>
          更新个人信息
        </Typography>
        <div className="p-5">
          <TextField
            id="name"
            name="name"
            label="昵称"
            placeholder="输入新昵称"
            variant="outlined"
            fullWidth
            margin="normal"
            value={textData.name}
            onChange={handleTextChange}
            disabled={isSubmitting} //正在提交时禁用
          />
          <TextField
            id="password"
            name="password"
            label="密码"
            placeholder="输入新密码"
            variant="outlined"
            fullWidth
            margin="normal"
            value={textData.password}
            onChange={handleTextChange}
            helperText="不输入默认为旧密码，此处不显示"
            disabled={isSubmitting}
          />
          <TextField
            id="introduction"
            name="introduction"
            label="自我介绍"
            placeholder=""
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={textData.introduction}
            onChange={handleTextChange}
            helperText="注意不要加单双引号~"
            disabled={isSubmitting}
          />
        </div>     
        <Box sx={{ }}>
          <Typography variant="h6" gutterBottom>
            上传用户头像
          </Typography>
          <Box
            className=" relative flex justify-center items-center bg-neutral-500 cursor-pointer hover:opacity-70 transition-opacity"
            sx={{
              width: 240,
              height: 240,
              border: "1px solid #ccc",
              borderRadius: 2,
              overflow: "hidden",
            }}
            onClick={handleProfileClick}
          >
            {profile.url ? (
              <Box
                component="img"
                src={profile.url}
                alt="Cover"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Typography variant="body2" className=" select-none">
                点击更新头像
              </Typography>
            )}
            <input
              type="file"
              accept="image/*"
              ref={profileRef}
              onChange={handleProfileChange}
              className="hidden"
              title="Upload an image file"
              disabled={isSubmitting}
            />
          </Box>
        </Box>
        <div>
          <Typography variant="h6" gutterBottom>
            联系方式
          </Typography>
          {contacts.map((contact, index) => (
            <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
              <TextField
                label="联系方式"
                placeholder="如微信/QQ/邮箱/电话"
                value={contact.way}
                onChange={(e) => handleContactChange(index, "way", e.target.value)}
                fullWidth
                required
                disabled={isSubmitting}
              />
              <TextField
                label="内容"
                placeholder="如QQ号/邮箱地址"
                value={contact.content}
                onChange={(e) => handleContactChange(index, "content", e.target.value)}
                fullWidth
                required
                disabled={isSubmitting}
              />
              <IconButton
                color="primary"
                onClick={() => handleRemoveContact(index)}
                disabled={isSubmitting}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button variant="outlined" onClick={handleAddContact} disabled={isSubmitting}>
            添加联系方式
          </Button>
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
            {isSubmitting ? "更新中..." : "更新"}
          </Button>
        </div>
      </Paper>
    </form>
  );
}