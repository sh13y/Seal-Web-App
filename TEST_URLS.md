# Test URLs for Seal Web App

## ✅ Recommended Test URLs (Usually Work)

### Vimeo (Most Reliable)
```
https://vimeo.com/147365861
https://vimeo.com/74295082
https://vimeo.com/29950141
```

### YouTube (Public Domain/Creative Commons)
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://www.youtube.com/watch?v=C0DPdy98e4c
https://www.youtube.com/watch?v=9bZkp7q19f0
```

### Archive.org (Always Works)
```
https://archive.org/details/BigBuckBunny_124
https://archive.org/details/ElephantsDream
```

### Test Commands

#### Test API Directly
```bash
# Test video info
curl -s "http://localhost:5000/api/info?url=https://vimeo.com/147365861"

# Test download (replace with actual URL)
curl -X POST -H "Content-Type: application/json" \
  -d '{"url":"https://vimeo.com/147365861","audioOnly":false,"quality":"720"}' \
  http://localhost:5000/api/download
```

#### Manual yt-dlp Testing
```bash
# Test if yt-dlp works directly
yt-dlp --list-formats "https://vimeo.com/147365861"

# Download test
yt-dlp -f best "https://vimeo.com/147365861" -o "test_%(title)s.%(ext)s"
```

## 🚨 Common Issues

### YouTube Bot Protection
- **Error**: "Sign in to confirm you're not a bot"
- **Solution**: Try different videos or use other platforms
- **Workaround**: Use Vimeo, Archive.org, or other platforms

### Age-Restricted Content
- **Error**: "Video requires authentication"
- **Solution**: Use public, unrestricted videos

### Geo-Blocked Content
- **Error**: "Video not available in your country"
- **Solution**: Try different videos or platforms

## 🎯 Best Practices

1. **Start with Vimeo** - Most reliable for testing
2. **Use public domain content** - Fewer restrictions
3. **Avoid copyrighted material** - May have additional protections
4. **Test with short videos first** - Faster feedback

## 📊 Platform Reliability

| Platform | Reliability | Notes |
|----------|-------------|-------|
| Vimeo | ⭐⭐⭐⭐⭐ | Most consistent |
| Archive.org | ⭐⭐⭐⭐⭐ | Always works |
| YouTube | ⭐⭐⭐☆☆ | Hit or miss due to bot protection |
| TikTok | ⭐⭐⭐☆☆ | Varies by content |
| Twitter | ⭐⭐☆☆☆ | Often restricted |
