# Health Guard AI

A personal health assistant powered by Google's Gemini AI, providing medical advice and health-related information through an intuitive chat interface.

## Features

- AI-powered medical consultations
- Chat history management
- Image analysis for medical images
- Responsive design
- Secure API key storage (local only)

## Prerequisites

- A modern web browser
- Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## How to Run

1. Clone or download this repository
2. Open `index.html` in your web browser
3. When prompted, enter your Gemini API key
4. Start chatting with your health assistant!

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and layout
- `script.js` - Main application logic
- `api-service.js` - Gemini API integration
- `chat-history.js` - Chat history management

## Security Note

This application stores your API key in browser localStorage. For production use, consider implementing a secure backend service to handle API calls.

## Disclaimer

This AI assistant is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers for medical concerns.