/**
 * Quick test script for the AI API endpoint
 * Run with: node test-api.js
 */

const testAPI = async () => {
  const testPrompt = "Write a haiku about AI";
  
  console.log('🧪 Testing AI API endpoint...\n');
  console.log(`Prompt: "${testPrompt}"\n`);

  try {
    const response = await fetch('http://localhost:3001/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: testPrompt
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Success!\n');
      console.log('Response:');
      console.log(data.text);
      console.log('\n---');
      console.log(`Provider: ${data.provider}`);
      console.log(`Model: ${data.meta?.model}`);
      console.log(`Tokens: ${data.meta?.tokens || 'N/A'}`);
      console.log(`Duration: ${data.meta?.duration}ms`);
    } else {
      console.log('❌ Error:', data.error);
      console.log('Code:', data.code);
      if (data.fallback) {
        console.log('Fallback:', data.fallback);
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev:server');
  }
};

// Run the test
testAPI();

