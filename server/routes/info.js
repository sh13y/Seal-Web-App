const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

// GET /api/info?url=<video_url> - Get video information
router.get('/', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Basic URL validation - let yt-dlp handle specific format validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.' });
    }

    const args = [
      '--dump-json',
      '--no-playlist',
      url
    ];

    const ytdlp = spawn('yt-dlp', args);
    let output = '';
    let error = '';

    ytdlp.stdout.on('data', (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      error += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        try {
          const videoInfo = JSON.parse(output);
          
          // Extract relevant information
          const info = {
            id: videoInfo.id,
            title: videoInfo.title,
            description: videoInfo.description,
            duration: videoInfo.duration,
            uploader: videoInfo.uploader,
            upload_date: videoInfo.upload_date,
            view_count: videoInfo.view_count,
            thumbnail: videoInfo.thumbnail,
            webpage_url: videoInfo.webpage_url,
            extractor: videoInfo.extractor,
            formats: videoInfo.formats ? videoInfo.formats.map(format => ({
              format_id: format.format_id,
              ext: format.ext,
              quality: format.quality,
              filesize: format.filesize,
              width: format.width,
              height: format.height,
              fps: format.fps,
              vcodec: format.vcodec,
              acodec: format.acodec,
              format_note: format.format_note
            })) : []
          };

          res.json(info);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          res.status(500).json({ 
            error: 'Failed to parse video information',
            details: parseError.message 
          });
        }
      } else {
        console.error('yt-dlp error:', error);
        res.status(500).json({ 
          error: 'Failed to get video information',
          details: error 
        });
      }
    });

  } catch (error) {
    console.error('Info extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract video information',
      details: error.message 
    });
  }
});

// GET /api/info/playlist?url=<playlist_url> - Get playlist information
router.get('/playlist', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const args = [
      '--flat-playlist',
      '--dump-json',
      url
    ];

    const ytdlp = spawn('yt-dlp', args);
    let output = '';
    let error = '';

    ytdlp.stdout.on('data', (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      error += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        try {
          const lines = output.trim().split('\n').filter(line => line.trim());
          const playlist = lines.map(line => JSON.parse(line));
          
          res.json({
            entries: playlist.map(entry => ({
              id: entry.id,
              title: entry.title,
              url: entry.url,
              duration: entry.duration,
              uploader: entry.uploader
            }))
          });
        } catch (parseError) {
          console.error('Error parsing playlist JSON:', parseError);
          res.status(500).json({ 
            error: 'Failed to parse playlist information',
            details: parseError.message 
          });
        }
      } else {
        console.error('yt-dlp playlist error:', error);
        res.status(500).json({ 
          error: 'Failed to get playlist information',
          details: error 
        });
      }
    });

  } catch (error) {
    console.error('Playlist extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract playlist information',
      details: error.message 
    });
  }
});

module.exports = router;
