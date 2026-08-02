# Deployment Guide

## Netlify

This project is configured for a Netlify-only deployment. Netlify builds the Vite client and serves the Express API through `server/netlify/functions/api.js`.

Connect the repository in Netlify and use the checked-in `netlify.toml` settings:

- Build command: `npm ci --prefix server && npm ci --prefix client && npm run build --prefix client`
- Publish directory: `client/dist`
- Functions directory: `server/netlify/functions`

The app redirects `/api/*` to the Netlify function, so the frontend can use the same-site `/api` base URL in production.

## Environment Variables

Set these in Netlify.

Set:

- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `AI_PROVIDER`
- `AI_BASE_URL`
- `AI_API_KEY`
- `DEEPSEEK_API_KEY`
- `AI_MODEL`
- `AI_WEB_SEARCH`

Use your deployed Netlify site URL for `CLIENT_URL`, for example:

```env
CLIENT_URL=https://your-site-name.netlify.app
```

`VITE_API_BASE_URL` is optional on Netlify because the client defaults to `/api` in production. Set it only if you intentionally point the frontend at a different API URL.

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

## Web Search

To let Nexia AI answer current-event questions with live web results, set these Netlify environment variables:

```env
AI_PROVIDER=openai
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-5
AI_WEB_SEARCH=true
```

Web search is only used when `AI_PROVIDER=openai` and `AI_WEB_SEARCH=true`. Other providers continue to use the OpenAI-compatible chat completions path.

## OCR

Image OCR runs inside the backend with `tesseract.js` and the packaged English language data from `@tesseract.js-data/eng`. It does not require a paid OCR API. OCR extracts readable text from PNG, JPG, and WEBP uploads, then passes that text into the configured AI model.

Netlify Functions use temporary local storage. Uploaded attachments can be processed during a request, but stored attachment downloads are not durable across function instances. Move attachment storage to a cloud bucket if permanent downloads are required.
