import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import SearchPage from './components/SearchPage';

// Material Design 2 Dark Theme
// Based on m2.material.io specifications
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC',
      light: '#E7B9FF',
      dark: '#8858C8',
    },
    secondary: {
      main: '#03DAC6',
      light: '#66FFF9',
      dark: '#00A896',
    },
    error: {
      main: '#CF6679',
    },
    warning: {
      main: '#FFB74D',
    },
    info: {
      main: '#81D4FA',
    },
    success: {
      main: '#81C784',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          borderRadius: '12px 12px 0 0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SearchPage />
    </ThemeProvider>
  );
}

export default App;
