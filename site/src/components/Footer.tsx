import React from "react";
import { Paper, Container, Box, Typography, Icon, Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import LiveTvIcon from '@mui/icons-material/LiveTv';
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <Paper
      elevation={3}
      className="mt-12 py-8 px-4 bg-gray-100"
      component="footer"
    >
      <Container maxWidth="lg">
        {/* Main content using Tailwind grid instead of MUI Grid */}
        <Box className="flex justify-center">
          <Link href="/" className="mx-2 cursor-pointer text-gray-600 hover:text-red-600">
            <HomeIcon />
          </Link>
          <Link href="mailto:tech@zjuqsc.com" className="mx-2 cursor-pointer text-gray-600 hover:text-pink-600">
            <EmailIcon />
          </Link>
          <Link href="https://space.bilibili.com/104427247" className="mx-2 cursor-pointer text-gray-600 hover:text-cyan-600">
            <LiveTvIcon />
          </Link>
        </Box>

        {/* Copyright */}
        <Typography className="text-center mt-6 text-gray-600">
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </Typography>
      </Container>
    </Paper>
  );
};

export default Footer;
