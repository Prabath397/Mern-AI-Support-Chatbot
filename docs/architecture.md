# Architecture

Nexia AI is split into a React client and an Express API for a general AI chat assistant.

The React app owns routing, UI state, auth context, theme context, and API calls. Axios attaches JWTs automatically after login. Protected routes redirect anonymous users, while admin routes also check the user role.

The Express API owns authentication, authorization, database access, validation, security middleware, and AI provider calls. Controllers stay thin, models define persistence rules, middleware centralizes auth and errors, and services hold cross-cutting business behavior like AI responses and title generation.

Data flow:

1. User submits a chat message in React.
2. Axios sends `POST /api/chat` with a bearer token.
3. Express verifies the JWT and active user status.
4. The conversation ownership is verified or a new conversation is created.
5. The user message is stored.
6. Optional attachments are stored privately, with text extracted from TXT, Markdown, CSV, JSON, PDF, and DOCX files. Image attachments are processed with local Tesseract.js OCR and the extracted text is added to the AI context.
7. Recent history, attachment context, and the saved system prompt are passed to the AI service.
8. The assistant message is stored and returned to the client.
