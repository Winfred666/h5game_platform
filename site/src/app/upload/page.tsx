"use client";

import { useState, useRef } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function NewGamePage() {
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

  //注：在form的提交时对应的handleSubmit函数中,应当将cover和screenshots的file内容传递给服务器

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //阻止默认提交行为
    const formData = new FormData(e.target as HTMLFormElement); //e.target是当前form元素,将其转换为HTMLFormElement类型
    //将整个表单中的所有可提交字段（即带有name属性的,如input,select,textarea等）自动收集并填充到FormData对象中

    // 将cover和screenshots添加到formData中
    if (cover.file) formData.append("cover", cover.file);
    screenshots.forEach((screenshot, idx) => {
      if (screenshot.file)
        formData.append(`screenshot_${idx}`, screenshot.file);
    });

    for (let sth of formData.keys()) {
      console.log(sth, formData.get(sth));
    }
    // 发送POST请求到服务器
    try {
      const response = await fetch("/api/game/new", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      console.log(data); // 处理服务器响应
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Paper className="m-10 p-4" variant="outlined">
      <Typography variant="h4" gutterBottom>
        Create a New Project
      </Typography>
      <div className=" flex flex-row justify-start gap-10">
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
        />
        <TextField
          id="tagline"
          name="tagline"
          label="Short description or tagline"
          placeholder="Optional"
          variant="outlined"
          fullWidth
          margin="normal"
          helperText="Shown when linking to your project. Avoid duplicating the title."
        />
        <FormControl fullWidth variant="outlined" margin="normal" required>
          <InputLabel id="kind-label">Kind of project</InputLabel>
          <Select
            labelId="kind-label"
            id="kind"
            name="kind"
            value={kind}
            onChange={handleKindChange}
            label="Kind of project"
          >
            <MenuItem value="downloadable">
              Downloadable - You only have files to be downloaded
            </MenuItem>
            <MenuItem value="html">
              HTML - You have a ZIP or HTML file that will be played in the
              browser
            </MenuItem>
          </Select>
        </FormControl>

        {/* 文件上传 */}
        <Box sx={{ mt: 2 }}>
          {kind === "html" && (
            <Typography variant="body1" gutterBottom>
              Upload a ZIP file containing your game. There must be an
              index.html file in the ZIP. Or upload a .html file that contains
              your entire game.
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
          />
          <Button variant="contained" onClick={handleUploadClick}>
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
            <FormControl fullWidth variant="outlined" margin="normal" required>
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
              >
                <MenuItem value="embed_in_page">Embed in page</MenuItem>
                <MenuItem value="fullscreen">
                  Click to launch in fullscreen
                </MenuItem>
              </Select>
            </FormControl>
            {runKind === "embed_in_page" && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Viewport dimensions</Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <TextField
                    id="width"
                    name="width"
                    placeholder="640"
                    defaultValue="640"
                    variant="outlined"
                    sx={{ width: 100, mr: 1 }}
                  />
                  <Typography variant="body1">px *</Typography>
                  <TextField
                    id="height"
                    name="height"
                    placeholder="360"
                    defaultValue="360"
                    variant="outlined"
                    sx={{ width: 100, mx: 1 }}
                  />
                  <Typography variant="body1">px</Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
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
          />
          <FormControl fullWidth variant="outlined" margin="normal" required>
            <InputLabel id="genre-label">Genre</InputLabel>
            <Select labelId="genre-label" id="genre" name="genre" label="Genre" defaultValue="">
              <MenuItem value="">No genre</MenuItem>
              <MenuItem value="action">Action</MenuItem>
              <MenuItem value="adventure">Adventure</MenuItem>
              <MenuItem value="card">Card game</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>
        </div>

        <div>
        {/* 右侧上传封面及截图 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cover Image
          </Typography>
          <Box
            sx={{
              position: "relative",
              width: 320,
              height: 320,
              border: "1px solid #ccc",
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor: "#f5f5f5",
            }}
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
                  transition: "opacity 0.3s",
                  "&:hover": { opacity: 0.7 },
                }}
              />
            ) : null}
            <Button
              variant="contained"
              color="error"
              onClick={handleCoverClick}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0,
                transition: "opacity 0.3s",
                "&:hover": { opacity: 1 },
                "&:focus": { opacity: 1 },
              }}
            >
              Upload cover image
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={coverRef}
              onChange={handleCoverChange}
              className="hidden"
              title="Upload an image file"
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="h6">Screenshots</Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Screenshots will appear on your game's page. Optional but highly
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
            >
              Add screenshots
            </Button>
          )}
          {screenshots.map((img, idx) => (
            <Box key={idx} sx={{ position: "relative", mt: 2 }}>
              <Box
                component="img"
                src={img.url || undefined}
                alt={`Screenshot ${idx}`}
                sx={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              />
              <IconButton
                onClick={() => handleScreenshotDelete(idx)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(255,255,255,0.7)",
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          {screenshots.length > 0 && screenshots.length < 3 && (
            <Button
              variant="contained"
              onClick={handleScreenshotClick}
              sx={{ mt: 2 }}
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
          >
            Submit
          </Button>
        </Box>

      </Paper>
    </form>
  );
}
