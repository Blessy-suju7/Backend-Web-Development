# Database Integration

The posts API uses PostgreSQL through Prisma. Prisma access stays behind the repository; the existing service and controller contract is retained.

## Run

Install dependencies, copy `.env.example` to `.env`, and set `DATABASE_URL` to a PostgreSQL connection string for a local development database. Never commit `.env`.

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm start
```

`prisma:migrate` runs `prisma migrate deploy`, which applies the committed migrations in order and does not create a new migration. The checked-in history includes the initial schema and the follow-up relational-schema migration.

When intentionally changing the schema during development, format and validate it, then create a descriptive migration:

```bash
npm run prisma:format
npm run prisma:validate
npm run prisma:migrate:dev -- --name describe_the_change
```

Regenerate Prisma Client after schema changes with `npm run prisma:generate`. The seed command is repeatable and creates the sample user and posts only when absent.

## API verification

With PostgreSQL running and the committed migrations applied, run:

```bash
npm run verify:api
```

This starts the API on an ephemeral local port and checks list, read existing/missing, create, update existing/missing, remove existing/missing, malformed post IDs, invalid author IDs, and a foreign-key failure. It creates a uniquely scoped temporary user and removes that user's posts and the user afterward.

Post creation requires a positive 32-bit integer `authorId` for an existing user. Invalid IDs return `422`; missing related records return a safe `409` response. Database internals are not returned to API clients.
