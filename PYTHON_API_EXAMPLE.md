# Python OpenAI API - Correct Usage

## ❌ Incorrect Code (What you showed)

```python
from openai import OpenAI

client = OpenAI(api_key="your-key")

response = client.responses.create(  # ❌ This method doesn't exist
  model="gpt-5-nano",  # ❌ This model doesn't exist
  input="write a haiku about ai",  # ❌ Wrong parameter name
  store=True,  # ❌ Not a valid parameter
)

print(response.output_text)  # ❌ Wrong attribute
```

## ✅ Correct Code

```python
from openai import OpenAI

client = OpenAI(api_key="your-key")

response = client.chat.completions.create(  # ✅ Correct method
  model="gpt-3.5-turbo",  # ✅ Valid model
  messages=[  # ✅ Correct parameter
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "write a haiku about ai"}
  ],
  max_tokens=150,
  temperature=0.7
)

print(response.choices[0].message.content)  # ✅ Correct way to get response
```

## Key Differences

1. **Method**: `client.chat.completions.create()` not `client.responses.create()`
2. **Model**: Use valid models like `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo-preview`
3. **Messages**: Use `messages` array with `role` and `content`, not `input`
4. **Response**: Access via `response.choices[0].message.content`

## Our JavaScript Implementation

Our Node.js server (`server.js`) uses the same API correctly:

```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant...' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.7
  })
});
```

This matches the Python SDK's behavior exactly!

