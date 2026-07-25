# SupportSphere AI Agent Notes

This project is a JavaScript-only MERN portfolio application.

- Use npm only.
- Keep secrets in local `.env` files and never commit them.
- Server code uses ES modules, Express 5, Mongoose, JWT, validators, and centralized errors.
- Client code uses Vite, React Router, Context API, Axios, React Markdown, and plain responsive CSS.
- MongoDB Atlas is expected for live data; tests avoid the production database.
- The AI service runs in mock mode unless `AI_PROVIDER`, `AI_API_KEY`, and `AI_MODEL` are configured on the server.
