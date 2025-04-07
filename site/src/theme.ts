'use client';
import { createTheme } from '@mui/material/styles';
import { red, pink } from '@mui/material/colors';

const theme = createTheme({
  colorSchemes:{
    light:{
      palette: {
        primary: red,
        secondary: pink,
      },
    },
    dark:{
      palette: {
        primary: red,
        secondary: pink,
      }
    }
  },
  typography: {
    fontFamily: `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`,
  },
  cssVariables: true,
});

export default theme;