# API Contract: Issues API

## Data Dictionary: Issue

| Field | Type | Source | Rule |
|---|---|---|---|
| id | string | Server | Required in stored/returned resource; unique; immutable. |
| title | string | Client | Required; trim whitespace; 3–100 characters. |
| description | string | Client | Required; trim whitespace; 5–500 characters. |
| priority | string enum | Client | One of Low, Medium, High. |
| status | string enum | Server / controlled update | Open or Resolved. New issues start as Open. |
| createdAt | string (ISO 8601) | Server | Created when the issue is accepted; immutable. |

A complete issue returned by the API has this shape:

```json
{
  "id": "ISS-101",
  "title": "Unable to access Wi-Fi",
  "description": "Connection fails in the teaching lab.",
  "priority": "High",
  "status": "Open",
  "createdAt": "2026-09-15T12:30:00.000Z"
}
```

## Contract 1: View All Issues

- Request: `GET /api/issues`
- Request body: none

Successful response: `200 OK` with a JSON array.

```json
[
  {
    "id": "ISS-101",
    "title": "Unable to access Wi-Fi",
    "description": "Connection fails in the teaching lab.",
    "priority": "High",
    "status": "Open",
    "createdAt": "2026-09-15T12:30:00.000Z"
  }
]
```

Empty result (not an error):

```json
[]
```

Errors: `500`.

## Contract 2: Create an Issue

- Request: `POST /api/issues`
- Header: `Content-Type: application/json`
- Header: `X-Turnstile-Token: <token from the Cloudflare Turnstile widget>` (Lab 5 Part 15)

Request body (client-owned fields only):

```json
{
  "title": "Projector not detected",
  "description": "Laptop cannot detect the classroom projector.",
  "priority": "Medium"
}
```

Successful response: `201 Created` with the complete created issue.

```json
{
  "id": "ISS-102",
  "title": "Projector not detected",
  "description": "Laptop cannot detect the classroom projector.",
  "priority": "Medium",
  "status": "Open",
  "createdAt": "2026-09-15T12:35:00.000Z"
}
```

Errors: `400`, `403`, `415`, `500`.

## Contract 3: Change Issue Status

- Request: `PATCH /api/issues/{id}/status`
- Header: `Content-Type: application/json`

Request body:

```json
{
  "status": "Resolved"
}
```

Successful response: `200 OK` with the complete updated issue.

```json
{
  "id": "ISS-101",
  "title": "Unable to access Wi-Fi",
  "description": "Connection fails in the teaching lab.",
  "priority": "High",
  "status": "Resolved",
  "createdAt": "2026-09-15T12:30:00.000Z"
}
```

Errors: `400`, `404`, `415`, `500`.

## Error Responses

Every error response uses the same JSON shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must contain between 3 and 100 characters."
  }
}
```

| Status | Code | Returned when |
|---|---|---|
| 400 | VALIDATION_ERROR | The data sent is missing, malformed or breaks a rule. |
| 403 | BOT_CHECK_FAILED | The Turnstile token is missing, invalid, expired or already used. |
| 404 | ISSUE_NOT_FOUND | The id in the URL does not exist. |
| 404 | ROUTE_NOT_FOUND | The method and path do not match any endpoint. |
| 415 | UNSUPPORTED_MEDIA_TYPE | The body is not JSON although the endpoint requires JSON. |
| 500 | INTERNAL_ERROR | Something unexpected failed on the server. |
