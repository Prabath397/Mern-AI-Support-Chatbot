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
- `AI_API_KEY`
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
AI_API_KEY=your_provider_key
AI_MODEL=gpt-4.1-mini
```

Keep this only in backend hosting environment variables.
