# Testing Guide

Backend tests use Vitest and Supertest. They cover health, invalid registration, invalid login, protected route rejection, and admin route rejection. These tests do not require the production MongoDB database because validation and authentication rejection happen before database writes.

Frontend tests use Vitest, React Testing Library, and jsdom. They cover auth form rendering, protected route behavior, and the chat empty state component.

Commands:

```bash
npm test --prefix server
npm test --prefix client
```

For broader future tests, use a dedicated test database or `mongodb-memory-server`, never the production Atlas database.
