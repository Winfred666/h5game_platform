"use client";

import React, { useState, useRef } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  IconButton,
  SelectChangeEvent,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import GamePoster from "@/components/GamePosters";

import { IDeveloper } from "@/types/igame";
import SearchBar from "@/components/SearchBar";
import DeleteIcon from "@mui/icons-material/Delete";
import useCurUserId from "@/hooks/getCurUserId";
import useAllTags from "@/hooks/getAllTags";
import { useRouter } from "next/navigation";
import { ALL_NAVPATH } from "@/services/router_info";
import { useSnackBar } from "@/components/SnackBarContext";

export default function NewGamePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false); // 控制提交状态
  const [kind, setKind] = useState(""); //类别(Downloaded/HTML)
  const UploadFileRef = useRef<HTMLInputElement>(null); //上传的游戏文件对应的<input>的引用
  const [uploadFilename, setUploadFilename] = useState(""); //记录上传的游戏文件名
  const [runKind, setRunKind] = useState("embed_in_page"); //运行选项(内嵌在页面中/全屏)
  const [cover, setCover] = useState<{ file: File | null; url: string | null }>(
    { file: null, url: null }
  ); //记录游戏封面图的file以及url
  const coverRef = useRef<HTMLInputElement>(null); //上传封面图对应的<input>的引用
  const [screenshots, setScreenshots] = useState<
    { file: File | null; url: string | null }[]
  >([]); //相比于第11行多了一个[]代表是列表

  const screenshotRef = useRef<HTMLInputElement>(null); //上传截屏图片对应的<input>的引用

  const allTags = useAllTags(); //存储所有的标签

  const [selectedTags, setSelectedTags] = useState<string[]>([]); //记录所有已选择的tag的name.

  //合作开发者们的user.id和user.name
  const [developers, setDevelopers] = useState<IDeveloper[]>([]);
  //当前用户的id
  const cur_user_id = useCurUserId();
  const snackBar = useSnackBar();

  const handleKindChange = (e: SelectChangeEvent<string>) => {
    setKind(e.target.value);
  };

  const handleUploadClick = () => {
    if (UploadFileRef.current) UploadFileRef.current.click();
  };

  const handleUploadFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFilename(file.name);
    }
  };

  const handleRunKindChange = (e: SelectChangeEvent<string>) => {
    setRunKind(e.target.value);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCover({ file, url });
    }
  };

  const handleCoverClick = () => {
    if (coverRef.current) coverRef.current.click();
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && screenshots.length < 3) {
      const url = URL.createObjectURL(file);
      setScreenshots((prev) => [...prev, { file, url }]);
    }
    // 重置 file input 以便可以重新上传同一文件
    e.target.value = "";
  };

  const handleScreenshotClick = () => {
    if (screenshotRef.current) screenshotRef.current.click();
  };

  const handleScreenshotDelete = (idx: number) => {
    setScreenshots((prev) => {
      const newImages = [...prev];
      newImages.splice(idx, 1); //在idx位置开始删除一个元素
      return newImages;
    });
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags(
      (prevSelected) =>
        prevSelected.includes(tag)
          ? prevSelected.filter((t) => t !== tag) // 取消选中
          : [...prevSelected, tag] // 添加选中
    );
  };

  //选择开发者时,直接push到developers,避免重复
  const handleSelectDeveloper = (option: { label: string; id: string }) => {
    setDevelopers((prev) => {
      //防止重复添加
      if (prev.some((dev) => dev.id === option.id)) return prev;
      return [...prev, { id: option.id, name: option.label }];
    });
  };

  //删除开发者
  const handleDeleteDeveloper = (index: number) => {
    setDevelopers((prev) => prev.filter((_, i) => i !== index));
  };

  //注：在form的提交时对应的handleSubmit函数中,应当将cover和screenshots的file内容传递给服务器,SelectTags也要传递
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //阻止默认提交行为
    setIsSubmitting(true); //设置为已提交以禁用各个输入框和按钮
    const formData = new FormData(e.target as HTMLFormElement); //e.target是当前form元素,将其转换为HTMLFormElement类型
    //将整个表单中的所有可提交字段（即带有name属性的,如input,select,textarea等）自动收集并填充到FormData对象中
    try {
      // 将cover和screenshots添加到formData中
      if (cover.file) formData.append("cover", cover.file);
      else throw new Error("请上传封面图！");

      screenshots.forEach((screenshot, idx) => {
        if (screenshot.file)
          formData.append(`screenshot_${idx}`, screenshot.file);
      });
      
      if (selectedTags.length > 0)
        formData.append("tags", selectedTags.join(","));
      //传递的是逗号分隔的字符串数组,服务器端想转换回来需要const tags = JSON.parse(req.body.tags);

      if (developers.length > 0) {
        const developer_string = [
          cur_user_id,
          ...developers
            .map((dev) => dev.id)
            .filter((dev_id) => dev_id !== cur_user_id), // 确保不重复添加当前用户
        ].join(",");
        formData.append("developers", developer_string);
      } else {
        formData.append("developers", cur_user_id as string);
      }

      if (!formData.has("embedop")) formData.append("embedop", "fullscreen");

      for (const sth of formData.keys()) {
        console.log(sth, formData.get(sth));
      }

      // 发送POST请求到服务器
      const response = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/upload",
        {
          method: "POST",
          body: formData,
          credentials: "include", // 这样浏览器会自动带上cookie以获得权限信息
        }
      );

      const data = await response.json();
      if (data.detail && !response.ok) {
        console.log(data);
        throw new Error(data.detail);
      }
      if (!response.ok) throw new Error("Network response was not ok");
      
      const gameId = data.id;
      console.log("gameId = " + gameId);
      // 跳转到游戏详情页面
      router.push(ALL_NAVPATH.game_id.href(gameId));
    } catch (error) {
      console.error("Error:", error);
      if(error instanceof Error) {
        snackBar.open(error.message || "提交失败，请重试！");
      }
    } finally {
      setIsSubmitting(false); // 如果出错，允许用户重新提交
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper className="m-10 p-4" variant="outlined">
        <Typography variant="h4" gutterBottom>
          Create a New Project
        </Typography>
        <div className=" flex flex-row justify-between gap-10 ">
          <div className=" flex flex-col gap-4 grow">
            <div>
              <TextField
                id="title"
                name="title"
                label="Title"
                placeholder="Enter your game name"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                disabled={isSubmitting} //正在提交时禁用
              />
              {/*<TextField
              id="tagline"
              name="tagline"
              label="Short description or tagline"
              placeholder="Optional"
              variant="outlined"
              fullWidth
              margin="normal"
              helperText="Shown when linking to your project. Avoid duplicating the title."
            />*/}
              <FormControl
                fullWidth
                variant="outlined"
                margin="normal"
                required
              >
                <InputLabel id="kind-label">Kind of project</InputLabel>
                <Select
                  labelId="kind-label"
                  id="kind"
                  name="kind"
                  value={kind}
                  onChange={handleKindChange}
                  label="Kind of project"
                  disabled={isSubmitting}
                >
                  <MenuItem value="downloadable">
                    Downloadable - You only have files to be downloaded
                  </MenuItem>
                  <MenuItem value="html">
                    HTML - You have a ZIP or HTML file that will be played in
                    the browser
                  </MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* 文件上传 */}
            <Box sx={{ mt: 2 }}>
              {kind === "html" && (
                <Typography variant="body1" gutterBottom>
                  Upload a ZIP file containing your game. There must be an
                  index.html file in the ZIP. Or upload a .html file that
                  contains your entire game.
                </Typography>
              )}
              <input
                id="uploadfile"
                name="uploadfile"
                type="file"
                ref={UploadFileRef}
                className="hidden"
                onChange={handleUploadFileChange}
                title="Upload your game file"
                accept=".zip"
              />
              <Button
                variant="contained"
                onClick={handleUploadClick}
                disabled={isSubmitting}
              >
                Upload Files
              </Button>
              {uploadFilename && (
                <Typography variant="caption" color="primary" display="block">
                  Current File: {uploadFilename}
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary">
                File size limit: 1 GB.
              </Typography>
            </Box>

            {kind === "html" && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Embed options</Typography>
                <FormControl
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  required
                >
                  <InputLabel id="embedop-label">
                    How should your project be run in your page?
                  </InputLabel>
                  <Select
                    labelId="embedop-label"
                    id="embedop"
                    name="embedop"
                    value={runKind}
                    onChange={handleRunKindChange}
                    label="How should your project be run in your page?"
                    disabled={isSubmitting}
                  >
                    <MenuItem value="embed_in_page">Embed in page</MenuItem>
                    <MenuItem value="fullscreen">
                      Click to launch in fullscreen
                    </MenuItem>
                  </Select>
                </FormControl>
                {runKind === "embed_in_page" && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      Viewport dimensions
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <TextField
                        id="width"
                        name="width"
                        placeholder="640"
                        defaultValue="640"
                        variant="outlined"
                        sx={{ width: 100, mr: 1 }}
                        disabled={isSubmitting}
                      />
                      <Typography variant="body1">px *</Typography>
                      <TextField
                        id="height"
                        name="height"
                        placeholder="360"
                        defaultValue="360"
                        variant="outlined"
                        sx={{ width: 100, mx: 1 }}
                        disabled={isSubmitting}
                      />
                      <Typography variant="body1">px</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            <div>
              <Typography variant="h6">Details</Typography>
              <TextField
                id="description"
                name="description"
                label="Description"
                placeholder=""
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                helperText="This will make up the content of your game page."
                disabled={isSubmitting}
              />
            </div>
            {/*<FormControl
                fullWidth
                variant="outlined"
                margin="normal"
                required
              >
                <InputLabel id="genre-label">Genre</InputLabel>
                <Select
                  labelId="genre-label"
                  id="genre"
                  name="genre"
                  label="Genre"
                  defaultValue=""
                >
                  <MenuItem value="">No genre</MenuItem>
                  <MenuItem value="action">Action</MenuItem>
                  <MenuItem value="adventure">Adventure</MenuItem>
                  <MenuItem value="card">Card game</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>*/}
            <div>
              <Typography variant="h6" gutterBottom>
                Genre
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.8}>
                {allTags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    clickable
                    color={selectedTags.includes(tag) ? "primary" : "default"}
                    variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                    onClick={() => handleTagChange(tag)}
                    disabled={isSubmitting}
                  />
                ))}
              </Stack>
            </div>
            <div>
              <Typography variant="h6" gutterBottom>
                Developers
                <Typography variant="body2">（注:不需要添加你自己）</Typography>
              </Typography>
              <Box sx={{ maxWidth: 400, mb: 2 }}>
                <SearchBar
                  placeholder="搜索用户"
                  thing="user"
                  processOptionFunc={(option: any) => ({
                    label: option.name,
                    id: option.id,
                  })}
                  onSelect={handleSelectDeveloper}
                />
              </Box>
              <Stack spacing={1}>
                {developers.map((dev, idx) => (
                  <Box
                    key={dev.id}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Typography sx={{ flex: 1, pl: 1 }} variant="body1">
                      {dev.name}
                    </Typography>
                    <IconButton
                      aria-label="删除"
                      onClick={() => handleDeleteDeveloper(idx)}
                      size="small"
                      disabled={isSubmitting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </div>
          </div>

          <div className=" min-w-[40%]">
            {/* 右侧上传封面及截图 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cover Image (Required)
              </Typography>
              <Box
                className=" relative flex justify-center items-center bg-neutral-500 cursor-pointer hover:opacity-70 transition-opacity"
                sx={{
                  width: 320,
                  height: 320,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
                onClick={handleCoverClick}
              >
                {cover.url ? (
                  <Box
                    component="img"
                    src={cover.url}
                    alt="Cover"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography variant="body2" className=" select-none">
                    Click to upload a cover image
                  </Typography>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={coverRef}
                  onChange={handleCoverChange}
                  className="hidden"
                  title="Upload an image file"
                  disabled={isSubmitting}
                />
              </Box>
            </Box>
            <Box>
              <Typography variant="h6">Screenshots</Typography>
              <Typography variant="caption" display="block" gutterBottom>
                Screenshots will appear on your game&apos;s page. Optional but highly
                recommended. Upload up to 3 screenshots.
              </Typography>
              <input
                type="file"
                accept="image/*"
                ref={screenshotRef}
                onChange={handleScreenshotChange}
                className="hidden"
                title="Upload a screenshot image"
              />
              {screenshots.length === 0 && (
                <Button
                  variant="contained"
                  onClick={handleScreenshotClick}
                  sx={{ mt: 1 }}
                  disabled={isSubmitting}
                >
                  Add screenshots
                </Button>
              )}
              {/* 游戏截图，作为海报 */}
              <GamePoster
                onDelete={handleScreenshotDelete}
                imageList={screenshots.map((img, index) => ({
                  imgSrc: img.url ?? "",
                  alt: `screenshot_${index}`,
                }))}
              />
              {screenshots.length > 0 && screenshots.length < 3 && (
                <Button
                  variant="contained"
                  onClick={handleScreenshotClick}
                  sx={{ mt: 2 }}
                  disabled={isSubmitting}
                >
                  Add screenshots
                </Button>
              )}
            </Box>
          </div>
        </div>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            size="large"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            } //在按钮左侧动态显示转圈图标
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </Paper>
    </form>
  );
}
