# Google Gemini API Setup (FREE)

## Why Gemini?

- ✅ **100% FREE** - No credit card required
- ✅ Generous free tier
- ✅ Fast and reliable
- ✅ Easy to set up

## Getting Your Gemini API Key

1. **Go to Google AI Studio:**
   - Visit: https://aistudio.google.com/app/apikey

2. **Sign in with your Google account**

3. **Create API Key:**
   - Click "Create API Key"
   - Select "Create API key in new project" (or existing project)
   - Copy your API key

4. **Add to .env file:**
   ```bash
   GEMINI_API_KEY=your-api-key-here
   ```

## Configuration

Edit your `.env` file:

```bash
# Required
GEMINI_API_KEY=your-api-key-here

# Optional (defaults shown)
GEMINI_MODEL=gemini-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=500
```

## Available Models

- `gemini-pro` - Best for text generation (default)
- `gemini-pro-vision` - For image analysis (future feature)

## Testing

```bash
# Test the API
curl -X POST http://localhost:3001/api/ai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a haiku about AI"}'
```

Or use the test script:
```bash
node test-api.js
```

## Free Tier Limits

- **60 requests per minute** (very generous!)
- **1,500 requests per day**
- No credit card required

## Troubleshooting

**"Invalid API key" error:**
- Make sure you copied the full key
- Check for extra spaces in `.env` file
- Restart the server after updating `.env`

**"Quota exceeded" error:**
- You've hit the free tier limit
- Wait a few minutes and try again
- Free tier resets daily

## Migration from OpenAI

If you were using OpenAI before:

1. Get Gemini API key from https://aistudio.google.com/app/apikey
2. Update `.env`:
   ```bash
   # Comment out OpenAI
   # OPENAI_API_KEY=...
   
   # Add Gemini
   GEMINI_API_KEY=your-gemini-key
   ```
3. Restart server: `npm run dev`

That's it! The app will automatically use Gemini.

