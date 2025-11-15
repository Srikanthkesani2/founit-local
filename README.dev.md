# FindIt - Development Guide

## AI Integration Setup

This project uses **Google Gemini (FREE)**, OpenAI, or Anthropic for AI-powered features. **Gemini is recommended as it's completely free!**

### Prerequisites

- Node.js 18+ (for native fetch support)
- An API key from [Google AI Studio](https://aistudio.google.com/app/apikey) (FREE - recommended)

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```bash
   # For Gemini (FREE - Recommended)
   GEMINI_API_KEY=your-gemini-api-key-here
   
   # OR for OpenAI (Paid)
   OPENAI_API_KEY=sk-your-actual-api-key-here
   
   # OR for Anthropic (Paid)
   ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
   ```

3. Optional: Configure the model (defaults shown):
   ```bash
   GEMINI_MODEL=gemini-pro
   GEMINI_TEMPERATURE=0.7
   GEMINI_MAX_TOKENS=500
   ```

### Running the Development Server

The project runs two servers concurrently:
- **Frontend (Vite)**: `http://localhost:5173`
- **API Server (Express)**: `http://localhost:3001`

Start both with:
```bash
npm install
npm run dev
```

Or run them separately:
```bash
# Terminal 1: API Server
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

### API Endpoint

#### POST `/api/ai`

Sends a prompt to the configured AI provider and returns a response.

**Request Body:**
```json
{
  "prompt": "Your question or prompt here",
  "userId": "optional-user-id",
  "context": "optional-context-string",
  "response_json_schema": {
    "type": "object",
    "properties": {
      "locations": { "type": "array", "items": { "type": "string" } },
      "tips": { "type": "array", "items": { "type": "string" } }
    }
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "text": "AI response text here",
  "provider": "openai",
  "meta": {
    "model": "gpt-3.5-turbo",
    "tokens": 150,
    "duration": 1234
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "fallback": "Fallback message for UI"
}
```

### Testing the API

#### Using cURL

**Basic request:**
```bash
curl -X POST http://localhost:3001/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are common places to find lost keys on a college campus?"
  }'
```

**With JSON schema:**
```bash
curl -X POST http://localhost:3001/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A user lost: iPhone 13",
    "response_json_schema": {
      "type": "object",
      "properties": {
        "locations": { "type": "array", "items": { "type": "string" } },
        "tips": { "type": "array", "items": { "type": "string" } },
        "category": { "type": "string" }
      }
    }
  }'
```

**Health check:**
```bash
curl http://localhost:3001/api/health
```

#### Using JavaScript (Frontend)

```javascript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Your question here',
    context: 'Optional context',
    response_json_schema: {
      type: 'object',
      properties: {
        locations: { type: 'array', items: { type: 'string' } }
      }
    }
  })
});

const data = await response.json();

if (data.success) {
  console.log('AI Response:', data.text);
  if (data.data) {
    console.log('Structured Data:', data.data);
  }
} else {
  console.error('Error:', data.error);
  console.log('Fallback:', data.fallback);
}
```

### Error Handling

The API returns structured error responses with codes:

- `INVALID_INPUT`: Missing or invalid prompt
- `PROMPT_TOO_SHORT`: Prompt less than 3 characters
- `NO_API_KEY`: No API key configured
- `TIMEOUT`: Request exceeded 15 second timeout
- `API_ERROR`: Error from AI provider
- `INTERNAL_ERROR`: Server error

All error responses include a `fallback` message that the UI can display to users.

### Offline/Development Mode

If no API key is configured, the API returns a friendly error message. The frontend includes fallback responses for development and testing.

### Security Notes

- **Never commit `.env` files** - they contain sensitive API keys
- API keys are never logged or exposed in responses
- All API calls have a 15-second timeout
- Input validation prevents empty or malicious prompts

### Troubleshooting

**"AI service is not configured" error:**
- Check that `.env` file exists and contains `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- Restart the server after adding environment variables

**Timeout errors:**
- The API has a 15-second timeout
- Try a shorter prompt or check your network connection
- Consider using a faster model (e.g., `gpt-3.5-turbo` instead of `gpt-4`)

**CORS errors:**
- The API server includes CORS middleware
- Ensure the frontend is proxying requests through Vite (configured in `vite.config.js`)

**Model not found errors:**
- Verify your API key has access to the requested model
- Check model name spelling (case-sensitive)

### Production Deployment

For production:
1. Set environment variables in your hosting platform (Vercel, Railway, etc.)
2. Ensure the API server is accessible
3. Update the frontend API URL if not using a proxy
4. Consider rate limiting and authentication for the API endpoint

