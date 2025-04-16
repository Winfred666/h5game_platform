import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import Link from 'next/link';

export default function NavBar() {
  return (
    <div className=" z-10">
      <AppBar elevation={1} position="static" color="secondary">
        <Toolbar className="gap-10 h-full">
          <Link className="flex flex-row" href="/" passHref>
          <SportsEsportsIcon fontSize='large' color="primary" />
          </Link>
          <Typography className="select-none" variant="h6" component="div">
            ZJU H5游戏分享平台
          </Typography>
          <div className="navbar-button navbar-active-button"> 登录 </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
