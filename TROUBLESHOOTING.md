# Troubleshooting Guide

## Error: "We couldn't get an AI reply — try again or use offline mode."

### Common Causes and Solutions

#### 1. **OpenAI API Quota Exceeded** (Most Common)

**Error Code:** `insufficient_quota` or `429`

**Solution:**
- Your OpenAI API key is valid but has no credits remaining
- Add credits to your OpenAI account:
  1. Go to https://platform.openai.com/account/billing
  2. Add payment method and purchase credits
  3. Restart the server

**Alternative:** Use Anthropic API instead:
```bash
# In .env file, comment out OpenAI and add Anthropic:
# OPENAI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
```

#### 2. **Invalid API Key**

**Error Code:** `401` or `Unauthorized`

**Solution:**
- Check that your API key in `.env` is correct
- Verify the key starts with `sk-` (OpenAI) or `sk-ant-` (Anthropic)
- Get a new key from:
  - OpenAI: https://platform.openai.com/api-keys
  - Anthropic: https://console.anthropic.com/

#### 3. **Rate Limit Exceeded**

**Error Code:** `429` (rate_limit)

**Solution:**
- Wait a few minutes and try again
- Check your API usage limits
- Consider upgrading your plan

#### 4. **Network Error**

**Error:** Connection timeout or network error

**Solution:**
- Check your internet connection
- Verify firewall isn't blocking API calls
- Try again in a moment

#### 5. **Server Not Running**

**Error:** Connection refused or can't reach `/api/ai`

**Solution:**
```bash
# Make sure both servers are running:
npm run dev

# Or run separately:
npm run dev:server  # Terminal 1
npm run dev:client  # Terminal 2
```

### Quick Diagnostic

Run this to test your API key:

```bash
node test-api.js
```

Or test directly:

```bash
curl -X POST http://localhost:3001/api/ai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}'
```

Check server logs for detailed error messages.

### Current Status

Based on the error you're seeing, your OpenAI API key has **exceeded its quota**. 

**Immediate Solutions:**

1. **Add Credits to OpenAI:**
   - Visit: https://platform.openai.com/account/billing
   - Add payment method
   - Purchase credits

2. **Use Anthropic Instead:**
   - Get API key: https://console.anthropic.com/
   - Update `.env`:
     ```bash
     ANTHROPIC_API_KEY=sk-ant-your-key-here
     ```
   - Restart server

3. **Use Offline Mode:**
   - The app will show fallback responses
   - AI features will use cached/default responses

### Checking Your API Status

```bash
# Health check
curl http://localhost:3001/api/health

# Should show:
# {"status":"ok","hasOpenAI":true,"hasAnthropic":false}
```

