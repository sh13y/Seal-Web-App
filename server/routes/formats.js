const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

// GET /api/formats?url=<video_url> - Get available formats for a video
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
      '--list-formats',
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
          // Parse the format list
          const lines = output.split('\n');
          const formats = [];
          let startParsing = false;

          for (const line of lines) {
            if (line.includes('format code') && line.includes('extension')) {
              startParsing = true;
              continue;
            }
            
            if (startParsing && line.trim()) {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 3) {
                const formatCode = parts[0];
                const extension = parts[1];
                const resolution = parts[2];
                const note = parts.slice(3).join(' ');
                
                formats.push({
                  format_code: formatCode,
                  extension: extension,
                  resolution: resolution,
                  note: note,
                  type: extension.includes('m4a') || extension.includes('mp3') || 
                        extension.includes('wav') || extension.includes('ogg') ? 'audio' : 'video'
                });
              }
            }
          }

          // Group formats by type
          const videoFormats = formats.filter(f => f.type === 'video');
          const audioFormats = formats.filter(f => f.type === 'audio');

          res.json({
            video_formats: videoFormats,
            audio_formats: audioFormats,
            all_formats: formats
          });

        } catch (parseError) {
          console.error('Error parsing formats:', parseError);
          res.status(500).json({ 
            error: 'Failed to parse format information',
            details: parseError.message 
          });
        }
      } else {
        console.error('yt-dlp formats error:', error);
        res.status(500).json({ 
          error: 'Failed to get format information',
          details: error 
        });
      }
    });

  } catch (error) {
    console.error('Format extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract format information',
      details: error.message 
    });
  }
});

// GET /api/formats/quality-presets - Get common quality presets
router.get('/quality-presets', (req, res) => {
  const presets = {
    video: [
      { value: '2160', label: '4K (2160p)', description: 'Ultra High Definition' },
      { value: '1440', label: '2K (1440p)', description: 'Quad HD' },
      { value: '1080', label: 'Full HD (1080p)', description: 'High Definition' },
      { value: '720', label: 'HD (720p)', description: 'High Definition' },
      { value: '480', label: 'SD (480p)', description: 'Standard Definition' },
      { value: '360', label: 'Low (360p)', description: 'Low Quality' },
      { value: 'best', label: 'Best Available', description: 'Highest quality available' },
      { value: 'worst', label: 'Worst Available', description: 'Lowest quality available' }
    ],
    audio: [
      { value: 'mp3', label: 'MP3', description: 'Standard audio format' },
      { value: 'm4a', label: 'M4A', description: 'High quality audio' },
      { value: 'wav', label: 'WAV', description: 'Uncompressed audio' },
      { value: 'flac', label: 'FLAC', description: 'Lossless audio' },
      { value: 'ogg', label: 'OGG', description: 'Open source audio' },
      { value: 'best', label: 'Best Available', description: 'Highest quality available' }
    ]
  };

  res.json(presets);
});

module.exports = router;
