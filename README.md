# Nexia AI

Nexia AI is a portfolio-quality MERN ChatGPT-style AI assistant. It demonstrates MongoDB, Express 5, React, Node.js, JWT authentication, admin authorization, conversation history, markdown chat responses, Docker preparation, CI, and deployment-ready environment configuration.

## MERN Technologies

- MongoDB Atlas with Mongoose models and references
- Express.js 5 REST API with validation, security middleware, rate limits, and centralized errors
- React with Vite, React Router, Axios, Context API, React Markdown, and responsive CSS
- Node.js ES modules on the backend

## Features

- Register, log in, log out, retrieve and update profile
- Role-aware user/admin login with correct dashboard redirection
- JWT bearer authentication and admin-only routes
- Create, list, rename, delete, and load conversations
- Save and retrieve ordered message history
- General-purpose chat endpoint with backend-only AI provider abstraction and mock fallback
- TXT, Markdown, CSV, JSON, PDF, DOCX, and image attachments on chat messages
- Text extraction from document attachments and local OCR for images so the AI can answer with uploaded context
- Markdown and code block rendering with copy actions
- Light/dark mode, loading, error, and empty states
- Admin dashboard with totals, recent users, user status controls, and system instructions

## Screenshots

### Public Pages

| Home Page                                       | Login Page                                         | Register Page                                            |
| ----------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| ![Nexia AI home page](screenshots/HomePage.png) | ![Nexia AI login page](screenshots/Login_Page.png) | ![Nexia AI register page](screenshots/Register_Page.png) |

### User Experience

| User Chat                                         | User Profile                                       |
| ------------------------------------------------- | -------------------------------------------------- |
| ![User chat page](screenshots/User_Chat_Page.png) | ![User profile page](screenshots/User_Profile.png) |

### Admin Experience

| Admin Dashboard                                          | Admin Users                                      |
| -------------------------------------------------------- | ------------------------------------------------ |
| ![Admin dashboard page](screenshots/Admin_Dashboard.png) | ![Admin users page](screenshots/Admin_Users.png) |

| Admin Settings                                         | Admin Profile                                        |
| ------------------------------------------------------ | ---------------------------------------------------- |
| ![Admin settings page](screenshots/Admin_Settings.png) | ![Admin profile page](screenshots/Admin_Profile.png) |

## Architecture

The client talks to the Express API through `client/src/api/http.js`. The API validates requests, authenticates JWTs, checks ownership or admin authorization, stores data in MongoDB Atlas through Mongoose, and calls `server/src/services/aiService.js` for general assistant responses. If no AI key is configured, the mock provider keeps the application runnable.

## Folder Structure

```text
Nexia-AI/
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

From the project root:

```bash
npm run install:all
```

Or install each app separately:

```bash
cd server
npm install
cd ../client
npm install
```

## Environment Setup

Create or update `server/.env`. Never commit this file.

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/nexia_ai?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=replace_with_a_long_random_secret_value
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
AI_PROVIDER=mock
AI_BASE_URL=
AI_API_KEY=
SHUTTLEAI_API_KEY=
DEEPSEEK_API_KEY=
AI_MODEL=
AI_WEB_SEARCH=false
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=8
```

For OpenRouter/free models, use this AI section instead:

```env
AI_PROVIDER=openrouter
AI_BASE_URL=https://openrouter.ai/api/v1
AI_API_KEY=your_openrouter_key
AI_MODEL=inclusionai/ling-3.0-flash:free
```

For `openai/gpt-oss-120b` on OpenRouter, use:

```env
AI_PROVIDER=openrouter
AI_BASE_URL=https://openrouter.ai/api/v1
AI_API_KEY=your_openrouter_key
AI_MODEL=openai/gpt-oss-120b
```

`openai/gpt-oss-120b` is a text-only model. Image uploads are handled by free local OCR with Tesseract.js first, then the extracted text is sent to the model as chat context.

To let Nexia AI answer current-event questions with live web search, use OpenAI and enable web search on the backend:

```env
AI_PROVIDER=openai
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-5
AI_WEB_SEARCH=true
```

For ShuttleAI, use:

```env
AI_PROVIDER=shuttleai
AI_BASE_URL=https://api.shuttleai.com/v1
AI_API_KEY=your_shuttleai_key
AI_MODEL=openai/gpt-5.5
AI_WEB_SEARCH=false
```

The React client uses `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Admin Access

There are no hardcoded admin credentials in the source code. This is intentional so real passwords are never committed to GitHub.

For local development, an admin account can use:

```text
Email: admin@nexia.local
Password: set locally by the developer
```

To make any registered user an admin, update that user in MongoDB Atlas:

```json
{
  "role": "admin"
}
```

To reset the local admin password, run this from `server/` and replace `NewStrongPassword123!`:

```powershell
node -e "import('dotenv').then(async ({config})=>{config(); const mongoose=(await import('mongoose')).default; const bcrypt=(await import('bcryptjs')).default; await mongoose.connect(process.env.MONGO_URI); const hash=await bcrypt.hash('NewStrongPassword123!',12); await mongoose.connection.db.collection('users').updateOne({email:'admin@nexia.local'},{`$set:{password:hash,updatedAt:new Date()}}); await mongoose.disconnect(); console.log('Admin password updated');})"
```

Do not place the real admin password in this README or any committed file.

## Development Commands

Run the backend in terminal 1:

```powershell
cd server
npm run dev
```

Run the frontend in terminal 2:

```powershell
cd client
npm run dev
```

You can also run from the project root:

```powershell
npm run dev:server
npm run dev:client
```

Backend: `http://localhost:5000`  
Backend health check: `http://localhost:5000/api/health`  
Frontend: `http://localhost:5173`

After changing `server/.env`, restart the backend. If nodemon is already running, type:

```text
rs
```

and press Enter.

## Testing Commands

From the project root:

```bash
npm run lint
npm test
npm run build
```

Or run each command directly:

```bash
npm test --prefix server
npm test --prefix client
npm run lint --prefix server
npm run lint --prefix client
npm run format --prefix server
npm run format --prefix client
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
- `GET /api/attachments/messages/:messageId/attachments/:attachmentId`
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

This project is configured for Netlify-only deployment.

- Netlify builds the Vite client from `client/`.
- Netlify serves the Express API through `server/netlify/functions/api.js`.
- `/api/*` redirects to the Netlify function, so `VITE_API_BASE_URL` is optional in production.
- Set `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and optional AI variables in Netlify environment variables.
- For DeepSeek, set `AI_PROVIDER=deepseek` plus `AI_API_KEY` or `DEEPSEEK_API_KEY`.

Netlify Functions use temporary local storage. Attachment text extraction works during upload requests, but stored attachment downloads are not durable unless attachment storage is moved to a cloud bucket.

## Security Notes

Secrets are ignored by Git. Passwords are hashed with bcryptjs. JWTs are read from `Authorization: Bearer <token>`. Admin routes require both authentication and role authorization. The backend uses Helmet, CORS, validation, body limits, rate limits, safe production errors, and ownership checks for conversations.

## Future Improvements

- Add refresh tokens
- Add password reset
- Add streaming AI responses
- Add organization/team workspaces
- Add richer analytics and audit logs

## Author

Created by: Prabath397  
GitHub: [https://github.com/Prabath397](https://github.com/Prabath397)  
Portfolio: [https://prabath397.github.io/](https://prabath397.github.io/)

## License

This project is licensed under the [MIT License](LICENSE).
