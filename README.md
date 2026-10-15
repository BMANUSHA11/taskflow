# TaskFlow API

A small REST API for managing tasks, built with **Node.js, Express and SQLite**.
Features CRUD operations, filtering, search, pagination, input validation, consistent error responses and unit tests.

## Tech Stack
Node.js · Express · SQLite · dotenv · Node's built-in test runner

## Setup

```bash
npm install
npm start                   # http://localhost:3000
npm test
```

The app creates its SQLite database automatically in `data/taskflow.db` the first time it starts. No separate database installation or configuration is needed.

## API Reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/tasks` | List tasks (filter, search, paginate) |
| GET | `/api/tasks/stats` | Task counts per status |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Partially update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Task object
| Field | Type | Notes |
|-------|------|-------|
| id | integer | auto-generated |
| title | string | required, max 150 chars |
| description | string \| null | optional |
| status | `todo` \| `in_progress` \| `done` | default `todo` |
| priority | `low` \| `medium` \| `high` | default `medium` |
| due_date | `YYYY-MM-DD` \| null | optional |
| created_at / updated_at | timestamp | auto-managed |

### GET /api/tasks
Query params: `status`, `priority`, `q` (title search), `page` (default 1), `limit` (default 10, max 100)

```bash
curl "http://localhost:3000/api/tasks?status=todo&priority=high&page=1&limit=5"
```
```json
{
  "data": [ { "id": 1, "title": "Finish DBMS assignment", "status": "todo", "priority": "high" } ],
  "meta": { "page": 1, "limit": 5, "total": 1, "totalPages": 1 }
}
```

### POST /api/tasks
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write README","priority":"high","due_date":"2026-11-10"}'
```
Returns `201 Created` with the new task.

### PATCH /api/tasks/:id
```bash
curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" -d '{"status":"done"}'
```

### Error responses
| Code | Meaning |
|------|---------|
| 400 | Validation error: `{ "errors": ["..."] }` or invalid JSON |
| 404 | Task or route not found |
| 500 | Unexpected server error |

## Possible Next Steps
- React/Next.js + Tailwind front end
- JWT authentication and per-user tasks
- Migrate to TypeScript, add OpenAPI/Swagger docs
