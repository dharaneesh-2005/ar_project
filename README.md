# AR Voice Privacy Awareness Game

A lightweight web-based AR simulation demonstrating how easily voice data can be captured and processed.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

3. Get Groq API key from: https://console.groq.com/

4. Run server:
```bash
npm start
```

5. Open browser: http://localhost:3000

## Features

- A-Frame AR simulation with gyroscope controls
- Voice recording via MediaRecorder API
- Groq Whisper transcription
- Privacy awareness messaging

## Tech Stack

- Frontend: A-Frame, vanilla JS
- Backend: Node.js, Express
- AI: Groq Whisper API
- Storage: Local filesystem (upgradable to Supabase)

## Mobile Usage

Works best on mobile devices with gyroscope sensors. Allow microphone permissions when prompted.
