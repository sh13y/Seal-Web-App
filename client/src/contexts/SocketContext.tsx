import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface DownloadInfo {
  id: string;
  url: string;
  status: 'starting' | 'downloading' | 'completed' | 'error';
  progress: number;
  filename: string;
  error: string | null;
}

interface SocketContextType {
  socket: Socket | null;
  downloads: DownloadInfo[];
  addDownload: (download: DownloadInfo) => void;
  updateDownload: (id: string, updates: Partial<DownloadInfo>) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [downloads, setDownloads] = useState<DownloadInfo[]>([]);

  useEffect(() => {
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5000';
    
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('download-start', (download: DownloadInfo) => {
      setDownloads(prev => [...prev, download]);
    });

    newSocket.on('download-progress', (download: DownloadInfo) => {
      setDownloads(prev => 
        prev.map(d => d.id === download.id ? { ...d, ...download } : d)
      );
    });

    newSocket.on('download-complete', (download: DownloadInfo) => {
      setDownloads(prev => 
        prev.map(d => d.id === download.id ? { ...d, ...download } : d)
      );
    });

    newSocket.on('download-error', (download: DownloadInfo) => {
      setDownloads(prev => 
        prev.map(d => d.id === download.id ? { ...d, ...download } : d)
      );
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const addDownload = (download: DownloadInfo) => {
    setDownloads(prev => [...prev, download]);
  };

  const updateDownload = (id: string, updates: Partial<DownloadInfo>) => {
    setDownloads(prev => 
      prev.map(d => d.id === id ? { ...d, ...updates } : d)
    );
  };

  return (
    <SocketContext.Provider value={{ socket, downloads, addDownload, updateDownload }}>
      {children}
    </SocketContext.Provider>
  );
};
