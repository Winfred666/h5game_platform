import React from "react";
import { Paper, Container, Box, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import LiveTvIcon from '@mui/icons-material/LiveTv';
import GitHubIcon from '@mui/icons-material/GitHub';
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <Paper
      elevation={3}
      className=" py-4 lg:px-4"
      component="footer"
    >
      <Container maxWidth="lg">
        {/* Main content using Tailwind grid instead of MUI Grid */}
        <Box className="flex justify-center gap-4">
          <Link href="https://www.qsc.zju.edu.cn" className="cursor-pointer text-[var(--mui-palette-text-secondary)] hover:text-red-600">
            <HomeIcon />
          </Link>
          <Link href="mailto:tech@zjuqsc.com" className="cursor-pointer text-[var(--mui-palette-text-secondary)] hover:text-pink-600">
            <EmailIcon />
          </Link>
          <Link href="https://space.bilibili.com/104427247" className="cursor-pointer text-[var(--mui-palette-text-secondary)] hover:text-cyan-600">
            <LiveTvIcon />
          </Link>
          <Link href="https://github.com/Winfred666/h5game_platform" className="cursor-pointer text-[var(--mui-palette-text-secondary)] hover:text-purple-600">
            <GitHubIcon/>
          </Link>
        </Box>

        {/* Copyright */}
        <Typography
         sx={{ marginTop: 2 }}
         className="text-center text-[var(--mui-palette-text-secondary)]">
          浙ICP备05074421号-1 ©2000-{new Date().getFullYear()} 求是潮
        </Typography>
      </Container>
    </Paper>
  );
};

export default Footer;
