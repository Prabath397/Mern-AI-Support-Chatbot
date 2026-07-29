# Deployment Guide

## Backend

Deploy `server/` to Render or another Node host.

Set:

- `NODE_ENV=production`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `AI_PROVIDER`
- `AI_BASE_URL`
- `AI_API_KEY`
- `DEEPSEEK_API_KEY`
- `AI_MODEL`

Start command:

```bash
npm start
```

## Frontend

Deploy `client/` to Vercel or Netlify.

Set:

- `VITE_API_BASE_URL=https://your-backend.example.com/api`

Build command:

```bash
npm run build
```

Publish directory:

```text
dist
```

## AI Provider

The default provider is `mock`. To connect a real OpenAI-compatible provider later, set:

```env
AI_PROVIDER=openai
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_provider_key
AI_MODEL=gpt-4.1-mini
```

For DeepSeek, set:

```env
AI_PROVIDER=deepseek
AI_API_KEY=your_deepseek_key
AI_MODEL=deepseek-v4-flash
```

You can use `DEEPSEEK_API_KEY` instead of `AI_API_KEY` for DeepSeek. When `AI_PROVIDER=deepseek`, `AI_BASE_URL` defaults to `https://api.deepseek.com`.

Keep this only in backend hosting environment variables.

## OCR

Image OCR runs inside the backend with `tesseract.js` and the packaged English language data from `@tesseract.js-data/eng`. It does not require a paid OCR API. OCR extracts readable text from PNG, JPG, and WEBP uploads, then passes that text into the configured AI model.
