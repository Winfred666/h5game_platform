"use client";

import { useState, useRef, useEffect} from "react";
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
  Stack
} from "@mui/material";
import GamePoster from "@/components/GamePosters";
import GameTags from "../../../../public/mocks/GameTags"
import { useRouter } from "next/router"
import { IGame, IOnlineEmbed, IGameTag } from '@/types/igame';
//import { getGameById } from "@/services/game";

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

  // const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]); // 存储所有的标签
  // const getTags = async () => {
  //   // 发送GET请求到服务器
  //   try {
  //     const response = await fetch("/tag", {
  //       method: "GET",
  //     });
  //     if (!response.ok) throw new Error("Network response was not ok");
  //     const tags = await response.json();
  //     setAllTags(tags);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // }
  // // 在组件加载时调用 getTags
  // useEffect(() => {
  //   getTags();
  // }, []);
  const allTags = GameTags;// 存储所有的标签
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);//记录所有已选择的tag的id.

  const router = useRouter();
  const { gameId } = router.query;
  const [game, setGame] = useState<IGame>();
  const getGamebyId = async () => {
    try {
      const response = await fetch(`/game?id=${gameId}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const game = await response.json();
      //console.log(game);
      if(game) {
        setGame(game);
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  };
  useEffect(() => {
    getGamebyId();
    if (game?.tags) {
      setSelectedTags(game.tags.map((tag: IGameTag) => tag.id))
    }
  }, []);
 
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
    setSelectedTags((prevSelected) =>
      prevSelected.includes(tag)
        ? prevSelected.filter((t) => t !== tag) // 取消选中
        : [...prevSelected, tag]               // 添加选中
    )
  }

  //注：在form的提交时对应的handleSubmit函数中,应当将cover和screenshots的file内容传递给服务器,SelectTags也要传递

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
    if (selectedTags.length > 0) formData.append("tags", selectedTags.join(","));
    //传递的是逗号分隔的字符串数组,服务器端想转换回来需要const tags = JSON.parse(req.body.tags);

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
              defaultValue={game?.title}
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
            <FormControl fullWidth variant="outlined" margin="normal" required>
              <InputLabel id="kind-label">Kind of project</InputLabel>
              <Select
                labelId="kind-label"
                id="kind"
                name="kind"
                value={kind}
                onChange={handleKindChange}
                label="Kind of project"
                defaultValue={ (game?.online) ? "html" : "dowloadable"}
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
                title="You can re-upload your game file here"
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
                    defaultValue={(typeof game?.online === "string") ? "fullscreen" : "embed_in_page"}
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
                        defaultValue={(game?.online as IOnlineEmbed).width}
                        variant="outlined"
                        sx={{ width: 100, mr: 1 }}
                      />
                      <Typography variant="body1">px *</Typography>
                      <TextField
                        id="height"
                        name="height"
                        placeholder="360"
                        defaultValue={(game?.online as IOnlineEmbed).height}
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
                defaultValue={game?.description}
              />
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
              <Typography variant="h6" gutterBottom>
                Genre
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {allTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    clickable
                    color={selectedTags.includes(tag.id) ? 'primary' : 'default'}
                    variant={selectedTags.includes(tag.id) ? 'filled' : 'outlined'}
                    onClick={() => handleTagChange(tag.id)}
                    className="mb-1 mt-1"
                  />
                ))}
              </Stack>
            </Box>
          </div>

          <div className=" min-w-[40%]">
            {/* 右侧上传封面及截图 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cover Image
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
                  /*<Typography variant="body2" className=" select-none">
                    Click to upload a cover image
                  </Typography>*/
                  <Box>
                    <Box
                      component="img"
                      src={game?.cover_image}
                      alt="Cover you upload before"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Typography variant="body2">
                      You need to re-upload a cover image.
                    </Typography>
                  </Box>
                )}
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
              {/* 游戏截图，作为海报 */}
              <GamePoster
                onDelete={handleScreenshotDelete}
                imageList={screenshots.map((img, index) => ({
                  imgSrc: img.url || "",
                  alt: `screenshot_${index}`,
                }))}
              />
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
