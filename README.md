# SupportSphere AI

SupportSphere AI is a portfolio-quality MERN customer support chatbot. It demonstrates MongoDB, Express 5, React, Node.js, JWT authentication, admin authorization, conversation history, markdown chat responses, Docker preparation, CI, and deployment-ready environment configuration.

## MERN Technologies

- MongoDB Atlas with Mongoose models and references
- Express.js 5 REST API with validation, security middleware, rate limits, and centralized errors
- React with Vite, React Router, Axios, Context API, React Markdown, and responsive CSS
- Node.js ES modules on the backend

## Features

- Register, log in, log out, retrieve and update profile
- JWT bearer authentication and admin-only routes
- Create, list, rename, delete, and load conversations
- Save and retrieve ordered message history
- Chat endpoint with backend-only AI provider abstraction and mock fallback
- Markdown and code block rendering with copy actions
- Light/dark mode, loading, error, and empty states
- Admin dashboard with totals, recent users, user status controls, and system instructions

## Screenshots

Add portfolio screenshots in `screenshots/`:

- Landing page
- Login and registration
- Chat empty state
- Active conversation with markdown and code
- Admin dashboard
- Admin settings

## Architecture

The client talks to the Express API through `client/src/api/http.js`. The API validates requests, authenticates JWTs, checks ownership or admin authorization, stores data in MongoDB Atlas through Mongoose, and calls `server/src/services/aiService.js` for assistant responses. If no AI key is configured, the mock provider keeps the application runnable.

## Folder Structure

```text
SupportSphere-AI/
├── client/
├── server/
├── docs/
├── screenshots/
├── .github/workflows/
├── .gitignore
├── README.md
├── LICENSE
├── docker-compose.yml
└── AGENTS.md
```

## Local Installation

```bash
npm install --prefix server
npm install --prefix client
```

## Environment Setup

Copy `server/.env.example` to `server/.env` if needed and replace placeholders:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/supportsphere_ai
JWT_SECRET=replace_with_a_long_random_secret
AI_PROVIDER=mock
AI_API_KEY=
```

The React client reads:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Development Commands

```bash
npm run dev:server
npm run dev:client
```

Backend: `http://localhost:5000`  
Frontend: `http://localhost:5173`

## Testing Commands

```bash
npm test --prefix server
npm test --prefix client
npm run lint --prefix server
npm run lint --prefix client
npm run build --prefix client
```

## API Summary

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `POST /api/conversations`
- `GET /api/conversations`
- `GET /api/conversations/:id`
- `PUT /api/conversations/:id`
- `DELETE /api/conversations/:id`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`
- `POST /api/chat`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

## Docker

Create a root `.env` for Docker Compose with `MONGO_URI`, `JWT_SECRET`, and optional AI values, then run:

```bash
docker compose up --build
```

MongoDB is not started locally because MongoDB Atlas is used.

## Deployment Overview

- Deploy `server/` to Render or another Node-compatible host.
- Deploy `client/` to Vercel or Netlify.
- Set `VITE_API_BASE_URL` to the deployed backend `/api` URL.
- Set backend `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and optional AI variables in the host dashboard.

## Security Notes

Secrets are ignored by Git. Passwords are hashed with bcryptjs. JWTs are read from `Authorization: Bearer <token>`. Admin routes require both authentication and role authorization. The backend uses Helmet, CORS, validation, body limits, rate limits, safe production errors, and ownership checks for conversations.

## Future Improvements

- Add refresh tokens
- Add password reset
- Add streaming AI responses
- Add organization/team workspaces
- Add richer analytics and audit logs

## Author

Created by: Your Name  
GitHub: `https://github.com/your-username`  
Portfolio: `https://your-portfolio.example.com`

## License

MIT
