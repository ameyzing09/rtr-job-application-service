# Job Application Service - API Documentation

**Version:** 1.0
**Base URL:** `http://localhost:8080`
**Last Updated:** 2025-10-18

---

## Table of Contents

1. [Authentication](#authentication)
2. [Job Management APIs (Private)](#job-management-apis-private)
3. [Public Job APIs](#public-job-apis)
4. [Application Management APIs (Private)](#application-management-apis-private)
5. [Public Application APIs](#public-application-apis)
6. [Error Responses](#error-responses)
7. [Data Models](#data-models)

---

## Authentication

### Private Endpoints
All private endpoints (under `/job` and `/applications`) require authentication.

**Required Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
```

**Authentication Flow:**
1. JWT token must contain `tenantId` (or `tid`) claim
2. Token's `tenantId` must match the `x-tenant-id` header
3. Token is verified using `JWT_SECRET` environment variable
4. Unauthorized requests receive `401 Unauthorized`

### Public Endpoints
Public endpoints (under `/public/*`) do NOT require authentication.

**Required Headers:**
```http
Host: <tenant-subdomain>.yourdomain.com
```

The tenant is identified via subdomain extraction from the `Host` header.

---

## Job Management APIs (Private)

Base path: `/job`

### 1. Create Job

Create a new job posting.

**Endpoint:** `POST /job`

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Senior Backend Engineer",
  "description": "We are looking for an experienced backend engineer...",
  "location": "San Francisco, CA",
  "department": "Engineering",
  "isPublic": false,
  "publishAt": "2025-11-01T00:00:00.000Z",
  "expireAt": "2025-12-31T23:59:59.000Z",
  "externalApplyUrl": "https://careers.company.com/apply/123",
  "extra": {
    "salary_range": "$120k-180k",
    "experience_years": 5,
    "remote_allowed": true
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ Yes | Job title |
| `description` | string | ❌ No | Detailed job description |
| `location` | string | ❌ No | Job location |
| `department` | string | ❌ No | Department name |
| `isPublic` | boolean | ❌ No | Whether job is publicly visible (default: false) |
| `publishAt` | ISO 8601 date | ❌ No | When job becomes publicly visible |
| `expireAt` | ISO 8601 date | ❌ No | When job posting expires (must be after `publishAt`) |
| `externalApplyUrl` | URL | ❌ No | External application URL |
| `extra` | object | ❌ No | Tenant-specific custom fields (validated against tenant schema) |

**Validation Rules:**
- `title`: Required, non-empty string
- `expireAt` must be after `publishAt` if both are provided
- `externalApplyUrl` must be a valid URL
- `extra` is validated against tenant-specific JSON schema from `tenant_settings.config.job_fields_schema`
  - If schema doesn't exist, any valid JSON object is accepted
  - Invalid `extra` returns 400 with field-level errors

**Success Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Senior Backend Engineer",
  "description": "We are looking for an experienced backend engineer...",
  "location": "San Francisco, CA",
  "department": "Engineering",
  "isPublic": false,
  "publishAt": "2025-11-01T00:00:00.000Z",
  "expireAt": "2025-12-31T23:59:59.000Z",
  "externalApplyUrl": "https://careers.company.com/apply/123",
  "extra": {
    "salary_range": "$120k-180k",
    "experience_years": 5,
    "remote_allowed": true
  },
  "createdAt": "2025-10-18T10:30:00.000Z",
  "updatedAt": "2025-10-18T10:30:00.000Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "extra: missing required property 'salary_range'",
    "extra/experience_years: must be number"
  ],
  "error": "Bad Request"
}
```

---

### 2. Get All Jobs

Retrieve all jobs for the authenticated tenant.

**Endpoint:** `GET /job`

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
```

**Success Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Senior Backend Engineer",
    "description": "We are looking for...",
    "location": "San Francisco, CA",
    "department": "Engineering",
    "isPublic": true,
    "publishAt": "2025-11-01T00:00:00.000Z",
    "expireAt": "2025-12-31T23:59:59.000Z",
    "externalApplyUrl": "https://careers.company.com/apply/123",
    "extra": {
      "salary_range": "$120k-180k"
    },
    "createdAt": "2025-10-18T10:30:00.000Z",
    "updatedAt": "2025-10-18T10:30:00.000Z"
  }
]
```

**Notes:**
- Returns jobs in descending order by `createdAt`
- Includes both public and private jobs
- Only returns jobs for the authenticated tenant

---

### 3. Get Job by ID

Retrieve a specific job by its ID.

**Endpoint:** `GET /job/:jobId`

**Path Parameters:**
- `jobId` (UUID) - The job identifier

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
```

**Success Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Senior Backend Engineer",
  "description": "We are looking for...",
  "location": "San Francisco, CA",
  "department": "Engineering",
  "isPublic": true,
  "publishAt": "2025-11-01T00:00:00.000Z",
  "expireAt": "2025-12-31T23:59:59.000Z",
  "externalApplyUrl": null,
  "extra": null,
  "createdAt": "2025-10-18T10:30:00.000Z",
  "updatedAt": "2025-10-18T10:30:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Job with ID 550e8400-e29b-41d4-a716-446655440000 not found for tenant 123e4567-e89b-12d3-a456-426614174000",
  "error": "Not Found"
}
```

---

### 4. Update Job

Update an existing job posting.

**Endpoint:** `PUT /job/:jobId`

**Path Parameters:**
- `jobId` (UUID) - The job identifier

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
All fields are optional. Only include fields you want to update.

```json
{
  "title": "Senior Backend Engineer (Updated)",
  "description": "Updated description...",
  "location": "Remote",
  "department": "Engineering",
  "isPublic": true,
  "extra": {
    "salary_range": "$130k-190k",
    "remote_allowed": true
  }
}
```

**Success Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Senior Backend Engineer (Updated)",
  "description": "Updated description...",
  "location": "Remote",
  "department": "Engineering",
  "isPublic": true,
  "publishAt": "2025-11-01T00:00:00.000Z",
  "expireAt": "2025-12-31T23:59:59.000Z",
  "externalApplyUrl": null,
  "extra": {
    "salary_range": "$130k-190k",
    "remote_allowed": true
  },
  "createdAt": "2025-10-18T10:30:00.000Z",
  "updatedAt": "2025-10-18T15:45:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Job with ID 550e8400-e29b-41d4-a716-446655440000 not found for tenant 123e4567-e89b-12d3-a456-426614174000",
  "error": "Not Found"
}
```

---

### 5. Delete Job

Delete a job posting. This will cascade delete all associated applications.

**Endpoint:** `DELETE /job/:jobId`

**Path Parameters:**
- `jobId` (UUID) - The job identifier

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
```

**Success Response:** `200 OK`
```json
{}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Job with ID 550e8400-e29b-41d4-a716-446655440000 not found for tenant 123e4567-e89b-12d3-a456-426614174000",
  "error": "Not Found"
}
```

**Warning:** Deleting a job will permanently delete all associated applications due to cascade delete.

---

### 6. Publish Job

Make a job publicly visible. Requires ADMIN or HR role.

**Endpoint:** `PUT /job/:jobId/publish`

**Path Parameters:**
- `jobId` (UUID) - The job identifier

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
```

**Authorization:**
- Requires role: `ADMIN` or `HR`
- JWT token must contain `role` claim

**Success Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Senior Backend Engineer",
  "isPublic": true,
  "publishAt": "2025-10-18T15:45:00.000Z",
  "createdAt": "2025-10-18T10:30:00.000Z",
  "updatedAt": "2025-10-18T15:45:00.000Z"
}
```

**Notes:**
- Sets `isPublic` to `true`
- If `publishAt` is not already set, it will be set to the current timestamp
- Job becomes immediately visible in public job listings

**Error Response:** `403 Forbidden`
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

### 7. Unpublish Job

Hide a job from public view. Requires ADMIN or HR role.

**Endpoint:** `PUT /job/:jobId/unpublish`

**Path Parameters:**
- `jobId` (UUID) - The job identifier

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
```

**Authorization:**
- Requires role: `ADMIN` or `HR`
- JWT token must contain `role` claim

**Success Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Senior Backend Engineer",
  "isPublic": false,
  "publishAt": "2025-10-18T15:45:00.000Z",
  "createdAt": "2025-10-18T10:30:00.000Z",
  "updatedAt": "2025-10-18T16:00:00.000Z"
}
```

**Notes:**
- Sets `isPublic` to `false`
- Job is removed from public job listings
- Existing applications are not affected

---

## Public Job APIs

Base path: `/public`

### 1. Get Public Jobs (Paginated)

Retrieve all published jobs for a tenant with filtering and pagination.

**Endpoint:** `GET /public/jobs`

**Headers:**
```http
Host: <tenant-subdomain>.yourdomain.com
```

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `search` | string | ❌ No | Search across id, title, description, department, location | - |
| `department` | string | ❌ No | Filter by exact department match | - |
| `location` | string | ❌ No | Filter by exact location match | - |
| `page` | integer | ❌ No | Page number (min: 1) | 1 |
| `pageSize` | integer | ❌ No | Items per page (min: 1, max: 100) | 10 |

**Example Request:**
```http
GET /public/jobs?search=engineer&department=Engineering&page=1&pageSize=20
Host: acmecorp.yourdomain.com
```

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Senior Backend Engineer",
      "department": "Engineering",
      "location": "San Francisco, CA",
      "description_excerpt": "We are looking for an experienced backend engineer to join our growing team. You will be working...",
      "publishAt": "2025-11-01T00:00:00.000Z",
      "updatedAt": "2025-10-18T10:30:00.000Z",
      "extra": {
        "salary_range": "$120k-180k",
        "remote_allowed": true
      }
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Frontend Engineer",
      "department": "Engineering",
      "location": "Remote",
      "description_excerpt": "Join our frontend team to build amazing user experiences...",
      "publishAt": "2025-10-15T00:00:00.000Z",
      "updatedAt": "2025-10-15T09:00:00.000Z",
      "extra": null
    }
  ],
  "total": 2
}
```

**Field Descriptions:**
- `description_excerpt`: First 100 characters of description (full description available in detail view)
- `total`: Total number of matching jobs (for pagination)

**Filtering Logic:**
- Only jobs with `isPublic = true` are returned
- Only jobs where `publishAt <= current_time` are returned
- Jobs with `expireAt < current_time` are excluded
- Jobs are ordered by `publishAt` descending (newest first)

**Error Response:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Subdomain required in host header",
  "error": "Bad Request"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Tenant not found",
  "error": "Not Found"
}
```

---

### 2. Get Public Job by ID

Retrieve full details of a specific public job.

**Endpoint:** `GET /public/jobs/:id`

**Path Parameters:**
- `id` (UUID) - The job identifier

**Headers:**
```http
Host: <tenant-subdomain>.yourdomain.com
```

**Success Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "location": "San Francisco, CA",
  "description": "We are looking for an experienced backend engineer to join our growing team. You will be working on scalable microservices...",
  "publishAt": "2025-11-01T00:00:00.000Z",
  "updatedAt": "2025-10-18T10:30:00.000Z",
  "extra": {
    "salary_range": "$120k-180k",
    "experience_years": 5,
    "remote_allowed": true
  }
}
```

**Differences from list view:**
- `description`: Full description (not excerpted)
- No `description_excerpt` field

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Job with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

**Notes:**
- Returns 404 if job is not public (`isPublic = false`)
- Returns 404 if job is not yet published (`publishAt > current_time`)
- Returns 404 if job is expired (`expireAt < current_time`)

---

## Application Management APIs (Private)

Base path: `/applications`

### 1. Create Application

Create a new job application (internal use).

**Endpoint:** `POST /applications`

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "applicantName": "John Doe",
  "applicantEmail": "john.doe@example.com",
  "applicantPhone": "+1-555-0100",
  "resumeUrl": "https://storage.example.com/resumes/john-doe.pdf",
  "coverLetter": "I am excited to apply for this position...",
  "status": "PENDING"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobId` | UUID string | ✅ Yes | ID of the job being applied to |
| `applicantName` | string | ✅ Yes | Applicant's full name |
| `applicantEmail` | string | ✅ Yes | Applicant's email address |
| `applicantPhone` | string | ✅ Yes | Applicant's phone number |
| `resumeUrl` | string | ✅ Yes | URL to uploaded resume |
| `coverLetter` | string | ❌ No | Optional cover letter text |
| `status` | enum | ✅ Yes | Application status: `PENDING`, `REVIEWED`, `REJECTED`, `HIRED` |

**Success Response:** `200 OK`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "applicantName": "John Doe",
  "applicantEmail": "john.doe@example.com",
  "applicantPhone": "+1-555-0100",
  "resumeUrl": "https://storage.example.com/resumes/john-doe.pdf",
  "coverLetter": "I am excited to apply for this position...",
  "status": "PENDING",
  "createdAt": "2025-10-18T11:00:00.000Z",
  "updatedAt": "2025-10-18T11:00:00.000Z"
}
```

---

### 2. Get All Applications

Retrieve all applications for the authenticated tenant.

**Endpoint:** `GET /applications`

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
```

**Success Response:** `200 OK`
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "applicantName": "John Doe",
    "applicantEmail": "john.doe@example.com",
    "applicantPhone": "+1-555-0100",
    "resumeUrl": "https://storage.example.com/resumes/john-doe.pdf",
    "coverLetter": "I am excited to apply...",
    "status": "PENDING",
    "createdAt": "2025-10-18T11:00:00.000Z",
    "updatedAt": "2025-10-18T11:00:00.000Z"
  }
]
```

---

### 3. Get Application by ID

Retrieve a specific application by its ID.

**Endpoint:** `GET /applications/:applicationId`

**Path Parameters:**
- `applicationId` (UUID) - The application identifier

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
```

**Success Response:** `200 OK`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "applicantName": "John Doe",
  "applicantEmail": "john.doe@example.com",
  "applicantPhone": "+1-555-0100",
  "resumeUrl": "https://storage.example.com/resumes/john-doe.pdf",
  "coverLetter": "I am excited to apply...",
  "status": "REVIEWED",
  "createdAt": "2025-10-18T11:00:00.000Z",
  "updatedAt": "2025-10-18T14:30:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Application with ID 770e8400-e29b-41d4-a716-446655440002 not found",
  "error": "Not Found"
}
```

---

### 4. Update Application

Update an existing application (e.g., change status).

**Endpoint:** `PUT /applications/:applicationId`

**Path Parameters:**
- `applicationId` (UUID) - The application identifier

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
All fields are optional.

```json
{
  "status": "REVIEWED",
  "applicantName": "John M. Doe"
}
```

**Success Response:** `200 OK`
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "tenantId": "123e4567-e89b-12d3-a456-426614174000",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "applicantName": "John M. Doe",
  "applicantEmail": "john.doe@example.com",
  "applicantPhone": "+1-555-0100",
  "resumeUrl": "https://storage.example.com/resumes/john-doe.pdf",
  "coverLetter": "I am excited to apply...",
  "status": "REVIEWED",
  "createdAt": "2025-10-18T11:00:00.000Z",
  "updatedAt": "2025-10-18T14:30:00.000Z"
}
```

---

### 5. Delete Application

Delete an application.

**Endpoint:** `DELETE /applications/:applicationId`

**Path Parameters:**
- `applicationId` (UUID) - The application identifier

**Headers:**
```http
x-tenant-id: <tenant-uuid>
Authorization: Bearer <jwt-token>
```

**Success Response:** `200 OK`
```json
{}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Application with ID 770e8400-e29b-41d4-a716-446655440002 not found",
  "error": "Not Found"
}
```

---

## Public Application APIs

Base path: `/public/applications`

### 1. Submit Application

Submit a job application publicly (for candidates). Rate-limited and CAPTCHA protected.

**Endpoint:** `POST /public/applications`

**Headers:**
```http
Host: <tenant-subdomain>.yourdomain.com
Content-Type: application/json
```

**Rate Limiting:**
- 10 requests per hour per tenant (configurable via `THROTTLE_LIMIT` and `THROTTLE_TTL`)
- Returns `429 Too Many Requests` when limit exceeded

**CAPTCHA:**
- Required if `CAPTCHA_ENABLED=true` in environment
- Supports Cloudflare Turnstile or hCaptcha
- Provider configured via `CAPTCHA_PROVIDER` env variable

**Request Body:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "applicantName": "Jane Smith",
  "applicantEmail": "jane.smith@example.com",
  "applicantPhone": "+1-555-0200",
  "resumeUrl": "https://storage.example.com/resumes/jane-smith.pdf",
  "coverLetter": "I am passionate about this role...",
  "captcha_token": "0.ABC123...XYZ"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `job_id` | UUID string | ✅ Yes | ID of the job being applied to |
| `applicant_name` | string | ✅ Yes | Applicant's full name |
| `applicant_email` | email | ✅ Yes | Applicant's email (validated) |
| `applicant_phone` | string | ❌ No | Applicant's phone number |
| `resume_url` | string | ❌ No | URL to uploaded resume |
| `cover_letter` | string | ❌ No | Optional cover letter text |
| `captcha_token` | string | Conditional | Required if CAPTCHA is enabled |

**Success Response:** `201 Created`
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "status": "PENDING"
}
```

**Notes:**
- Application status is automatically set to `PENDING`
- Tenant is resolved from subdomain in Host header
- IP address is extracted for CAPTCHA validation
- Limited response to prevent data leakage

**Error Response:** `400 Bad Request` (Validation Error)
```json
{
  "statusCode": 400,
  "message": [
    "applicantEmail must be an email"
  ],
  "error": "Bad Request"
}
```

**Error Response:** `400 Bad Request` (CAPTCHA Failed)
```json
{
  "statusCode": 400,
  "message": "CAPTCHA verification failed. Please try again.",
  "error": "Bad Request"
}
```

**Error Response:** `429 Too Many Requests`
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded. Please try again later.",
  "error": "Too Many Requests"
}
```

---

## Error Responses

### Common HTTP Status Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| `400 Bad Request` | Invalid request data | Missing required fields, validation errors, invalid JSON |
| `401 Unauthorized` | Authentication failed | Missing/invalid JWT token, tenant ID mismatch |
| `403 Forbidden` | Insufficient permissions | Missing required role (ADMIN/HR) |
| `404 Not Found` | Resource not found | Invalid ID, deleted resource, unpublished job |
| `429 Too Many Requests` | Rate limit exceeded | Too many requests to public endpoints |
| `500 Internal Server Error` | Server error | Database errors, unexpected exceptions |

### Error Response Format

All errors follow this structure:

```json
{
  "statusCode": 400,
  "message": "Error description or array of validation errors",
  "error": "HTTP error name"
}
```

**Examples:**

**Single Error:**
```json
{
  "statusCode": 404,
  "message": "Job with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "error": "Not Found"
}
```

**Validation Errors:**
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "expireAt must be after publishAt",
    "extra: missing required property 'salary_range'"
  ],
  "error": "Bad Request"
}
```

---

## Data Models

### Job

```typescript
{
  id: string;                             // UUID
  tenantId: string;                       // UUID
  title: string;                          // Required
  description?: string | null;            // Optional
  location?: string | null;               // Optional
  department?: string | null;             // Optional
  isPublic: boolean;                      // Default: false
  publishAt?: Date | null;                // ISO 8601 timestamp
  expireAt?: Date | null;                 // ISO 8601 timestamp
  externalApplyUrl?: string | null;       // URL or null
  extra?: Record<string, unknown> | null; // Tenant-specific JSON
  createdAt: Date;                        // ISO 8601 timestamp
  updatedAt: Date;                        // ISO 8601 timestamp
}
```

### Application

```typescript
{
  id: string;                    // UUID
  tenantId: string;              // UUID
  jobId: string;                 // UUID (foreign key to Job)
  applicantName: string;         // Required
  applicantEmail: string;        // Required
  applicantPhone?: string | null; // Optional
  resumeUrl?: string | null;     // URL or null
  coverLetter?: string | null;   // Optional text
  status: 'PENDING' | 'REVIEWED' | 'REJECTED' | 'HIRED'; // Enum
  createdAt: Date;               // ISO 8601 timestamp
  updatedAt: Date;               // ISO 8601 timestamp
}
```

### PublicJobDto (List View)

```typescript
{
  id: string;                     // UUID
  title: string;
  department?: string;
  location?: string;
  description_excerpt: string;    // First 100 chars of description
  publish_at: Date;               // ISO 8601 timestamp (kept as snake_case for API response)
  updated_at: Date;               // ISO 8601 timestamp (kept as snake_case for API response)
  extra?: Record<string, unknown> | null;
}
```

### PublicJobDetailDto (Detail View)

```typescript
{
  id: string;                     // UUID
  title: string;
  department?: string;
  location?: string;
  description?: string;           // Full description
  publish_at: Date;               // ISO 8601 timestamp (kept as snake_case for API response)
  updated_at: Date;               // ISO 8601 timestamp (kept as snake_case for API response)
  extra?: Record<string, unknown> | null;
}
```

### PublicJobsResponseDto (Paginated)

```typescript
{
  data: PublicJobDto[];           // Array of jobs
  total: number;                  // Total count for pagination
}
```

### PublicApplicationResponseDto

```typescript
{
  id: string;                     // UUID
  status: string;                 // Application status
}
```

---

## Notes for Frontend Developers

### 1. Authentication Setup

**For Private Routes:**
```javascript
const headers = {
  'x-tenant-id': tenantId,
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
};

const response = await fetch('http://localhost:8080/job', {
  method: 'GET',
  headers: headers
});
```

**For Public Routes:**
```javascript
const headers = {
  'Host': `${tenantSubdomain}.yourdomain.com`,
  'Content-Type': 'application/json'
};

const response = await fetch('http://localhost:8080/public/jobs', {
  method: 'GET',
  headers: headers
});
```

### 2. Custom Fields (extra)

The `extra` field is validated against a tenant-specific JSON schema. You should:

1. Fetch the tenant's schema (if exposed via API) or handle validation errors dynamically
2. Build dynamic forms based on the schema
3. Handle validation errors gracefully:

```javascript
try {
  const response = await createJob(jobData);
} catch (error) {
  if (error.statusCode === 400 && Array.isArray(error.message)) {
    // Display field-level errors
    error.message.forEach(msg => {
      if (msg.startsWith('extra:')) {
        // Handle extra field validation errors
        console.error('Custom field error:', msg);
      }
    });
  }
}
```

### 3. Pagination

Implement pagination for public job listings:

```javascript
const page = 1;
const pageSize = 20;

const response = await fetch(
  `http://localhost:8080/public/jobs?page=${page}&pageSize=${pageSize}`,
  { headers: { 'Host': `${tenantSubdomain}.yourdomain.com` } }
);

const { data, total } = await response.json();
const totalPages = Math.ceil(total / pageSize);
```

### 4. CAPTCHA Integration

When CAPTCHA is enabled, integrate the appropriate provider:

**Cloudflare Turnstile:**
```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
```

**hCaptcha:**
```html
<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
<div class="h-captcha" data-sitekey="YOUR_SITE_KEY"></div>
```

Include the token in the application submission:
```javascript
const captchaToken = document.querySelector('[name="cf-turnstile-response"]').value;
// or for hCaptcha:
const captchaToken = document.querySelector('[name="h-captcha-response"]').value;

const applicationData = {
  job_id: jobId,
  applicant_name: name,
  applicant_email: email,
  captcha_token: captchaToken
};
```

### 5. Date Handling

All dates are in ISO 8601 format. Handle timezone conversions appropriately:

```javascript
const publishDate = new Date(job.publish_at);
const formattedDate = publishDate.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

### 6. Error Handling

Implement comprehensive error handling:

```javascript
async function apiRequest(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();

      switch (error.statusCode) {
        case 400:
          // Validation errors
          handleValidationErrors(error.message);
          break;
        case 401:
          // Redirect to login
          redirectToLogin();
          break;
        case 404:
          // Resource not found
          showNotFoundMessage();
          break;
        case 429:
          // Rate limited
          showRateLimitMessage();
          break;
        default:
          // Generic error
          showGenericError();
      }

      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## Changelog

**v1.0 (2025-10-18)**
- Initial API documentation
- Job management endpoints (private)
- Public job listing endpoints
- Application management endpoints (private)
- Public application submission endpoint
- Custom field validation with tenant schemas
- Rate limiting and CAPTCHA support

---

## Support

For questions or issues:
- Create an issue in the project repository
- Contact the backend team

**Environment Variables Reference:**
- `JWT_SECRET`: Secret key for JWT token verification
- `THROTTLE_LIMIT`: Rate limit for public endpoints (default: 10)
- `THROTTLE_TTL`: Rate limit time window in ms (default: 3600000)
- `CAPTCHA_ENABLED`: Enable CAPTCHA protection (true/false)
- `CAPTCHA_PROVIDER`: CAPTCHA provider (turnstile/hcaptcha)
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret
- `HCAPTCHA_SECRET_KEY`: hCaptcha secret
