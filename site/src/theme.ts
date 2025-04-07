'use client';
import { createTheme } from '@mui/material/styles';
import { red, pink } from '@mui/material/colors';

const isDarkPreference = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const theme = createTheme({
  typography: {
    fontFamily: `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`,
  },
  cssVariables: true,
  palette: {
    mode: isDarkPreference ? 'dark' : 'light',
    primary: red,
    secondary: pink,
  },
});

export default theme;