"use client";

import { useState } from "react";
import { Chip, TextField } from "@mui/material";
import { useAdminTags } from "@/hooks/useAdmin";

export default function TagsManagerTab({
  setSnackbar,
}: {
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error";
  }) => void;
}) {
  const [newTag, setNewTag] = useState("");

  const {tags, addTag, deleteTag} = useAdminTags();

  return (
    <div className=" flex flex-col gap-6">
      <div>
        这些 Tags 会在首页最下方搜索和用户上传时显示：
      </div>
      <div className=" flex gap-2 items-center flex-wrap">
        {tags.map((tag) => (
          <Chip
            label={tag}
            key={"tag_" + tag}
            onDelete={() => deleteTag(tag)}
          ></Chip>
        ))}
      </div>
      {/* Add a textfield to addTag */}
      <TextField
        label="回车添加标签"
        variant="outlined"
        size="small"
        value={newTag}
        onChange={(e) => setNewTag(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // 检查','
            if (newTag.includes(",")) {
              setSnackbar({
                open: true,
                message: "标签中不能含有逗号",
                severity: "error",
              });
              return;
            }
            if (newTag.trim() === "") {
              setSnackbar({
                open: true,
                message: "标签不能为空",
                severity: "error",
              });
              return;
            }
            addTag(newTag.trim()).then(() =>{
              setNewTag("");
              setSnackbar({
                open: true,
                message: "添加标签成功",
                severity: "success",
              });
            });
          }
        }}
        fullWidth
      />
    </div>
  );
}
