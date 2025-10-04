# Restore Gemini API Proxy - Fix CORS Issues

## Files to Restore/Create
- [ ] `controllers/geminiController.js` - Restore Gemini controller for chat API proxy
- [ ] `routes/geminiRoutes.js` - Restore Gemini API routes
- [ ] `test-gemini.js` - Restore Gemini test script

## Files to Modify
- [ ] `server.js` - Re-add Gemini routes import and registration
- [ ] `package.json` - Re-add Gemini dependencies (@google/genai, @google/generative-ai)
- [ ] `controllers/enhancedExamController.js` - Re-enable Gemini exam generation (proxied through backend)
- [ ] `controllers/topicQuizController.js` - Re-enable Gemini quiz generation (proxied through backend)

## Verification
- [ ] Install dependencies and test Gemini API proxy
- [ ] Verify CORS issues are resolved
- [ ] Confirm API key security (server-side only)
