"use client"
import { createTheme } from '@mui/material/styles';

const itch = {
  main: '#e54664',
  50: '#fce8ec',
  100: '#f8c7cf',
  200: '#f3a2b1',
  300: '#ee7d92',
  400: '#ea617b',
  500: '#e54664', // primary color
  600: '#df546b',
  700: '#d73e52',
  800: '#d13448',
  900: '#c81f35',
};


const theme = createTheme({
  colorSchemes:{
    light:{
      palette: {
        primary: itch,
        secondary:{
          main: '#fff',
        },
      },
    },
    dark:{
      palette: {
        primary: itch,
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
