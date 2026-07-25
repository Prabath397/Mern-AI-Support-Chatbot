# Interview Guide

## What MERN Means

MERN means MongoDB, Express.js, React, and Node.js. MongoDB stores data, Express exposes the API, React renders the UI, and Node runs the backend JavaScript.

## Why MongoDB

MongoDB fits conversation data well because conversations and messages evolve over time, and Mongoose gives schema validation, references, indexes, and model methods.

## Why Express

Express is lightweight, widely used, and makes REST endpoints, middleware, authentication, validation, and centralized error handling straightforward.

## How React Communicates With Node

React calls the Express API with Axios. After login, the JWT is attached as an `Authorization: Bearer <token>` header.

## JWT Authentication

The server signs a token after login. Protected middleware verifies the token, loads the user, checks `isActive`, and attaches the user to the request.

## Password Security

Passwords are hashed with bcryptjs before saving. The API never returns password hashes.

## Mongoose Relationships

Messages reference conversations, and conversations reference users through ObjectId fields. Ownership is enforced by querying conversation id and user id together.

## Authentication vs Authorization

Authentication proves who the user is. Authorization checks what that user is allowed to do, such as admin-only dashboard access.

## AI Service Abstraction

The chat controller calls `aiService`. That service chooses mock mode when no backend AI key is available, or an OpenAI-compatible provider when configured. React never sees the AI key.

## Error Handling

Validation, duplicate email, invalid ObjectId, 404, auth, and server errors are normalized by centralized middleware.

## Scaling

The system can scale by adding indexes, caching admin analytics, paginating messages, moving AI work to queues, and deploying stateless API instances behind a load balancer.

## Security Limitations

Before production, add refresh tokens, password reset, audit logs, provider-specific AI safety controls, and stricter CORS/secret rotation policies.
