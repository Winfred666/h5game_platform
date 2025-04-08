"use client"
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

const theme = createTheme({
  colorSchemes:{
    light:{
      palette: {
        primary: red,
        secondary:{
          main: '#fff',
        },
      },
    },
    dark:{
      palette: {
        primary: red,
        secondary:{
          main: '#000',
        },
      }
    }
  },
  typography: {
    fontFamily: `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`,
  },
  cssVariables: true,
});

export default theme;