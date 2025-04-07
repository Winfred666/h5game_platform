'use client';
import { createTheme } from '@mui/material/styles';
import { red, pink } from '@mui/material/colors';

const theme = createTheme({
  typography: {
    fontFamily: `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`,
  },
  cssVariables: true,
  palette: {
    primary: red,
    secondary: pink,
  },
});

export default theme;