import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import { useSocket } from '../contexts/SocketContext';

const DownloadProgress: React.FC = () => {
  const { downloads } = useSocket();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'starting':
        return <HourglassEmptyIcon color="info" />;
      case 'downloading':
        return <DownloadIcon color="primary" />;
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <HourglassEmptyIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'starting':
        return 'info';
      case 'downloading':
        return 'primary';
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const activeDownloads = downloads.filter(d => 
    d.status === 'starting' || d.status === 'downloading'
  );

  const recentDownloads = downloads.filter(d => 
    d.status === 'completed' || d.status === 'error'
  ).slice(-5);

  if (downloads.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Download Progress
        </Typography>

        {activeDownloads.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Downloads
            </Typography>
            
            {activeDownloads.map((download) => (
              <Box key={download.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getStatusIcon(download.status)}
                  <Box sx={{ ml: 1, flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>
                      {download.filename || 'Preparing download...'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {download.url}
                    </Typography>
                  </Box>
                  <Chip 
                    label={download.status} 
                    size="small" 
                    color={getStatusColor(download.status) as any}
                  />
                </Box>
                
                {download.status === 'downloading' && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={download.progress} 
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(download.progress)}%
                      </Typography>
                    </Box>
                  </Box>
                )}

                {download.error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {download.error}
                  </Alert>
                )}
              </Box>
            ))}
          </Box>
        )}

        {recentDownloads.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Recent Downloads
            </Typography>
            
            <List dense>
              {recentDownloads.map((download) => (
                <ListItem key={download.id}>
                  <ListItemIcon>
                    {getStatusIcon(download.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={download.filename || 'Unknown file'}
                    secondary={
                      <Box>
                        <Typography variant="caption" component="div">
                          {download.url}
                        </Typography>
                        {download.error && (
                          <Typography variant="caption" color="error">
                            Error: {download.error}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Chip 
                    label={download.status} 
                    size="small" 
                    color={getStatusColor(download.status) as any}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DownloadProgress;
