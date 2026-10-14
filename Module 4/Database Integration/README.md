# Database Integration Assignment Starter

Replace the in-memory repository implementation with PostgreSQL through Prisma. The starter already uses an asynchronous repository contract so services and controllers can remain stable during the swap.

## Run

```bash
npm install
npm start
```

## Prisma preparation

Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string.

```bash
npm run prisma:format
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

The schema includes users, posts, comments, votes, follows, tags, and post-tag relations.
The posts API uses Prisma-backed PostgreSQL storage. Before creating a post, its `authorId` must reference an existing user.

Read the platform question before editing. Do not add platform-only `question.md`, answer files, tests, or specs to this repository. Never commit `.env` or real credentials.
