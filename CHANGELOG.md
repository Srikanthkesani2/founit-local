# Changelog

## [Unreleased]

### Added
- **AI Integration**: Replace mock AI handler with OpenAI/Anthropic integration + error handling
  - Created Express server with `/api/ai` endpoint
  - Support for both OpenAI and Anthropic providers
  - Comprehensive error handling with fallback responses
  - 15-second timeout protection
  - Structured JSON response support
  - Environment variable configuration
  - Health check endpoint at `/api/health`

### Changed
- Updated `firebaseClient.js` to call production AI API endpoint instead of mock
- Updated Vite config to proxy API requests to Express server
- Updated package.json scripts to run both frontend and backend servers

### Security
- API keys are never logged or exposed in responses
- Input validation prevents empty or malicious prompts
- Request timeout prevents resource exhaustion

