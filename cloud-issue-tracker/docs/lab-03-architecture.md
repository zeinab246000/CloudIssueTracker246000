# Lab 3 — Cloud Issue Tracker Architecture

## 1. Application Goal
A small internal application where users report technical issues, see every reported issue, and mark issues as resolved or reopen them.

## 2. Functional Scope
- Create an issue.
- View all issues.
- Change an issue status.

## 3. Request Flow

**Create issue**
```
User → Frontend form → POST /api/issues → API validation → Data layer
     ← Render created issue ← 201 + JSON ←───────────────────────┘
```
1. The user fills in the form and clicks Submit.
2. The frontend sends `POST /api/issues` with the form data as JSON.
3. The API validates the data. If invalid, it returns 400 and an error message.
4. The data layer stores the issue and gives it an id, status `Open` and `createdAt`.
5. The API replies 201 Created with the new issue as JSON.
6. The frontend shows the new issue.

**View issues**
```
Page load → GET /api/issues → API → Data layer
          ← Render list ← 200 + JSON array ←┘
```

**Change status**
```
Button → PATCH /api/issues/{id}/status → API validation → Data layer
       ← Re-render issue ← 200 + updated JSON ←───────────────┘
```
The API checks that the issue exists (otherwise 404) and that the new status is allowed (otherwise 400).

## 4. Trust Boundaries
```
USER-CONTROLLED SIDE                 APPLICATION-CONTROLLED SIDE
Browser input ── HTTP request ──▶ REST API ──▶ Data
      ▲                              │
      └──────── JSON response ◀──────┘
```
1. The API validates every request. Frontend checks are only for convenience, never for security.
2. The browser never talks to the data layer directly.
3. The API returns only what the frontend needs and never leaks internal errors or stack traces.
4. The frontend shows issue text as plain text (`textContent`), never as HTML.
