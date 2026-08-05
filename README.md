# Nexia AI

**Live Demo:** [https://nexiaai.vercel.app/](https://nexiaai.vercel.app/)

Nexia AI is a modern full-stack AI chat assistant with authentication, role-aware dashboards, conversation memory, markdown responses, file-aware chat, and a polished purple workspace interface.

## Highlights

- Modern AI chat workspace with saved conversations
- Register, log in, log out, and update profile
- User and admin routing from the same login flow
- Admin dashboard with user and system controls
- Conversation rename, delete, search, pin, regenerate, and stop response controls
- Markdown, tables, code blocks, math, and copy actions in assistant replies
- TXT, Markdown, CSV, JSON, PDF, DOCX, and image attachment support
- Light and dark mode
- Responsive layout for desktop and mobile

## Tech Stack

- React with Vite
- React Router
- Context API
- Axios
- React Markdown
- Express.js
- Node.js ES modules
- JWT authentication
- Mongoose models
- Plain responsive CSS

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

## Project Structure

```text
Nexia-AI/
├── client/
├── server/
├── docs/
├── screenshots/
├── .gitignore
├── README.md
├── LICENSE
└── AGENTS.md
```

## Local Setup

Install dependencies from the project root:

```bash
npm run install:all
```

Create local environment files from the example files:

```text
client/.env.example
server/.env.example
```

Start the backend:

```bash
npm run dev:server
```

Start the frontend:

```bash
npm run dev:client
```

Local URLs:

```text
Frontend: http://localhost:5173
Backend: http://localhost:5000
Health: http://localhost:5000/api/health
```

## Scripts

Run checks from the project root:

```bash
npm run lint
npm test
npm run build
```

Run app-specific commands:

```bash
npm test --prefix server
npm test --prefix client
npm run lint --prefix server
npm run lint --prefix client
npm run build --prefix client
```

## API Overview

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
- `PATCH /api/conversations/:id/pin`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`
- `POST /api/chat`
- `POST /api/chat/regenerate`
- `GET /api/attachments/messages/:messageId/attachments/:attachmentId`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

## Security

Secrets are ignored by the repository. Passwords are hashed before storage, protected requests use bearer tokens, and admin routes require both authentication and authorization.

## Future Improvements

- Add refresh tokens
- Add password reset
- Add streaming AI responses
- Add team workspaces
- Add richer analytics and audit logs

## Author

Created by: Prabath397  
Portfolio: [https://prabath397.github.io/](https://prabath397.github.io/)

## License

This project is licensed under the [MIT License](LICENSE).
