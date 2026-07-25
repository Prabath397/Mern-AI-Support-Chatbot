# API Documentation

All protected routes require:

```http
Authorization: Bearer <token>
```

Responses use:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Core endpoints:

- `GET /api/health` returns service status.
- `POST /api/auth/register` accepts `name`, `email`, `password`.
- `POST /api/auth/login` accepts `email`, `password`.
- `GET /api/auth/me` returns the current user.
- `GET /api/users/profile` returns profile.
- `PUT /api/users/profile` updates `name` and `email`.
- `POST /api/conversations` creates a conversation.
- `GET /api/conversations` lists the current user's conversations.
- `GET /api/conversations/:id` retrieves an owned conversation.
- `PUT /api/conversations/:id` renames an owned conversation.
- `DELETE /api/conversations/:id` deletes an owned conversation and messages.
- `GET /api/conversations/:id/messages` returns ordered messages.
- `POST /api/conversations/:id/messages` saves a user message.
- `POST /api/chat` sends a user message and returns assistant response.
- `GET /api/attachments/messages/:messageId/attachments/:attachmentId` downloads an owned message attachment.
- `GET /api/admin/dashboard` returns counts and analytics.
- `GET /api/admin/users` returns users.
- `PATCH /api/admin/users/:id/status` activates or deactivates a user.
- `GET /api/admin/settings` returns chatbot system prompt.
- `PUT /api/admin/settings` updates chatbot system prompt.
