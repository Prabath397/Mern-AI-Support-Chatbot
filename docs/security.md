# Security

- Secrets are stored in `.env` files and ignored by Git.
- `.env.example` contains placeholders only.
- Passwords are hashed with bcryptjs before storage.
- JWTs expire according to `JWT_EXPIRES_IN`.
- Inactive users cannot authenticate or continue using protected routes.
- Admin routes require both authentication and admin role authorization.
- Conversations are always looked up by both id and owner.
- Attachment downloads require authentication and conversation ownership.
- Attachment uploads are limited by file count, size, and MIME type.
- Helmet sets secure HTTP headers.
- CORS restricts origins through `CLIENT_URL`.
- JSON body size is limited to 1 MB.
- API, login, and chat routes have rate limits.
- Validation errors are explicit, while production server errors are generic.

Known limitations:

- Refresh tokens and password reset are not yet implemented.
- AI output moderation and prompt-injection defenses can be strengthened before production use.
- Add audit logging before using admin actions in a real business environment.
