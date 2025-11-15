import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request timeout (15 seconds)
const REQUEST_TIMEOUT = 15000;

/**
 * AI API Endpoint
 * POST /api/ai
 * Body: { prompt: string, userId?: string, context?: string, response_json_schema?: object }
 */
app.post('/api/ai', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { prompt, userId, context, response_json_schema } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid prompt. Please provide a non-empty string.',
        code: 'INVALID_INPUT'
      });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is too short. Please provide at least 3 characters.',
        code: 'PROMPT_TOO_SHORT'
      });
    }

    // Check for API keys (prioritize Gemini as it's free)
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (!geminiKey && !openaiKey && !anthropicKey) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not configured. Please set GEMINI_API_KEY (recommended - free), OPENAI_API_KEY, or ANTHROPIC_API_KEY in your .env file.',
        code: 'NO_API_KEY',
        fallback: 'We couldn\'t get an AI reply — try again or use offline mode.'
      });
    }

    // Determine provider (prioritize Gemini, then OpenAI, then Anthropic)
    let provider, apiKey;
    if (geminiKey) {
      provider = 'gemini';
      apiKey = geminiKey;
    } else if (openaiKey) {
      provider = 'openai';
      apiKey = openaiKey;
    } else {
      provider = 'anthropic';
      apiKey = anthropicKey;
    }

    // Build the full prompt with context
    let fullPrompt = trimmedPrompt;
    if (context) {
      fullPrompt = `${context}\n\n${trimmedPrompt}`;
    }

    // Prepare request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    let response;
    let rawResponse;

    try {
      if (provider === 'gemini') {
        response = await callGemini(fullPrompt, apiKey, response_json_schema, controller.signal);
        rawResponse = response;
      } else if (provider === 'openai') {
        response = await callOpenAI(fullPrompt, apiKey, response_json_schema, controller.signal);
        rawResponse = response;
      } else {
        response = await callAnthropic(fullPrompt, apiKey, response_json_schema, controller.signal);
        rawResponse = response;
      }

      clearTimeout(timeoutId);

      // Handle structured response
      if (response_json_schema && response.content) {
        try {
          // Try to parse JSON from response
          const parsed = typeof response.content === 'string' 
            ? JSON.parse(response.content) 
            : response.content;
          
          return res.json({
            success: true,
            text: response.content,
            data: parsed,
            provider,
            meta: {
              model: response.model || 'unknown',
              tokens: response.usage?.total_tokens || null,
              duration: Date.now() - startTime
            }
          });
        } catch (parseError) {
          // If JSON parsing fails, return as text
          return res.json({
            success: true,
            text: response.content,
            provider,
            meta: {
              model: response.model || 'unknown',
              duration: Date.now() - startTime
            }
          });
        }
      }

      // Return text response
      return res.json({
        success: true,
        text: response.content || response.text || 'No response generated',
        provider,
        meta: {
          model: response.model || 'unknown',
          tokens: response.usage?.total_tokens || null,
          duration: Date.now() - startTime
        },
        raw: rawResponse
      });

    } catch (apiError) {
      clearTimeout(timeoutId);
      
      if (apiError.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          error: 'Request timeout. The AI service took too long to respond.',
          code: 'TIMEOUT',
          fallback: 'We couldn\'t get an AI reply — try again or use offline mode.'
        });
      }

      // Log error details (sanitized) - more detailed logging
      const errorMessage = apiError.message || 'Unknown error';
      console.error(`[AI API Error] Provider: ${provider}`);
      console.error(`[AI API Error] Message: ${errorMessage}`);
      console.error(`[AI API Error] Stack: ${apiError.stack?.substring(0, 200)}`);
      
      // Provide more helpful error messages
      let userMessage = 'Failed to get AI response. Please try again.';
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid')) {
        userMessage = 'Invalid API key. Please check your OPENAI_API_KEY in .env file.';
      } else if (errorMessage.includes('quota exceeded') || errorMessage.includes('insufficient_quota')) {
        userMessage = 'OpenAI API quota exceeded. Please add credits to your OpenAI account at https://platform.openai.com/account/billing or configure ANTHROPIC_API_KEY as an alternative.';
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        userMessage = 'Rate limit exceeded. Please try again in a moment.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage = 'Network error. Please check your internet connection.';
      }
      
      return res.status(500).json({
        success: false,
        error: userMessage,
        code: 'API_ERROR',
        fallback: 'We couldn\'t get an AI reply — try again or use offline mode.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }

  } catch (error) {
    console.error('[AI API] Unexpected error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      fallback: 'We couldn\'t get an AI reply — try again or use offline mode.'
    });
  }
});

/**
 * Call Google Gemini API (Free)
 * Uses the Gemini REST API
 */
async function callGemini(prompt, apiKey, responseJsonSchema, signal) {
  // Use gemini-2.5-flash (fast and free) or gemini-2.5-pro (more capable)
  // Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  // Ensure model name includes 'models/' prefix
  const model = modelName.startsWith('models/') ? modelName : `models/${modelName}`;
  // Use v1 API
  const url = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
      maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '1024'), // Increased default for better responses
      topP: 0.8,
      topK: 40
    }
  };

  // Add JSON schema if provided
  if (responseJsonSchema) {
    requestBody.generationConfig.responseMimeType = 'application/json';
    // Add instruction to return JSON
    requestBody.contents[0].parts[0].text += '\n\nPlease respond with valid JSON matching the requested schema.';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `Gemini API error: ${response.status}`;
    const errorCode = errorData.error?.code || '';
    const errorStatus = errorData.error?.status || '';
    
    console.error(`[Gemini API Error] Status: ${response.status}`);
    console.error(`[Gemini API Error] Message: ${errorMessage}`);
    console.error(`[Gemini API Error] Code: ${errorCode}, Status: ${errorStatus}`);
    console.error(`[Gemini API Error] Full error:`, JSON.stringify(errorData, null, 2));
    
    // Create more descriptive error message
    let enhancedMessage = errorMessage;
    if (response.status === 400) {
      enhancedMessage = `Invalid request to Gemini API: ${errorMessage}`;
    } else if (response.status === 401 || response.status === 403) {
      enhancedMessage = `Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file.`;
    } else if (response.status === 429) {
      enhancedMessage = `Gemini API rate limit exceeded. Please try again in a moment.`;
    }
    
    throw new Error(enhancedMessage);
  }

  const data = await response.json();
  
  // Extract the response content - handle different response structures
  let content = '';
  const candidate = data.candidates?.[0];
  
  if (candidate) {
    // Check for parts array with text
    if (candidate.content?.parts && candidate.content.parts.length > 0) {
      content = candidate.content.parts[0]?.text || '';
    }
    // Fallback: check if text is directly in content
    if (!content && candidate.content?.text) {
      content = candidate.content.text;
    }
    // Check finish reason
    if (candidate.finishReason === 'MAX_TOKENS' && !content) {
      // If MAX_TOKENS but no content, the model used all tokens for "thoughts"
      // Retry with higher token limit or return a helpful message
      throw new Error('Response was truncated. The model needs more tokens. Increasing limit and retrying...');
    }
    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Response was blocked by safety filters. Please rephrase your prompt.');
    }
    if (candidate.finishReason === 'RECITATION') {
      throw new Error('Response was blocked due to potential copyright content.');
    }
  }
  
  if (!content) {
    // If we have a candidate but no content, log the structure for debugging
    console.error('[Gemini] No content found. Candidate structure:', JSON.stringify(candidate, null, 2));
    throw new Error('No content in Gemini API response. The model may have been blocked or hit token limits.');
  }
  
  return {
    content,
    model: modelName || 'gemini-2.5-flash', // Return just the model name without 'models/' prefix
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount || null,
      completion_tokens: (data.usageMetadata?.totalTokenCount || 0) - (data.usageMetadata?.promptTokenCount || 0),
      total_tokens: data.usageMetadata?.totalTokenCount || null
    }
  };
}

/**
 * Call OpenAI API
 * Uses the standard OpenAI Chat Completions API
 */
async function callOpenAI(prompt, apiKey, responseJsonSchema, signal) {
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant for a Lost & Found application. Provide clear, concise, and friendly responses.'
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages,
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
  };

  // Add JSON schema if provided
  if (responseJsonSchema) {
    body.response_format = { type: 'json_object' };
    // Add instruction to return JSON
    messages[messages.length - 1].content += '\n\nPlease respond with valid JSON matching the requested schema.';
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `OpenAI API error: ${response.status}`;
    const errorCode = errorData.error?.code || '';
    const errorType = errorData.error?.type || '';
    
    console.error(`[OpenAI API Error] Status: ${response.status}, Message: ${errorMessage}`);
    console.error(`[OpenAI API Error] Code: ${errorCode}, Type: ${errorType}`);
    
    // Create a more descriptive error message
    let enhancedMessage = errorMessage;
    if (response.status === 429) {
      if (errorCode === 'insufficient_quota' || errorType === 'insufficient_quota') {
        enhancedMessage = 'OpenAI API quota exceeded. Please add credits to your OpenAI account or use Anthropic API instead.';
      } else {
        enhancedMessage = 'OpenAI API rate limit exceeded. Please try again in a moment.';
      }
    } else if (response.status === 401) {
      enhancedMessage = 'Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.';
    }
    
    throw new Error(enhancedMessage);
  }

  const data = await response.json();
  
  // Extract the response content
  const content = data.choices[0]?.message?.content || '';
  
  return {
    content,
    model: data.model,
    usage: data.usage
  };
}

/**
 * Call Anthropic API
 */
async function callAnthropic(prompt, apiKey, responseJsonSchema, signal) {
  const body = {
    model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  // Add system message if needed
  if (!responseJsonSchema) {
    body.system = 'You are a helpful assistant for a Lost & Found application. Provide clear, concise, and friendly responses.';
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content[0]?.text || '',
    model: data.model,
    usage: data.usage
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    activeProvider: process.env.GEMINI_API_KEY ? 'gemini' : 
                    process.env.OPENAI_API_KEY ? 'openai' : 
                    process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'none'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI API Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
  
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  
  if (hasGemini) {
    console.log(`✅ Gemini API configured (FREE)`);
  } else if (hasOpenAI) {
    console.log(`✅ OpenAI API configured`);
  } else if (hasAnthropic) {
    console.log(`✅ Anthropic API configured`);
  } else {
    console.warn('⚠️  Warning: No AI API keys found. Set GEMINI_API_KEY (recommended - free), OPENAI_API_KEY, or ANTHROPIC_API_KEY in .env');
  }
});

export default app;

