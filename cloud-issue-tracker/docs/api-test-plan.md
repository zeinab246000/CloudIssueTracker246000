# API Test Plan

| Test ID | Request | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|
| T01 | GET /api/issues | 200; JSON array returned. | | |
| T02 | POST valid title, description, priority | 201; complete created issue returned. | | |
| T03 | POST missing title | 400; VALIDATION_ERROR. | | |
| T04 | POST invalid priority = Critical | 400; VALIDATION_ERROR. | | |
| T05 | PATCH existing issue status = Resolved | 200; returned status is Resolved. | | |
| T06 | PATCH status = Deleted | 400; VALIDATION_ERROR. | | |
| T07 | PATCH unknown issue ID | 404; ISSUE_NOT_FOUND. | | |
| T08 | GET when no issues exist | 200; empty JSON array. | | |
| T09 | Send unexpected extra server-owned fields | 201; new UUID id, status Open, createdAt now. | | |
| T10 | POST without JSON (Content-Type: text/plain) | 415; UNSUPPORTED_MEDIA_TYPE. | | |
| T11 | POST malformed JSON (trailing comma) | 400; VALIDATION_ERROR "Request body is not valid JSON." | | |
| T12 | PATCH /api/fake-url | 404; ROUTE_NOT_FOUND. | | |
| T13 | POST valid body without X-Turnstile-Token | 403; BOT_CHECK_FAILED. | | |

All POST tests except T13 send the header `X-Turnstile-Token: XXXX.DUMMY.TOKEN.XXXX` (accepted by the Turnstile test secret key in `.env`).
