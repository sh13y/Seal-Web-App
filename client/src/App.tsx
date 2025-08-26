import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box } from '@mui/material';
import Header from './components/Header';
import DownloadForm from './components/DownloadForm';
import DownloadProgress from './components/DownloadProgress';
import DownloadHistory from './components/DownloadHistory';
import { SocketProvider } from './contexts/SocketContext';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <div className="App">
          <Header />
          <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
              <DownloadForm />
              <DownloadProgress />
              <DownloadHistory />
            </Box>
          </Container>
        </div>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
