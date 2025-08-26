import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Chip,
  Alert
} from '@mui/material';
import { Download as DownloadIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon } from '@mui/icons-material';
import axios from 'axios';

const Header: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiUrl = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';
        await axios.get(`${apiUrl}/formats/quality-presets`);
        setBackendStatus('connected');
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    checkBackend();
    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <DownloadIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Seal Web App
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label="Video Downloader" 
              variant="outlined" 
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
            />
            <Chip 
              label={backendStatus === 'connected' ? 'Online' : backendStatus === 'disconnected' ? 'Offline' : 'Checking...'}
              color={backendStatus === 'connected' ? 'success' : backendStatus === 'disconnected' ? 'error' : 'default'}
              size="small"
              icon={backendStatus === 'connected' ? <CheckCircleIcon /> : backendStatus === 'disconnected' ? <WarningIcon /> : undefined}
            />
          </Box>
        </Toolbar>
      </AppBar>
      
      {backendStatus === 'disconnected' && (
        <Alert 
          severity="warning" 
          sx={{ mb: 0, borderRadius: 0 }}
        >
          <strong>Backend Offline:</strong> Server not responding. Please ensure the backend server is running.
          <br />
          <strong>Setup:</strong> Run <code>npm run dev</code> in the root directory.
        </Alert>
      )}
    </>
  );
};

export default Header;
