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

## Job API Documentation

### POST /job (Create Job)

**Required Headers:**
- `x-tenant-id`: `<tenant-uuid>`
- `Authorization`: `Bearer <jwt-token>`
- `Content-Type`: `application/json`

**Minimal Payload (Only Required Fields):**
```json
{
  "title": "Senior Software Engineer"
}
```

**Full Payload with All Optional Fields:**
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for an experienced software engineer to join our team.",
  "location": "San Francisco, CA",
  "department": "Engineering",
  "is_public": true,
  "publish_at": "2025-11-01T09:00:00Z",
  "expire_at": "2025-12-31T23:59:59Z",
  "external_apply_url": "https://careers.company.com/apply/12345",
  "extra": {
    "salary_range": "120k-180k",
    "remote_ok": true,
    "experience_years": 5,
    "tags": ["javascript", "nodejs", "react"]
  }
}
```

**Public Job Posting Example:**
```json
{
  "title": "Product Manager",
  "description": "Lead product strategy and roadmap for our flagship product.",
  "location": "Remote",
  "department": "Product",
  "is_public": true,
  "publish_at": "2025-10-20T00:00:00Z",
  "expire_at": "2025-11-20T23:59:59Z",
  "external_apply_url": "https://apply.workable.com/company/j/ABC123/"
}
```

**Internal Job (Not Public) Example:**
```json
{
  "title": "Internal Transfer - Engineering Manager",
  "description": "Manage a team of 5-8 engineers",
  "department": "Engineering",
  "is_public": false,
  "extra": {
    "internal_only": true,
    "min_tenure_months": 12
  }
}
```

### PUT /job/:jobId (Update Job)

**Partial Update (Only Changed Fields):**
```json
{
  "is_public": true,
  "publish_at": "2025-10-25T00:00:00Z",
  "expire_at": "2025-11-25T23:59:59Z"
}
```

**Update External Apply URL:**
```json
{
  "external_apply_url": "https://jobs.lever.co/company/abc-def-123"
}
```

**Extend Expiration:**
```json
{
  "expire_at": "2026-01-31T23:59:59Z"
}
```

### Field Specifications

| Field              | Type              | Required | Validation                               | Example                 |
|--------------------|-------------------|----------|------------------------------------------|-------------------------|
| title              | string            | ✅ Yes    | Non-empty                                | "Senior Engineer"       |
| description        | string            | No       | -                                        | "Job description..."    |
| location           | string            | No       | -                                        | "Remote" or "NYC"       |
| department         | string            | No       | -                                        | "Engineering"           |
| is_public          | boolean           | No       | Default: false                           | true or false           |
| publish_at         | string (ISO 8601) | No       | Must be valid date, must be < expire_at  | "2025-11-01T00:00:00Z"  |
| expire_at          | string (ISO 8601) | No       | Must be valid date, must be > publish_at | "2025-12-31T23:59:59Z"  |
| external_apply_url | string            | No       | Must be valid URL                        | "https://apply.com/job" |
| extra              | object            | No       | Must be valid JSON object                | {"key": "value"}        |

### Validation Errors

**Invalid Date Range:**
```json
// Request
{
  "publish_at": "2025-12-01T00:00:00Z",
  "expire_at": "2025-11-01T00:00:00Z"  // Before publish_at
}

// Response
{
  "statusCode": 400,
  "message": ["publish_at must be before expire_at"],
  "error": "Bad Request"
}
```

**Invalid URL:**
```json
// Request
{
  "external_apply_url": "not-a-valid-url"
}

// Response
{
  "statusCode": 400,
  "message": ["external_apply_url must be a URL"],
  "error": "Bad Request"
}
```

**Invalid Date Format:**
```json
// Request
{
  "publish_at": "not-a-date"
}

// Response - 400 Bad Request
```

**Non-Object Extra:**
```json
// Request
{
  "extra": "string instead of object"
}

// Response
{
  "statusCode": 400,
  "message": ["extra must be an object"],
  "error": "Bad Request"
}
```

### Default Values

When creating a job without specifying optional fields, the response includes:
```json
{
  "id": "generated-uuid",
  "tenantId": "tenant-uuid-from-token",
  "title": "Senior Software Engineer",
  "description": null,
  "location": null,
  "department": null,
  "is_public": false,
  "publish_at": null,
  "expire_at": null,
  "external_apply_url": null,
  "extra": null,
  "created_at": "2025-10-17T14:30:00Z",
  "updated_at": "2025-10-17T14:30:00Z"
}
```