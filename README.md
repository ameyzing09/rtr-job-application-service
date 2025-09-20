# RTR Job Application Service

Node.js/NestJS service that manages job postings and candidate applications. The project uses TypeORM for data access and database migrations.

## Prerequisites

- Node.js 18 or later
- A MySQL-compatible database (defaults in `.env` use `127.0.0.1:3306`)

## Setup

```bash
npm install
```

Create a `.env` file (or update the existing one) with your database credentials:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ameykode
DB_NAME=recrutr-db
```

## Running

```bash
# development
npm run start:dev

# production build + run
npm run build
npm run start:prod
```

## Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Database migrations

TypeORM manages schema changes through the CLI. Helpful scripts are defined in `package.json`:

```bash
# generate a migration based on entity changes
npm run typeorm -- migration:generate ./src/migrations/NameOfMigration -d ./src/database/data-source.ts

# apply all pending migrations
npm run migration:run

# revert the most recent migration
npm run migration:revert
```

`src/database/data-source.ts` contains the TypeORM configuration; ensure its values (or your environment variables) match the database you intend to update.

Run the migrations commands in every environment (local, CI, production) to keep schemas in sync.

## License

UNLICENSED