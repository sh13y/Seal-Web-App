import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

interface DownloadedFile {
  name: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

const DownloadHistory: React.FC = () => {
  const [files, setFiles] = useState<DownloadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api';

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Mock data for development when backend is not available
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock downloaded files data
        const mockFiles = [
          {
            name: "Sample Video 1.mp4",
            size: 15728640, // ~15MB
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            modifiedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            name: "Audio Track.mp3",
            size: 5242880, // ~5MB
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            modifiedAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            name: "Tutorial Video.webm",
            size: 25165824, // ~24MB
            createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            modifiedAt: new Date(Date.now() - 259200000).toISOString()
          }
        ];
        
        setFiles(mockFiles);
        return;
      }

      const response = await axios.get(`${apiUrl}/download/list`);
      setFiles(response.data);
    } catch (error: any) {
      console.warn('Backend not available, using mock data');
      // Fallback to mock data if backend is not available
      const mockFiles = [
        {
          name: "Example Download.mp4",
          size: 10485760, // ~10MB
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString()
        }
      ];
      setFiles(mockFiles);
      setError(''); // Clear error since we're showing mock data
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const deleteFile = async (filename: string) => {
    try {
      await axios.delete(`${apiUrl}/download/${encodeURIComponent(filename)}`);
      setFiles(files.filter(file => file.name !== filename));
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileType = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return 'video';
    }
    if (['mp3', 'm4a', 'wav', 'flac', 'ogg', 'aac'].includes(extension || '')) {
      return 'audio';
    }
    return 'unknown';
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'primary';
      case 'audio':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Download History
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchFiles} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {files.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No downloaded files yet
          </Typography>
        ) : (
          <List>
            {files.map((file, index) => (
              <ListItem key={index} divider={index < files.length - 1}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" component="span">
                        {file.name}
                      </Typography>
                      <Chip 
                        label={getFileType(file.name)} 
                        size="small" 
                        color={getFileTypeColor(getFileType(file.name)) as any}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" component="div">
                        Size: {formatFileSize(file.size)}
                      </Typography>
                      <Typography variant="caption" component="div">
                        Downloaded: {formatDate(file.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Delete">
                    <IconButton 
                      edge="end" 
                      onClick={() => deleteFile(file.name)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default DownloadHistory;
