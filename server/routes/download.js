const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const router = express.Router();

// POST /api/download
router.post('/', async (req, res) => {
  try {
    const { url, format, quality, audioOnly, outputPath } = req.body;
    const io = req.app.get('socketio');

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Basic URL validation - let yt-dlp handle specific format validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.' });
    }

    const downloadsDir = path.join(__dirname, '../../downloads');
    await fs.ensureDir(downloadsDir);

    // Build yt-dlp command with better YouTube handling
    const args = [];
    
    // Add user agent and headers to bypass some restrictions
    args.push('--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    args.push('--add-header', 'Accept-Language:en-US,en;q=0.9');
    
    if (audioOnly) {
      args.push('-f', 'bestaudio/best');
      args.push('--extract-audio');
      args.push('--audio-format', format || 'mp3');
    } else {
      if (quality && quality !== 'best') {
        args.push('-f', `best[height<=${quality}]/best`);
      } else {
        // Use 'b' instead of 'best' to suppress warning
        args.push('-f', 'b');
      }
    }

    args.push('-o', path.join(downloadsDir, '%(title)s.%(ext)s'));
    args.push('--no-playlist');
    args.push('--progress');
    args.push(url);

    const downloadId = Date.now().toString();
    
    // Spawn yt-dlp process
    const ytdlp = spawn('yt-dlp', args);

    let downloadInfo = {
      id: downloadId,
      url,
      status: 'starting',
      progress: 0,
      filename: '',
      error: null
    };

    io.emit('download-start', downloadInfo);

    ytdlp.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('yt-dlp stdout:', output);
      
      // Parse progress information
      const progressMatch = output.match(/(\d+\.\d+)%/);
      if (progressMatch) {
        downloadInfo.progress = parseFloat(progressMatch[1]);
        downloadInfo.status = 'downloading';
        io.emit('download-progress', downloadInfo);
      }
      
      // Extract filename
      const filenameMatch = output.match(/\[download\] Destination: (.+)/);
      if (filenameMatch) {
        downloadInfo.filename = path.basename(filenameMatch[1]);
      }
    });

    ytdlp.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('yt-dlp stderr:', error);
      downloadInfo.error = error;
      downloadInfo.status = 'error';
      io.emit('download-error', downloadInfo);
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        downloadInfo.status = 'completed';
        downloadInfo.progress = 100;
        io.emit('download-complete', downloadInfo);
      } else {
        downloadInfo.status = 'error';
        downloadInfo.error = `Process exited with code ${code}`;
        io.emit('download-error', downloadInfo);
      }
    });

    res.json({
      success: true,
      downloadId,
      message: 'Download started'
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Download failed',
      details: error.message 
    });
  }
});

// GET /api/download/list - List downloaded files
router.get('/list', async (req, res) => {
  try {
    const downloadsDir = path.join(__dirname, '../../downloads');
    const files = await fs.readdir(downloadsDir);
    
    const fileList = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(downloadsDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
    );

    res.json(fileList);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// DELETE /api/download/:filename - Delete a downloaded file
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../downloads', filename);
    
    // Security check - ensure file is in downloads directory
    if (!filePath.startsWith(path.join(__dirname, '../../downloads'))) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    await fs.remove(filePath);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
