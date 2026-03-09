# GPS Food Review

Web app mobile-first for exploring one food street with GPS proximity detection, multilingual narration, and AI food assistant.

## Stack
- Frontend: React + Vite + react-leaflet
- Backend: Node.js + Express + gTTS + OpenRouter via openai SDK

## PRD Coverage
- FR1-FR3: Map, markers, `watchPosition`, realtime distance checks.
- FR4-FR7: Auto popup and auto narration when entering shop radius, with cooldown anti-spam.
- FR8-FR10: Floating chatbot with context-aware recommendations (shops + nearest by user location).
- FR11: 15-language selector and runtime switcher.

## Project Structure
- `be_GPS_Food_Review`: API, food data, proximity and TTS cache logic.
- `fe_GPS_Food_Review`: Mobile-first UI, GPS tracking, map, audio controls, chatbot.

## Backend Setup
1. Open terminal in `be_GPS_Food_Review`.
2. Install deps: `npm install`
3. Create `.env` with:

```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
PUBLIC_WEB_URL=http://localhost:5173
```

4. Run server: `npm run dev`

## Frontend Setup
1. Open terminal in `fe_GPS_Food_Review`.
2. Install deps: `npm install`
3. Optional `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

4. Run app: `npm run dev`

## Main APIs
- `GET /health`
- `GET /api/meta/languages`
- `GET /api/foods?lang=vi`
- `GET /api/foods/nearby?lat=...&lng=...&lang=vi&radius=100`
- `GET /api/tts/food/:foodId?lang=vi`
- `POST /api/tts/text`
- `POST /api/chat`

## Notes
- Browser GPS and autoplay policies require HTTPS in production.
- TTS files are cached at `be_GPS_Food_Review/public/audio`.
