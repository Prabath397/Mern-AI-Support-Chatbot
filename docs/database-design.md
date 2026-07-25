# Database Design

## User

Fields: `name`, `email`, `password`, `role`, `isActive`, timestamps.

The email field is unique and indexed. Passwords are selected out by default and removed from JSON serialization.

## Conversation

Fields: `user`, `title`, timestamps.

Each conversation references one user. Queries are indexed by `user` and `updatedAt`.

## Message

Fields: `conversation`, `role`, `content`, `tokenUsage`, timestamps.

Messages reference conversations and are sorted by creation time.

## SystemSetting

Fields: `systemPrompt`, `updatedBy`, timestamps.

The newest setting is applied to chat generation.
