# Cloud Computing & Cloud Security — Lab 5
## Connect the Frontend to the Local REST API and Deploy to Cloudflare + Vercel

**Resource:** Cloud Issue Tracker  
**Services:** Neon Postgres, Vercel, Cloudflare Pages, Cloudflare Turnstile  
**Rule:** Finish and verify the local full-stack version before deploying.

## Lab Overview
This lab joins the browser frontend to an Express REST API using `fetch()`, `async/await`, and JSON. Students inspect GET, POST, and PATCH requests in Developer Tools, then deploy the API to Vercel, the static frontend to Cloudflare Pages, and persistent data to Neon Postgres. Cloudflare security headers and Turnstile are configured after the basic deployment works.

## Learning Outcomes
- Explain why different local ports create different browser origins and why CORS is needed.
- Use `fetch()`, `async/await`, and `try/catch` to call a REST API.
- Implement view, create, and status-change flows through the API.
- Inspect methods, URLs, status codes, payloads, and responses in Developer Tools.
- Configure Neon Postgres and protect connection strings with environment variables.
- Publish the API on Vercel and the frontend on Cloudflare Pages from GitHub.
- Configure CORS for local and deployed frontend origins.
- Add security response headers and verify Turnstile tokens on the server.
- Prove that data persists across browsers and devices.

## Target Architecture

```text
LOCAL
Browser (http://localhost:8080)
    | fetch() + JSON
    v
Express REST API (http://localhost:3000)
    |
    v
Neon Postgres (issues table)

CLOUD
Browser
  | HTTPS frontend                  | HTTPS + JSON API
  v                                  v
Cloudflare Pages  ------------->  Vercel / Express API
                                     |
                                     | SQL over TLS
                                     v
                                  Neon Postgres
```

## Required accounts and tools
- Git and a GitHub account
- Node.js 20+ and a code editor
- Neon account (Free plan)
- Vercel account connected to GitHub (Hobby plan for personal/non-commercial learning)
- Cloudflare account (Free plan)
- Cloudflare Turnstile widget
- Browser Developer Tools; Postman or VS Code REST Client is recommended

Account plans, quotas, and dashboard labels can change. Select the free/personal option appropriate to your use and review the provider's current terms. Do not enter payment details unless you deliberately choose a plan that requires them.

---

# LAB Experiment

## Part 1 — Get the Project and Create Your GitHub Repository

### Step 1: Download and extract the ZIP
1. Download the supplied `cloud-issue-tracker-deployment-ready.zip`.
2. Extract it to a folder named `cloud-issue-tracker`.
3. Open that folder in your code editor.
4. Confirm that `frontend/`, `backend/`, `docs/`, `practice/`, and `evidence/` are present.

### Step 2: Create an empty GitHub repository
1. Sign in to GitHub and select **New repository**.
2. Repository name: `cloud-issue-tracker` (or a name assigned by your instructor).
3. Choose **Private** if this is coursework not intended for public viewing; otherwise choose Public.
4. Do **not** initialize with a README, `.gitignore`, or license because the downloaded project already contains them.
5. Select **Create repository** and keep the page open to copy the repository URL.

### Step 3: Push the project from your computer
Open a terminal in the extracted project root and run:

```bash
git init
git branch -M main
git add .
git status
```

Review the file list. **Do not continue if `.env`, a database URL, or a secret key is listed.** Then commit and connect your new repository:

```bash
git commit -m "Add Cloud Issue Tracker lab starter"
git remote add origin https://github.com/YOUR-USERNAME/cloud-issue-tracker.git
git push -u origin main
```

Replace `YOUR-USERNAME` and the repository name with your own. If Git asks you to authenticate, use GitHub's browser sign-in or an approved credential manager; do not put a password or token into the remote URL.

### Checkpoint 1
- [ ] Repository exists on GitHub.
- [ ] The `main` branch contains `frontend/`, `backend/`, `docs/`, and `README.md`.
- [ ] No `.env`, password, database URL, or production secret is committed.

## Part 2 — Configure Neon Postgres

### Step 1: Create the database
1. Sign in to Neon and create a project named `cloud-issue-tracker`.
2. Select a region reasonably close to the Vercel function region you plan to use.
3. Open **SQL Editor** and run the contents of `backend/db/schema.sql`.

The table contains `id`, `title`, `description`, `priority`, `status`, and `created_at`. Database defaults create the ID, status, and timestamp.

### Step 2: Add the connection string locally
1. In Neon, select **Connect** and copy the pooled connection string.
2. Copy `backend/.env.example` to `backend/.env`.
3. Put the real connection string after `DATABASE_URL=` in `backend/.env`.
4. Keep the other local settings, including `CORS_ORIGINS=http://localhost:8080` and the provided Turnstile **test** secret.

**Never commit `backend/.env`.** The `.env.example` contains placeholders and safe local test settings only. Treat `DATABASE_URL` like a password.

### Checkpoint 2
- [ ] The `issues` table exists in the intended Neon database.
- [ ] `DATABASE_URL` is in `backend/.env`, not source code or Git.
- [ ] The `.env` file is ignored by Git.

## Part 3 — Run and Test the Full Stack Locally

### Step 1: Install and start the backend
In Terminal 1:

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:3000`.

### Step 2: Install and start the frontend
In Terminal 2, from the repository root:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:8080`.

### Step 3: Verify all three operations
1. Refresh the page. Existing issues should load from `GET /api/issues`.
2. Create an issue. The browser sends `POST /api/issues`; the local Turnstile test widget/token should pass.
3. Click **Mark Resolved** or **Reopen**. The browser sends `PATCH /api/issues/{id}/status`.
4. Refresh the page and verify the issue remains.
5. Open Neon’s table view and confirm the row and status.

### Step 4: Inspect Network requests
Open Developer Tools → **Network** and verify:

| Action | Request | Expected result |
|---|---|---|
| Open/refresh | `GET /api/issues` | `200` + JSON array |
| Create issue | `POST /api/issues` | `201` + created issue |
| Change status | `PATCH /api/issues/{id}/status` | `200` + updated issue |

### Checkpoint 3
- [ ] GET, POST, and PATCH work locally.
- [ ] Data persists after refresh and is visible in Neon.
- [ ] No CORS or uncaught JavaScript errors appear.
- [ ] `git status` shows no `.env` file.

## Part 4 — Deploy the API to Vercel

### Step 1: Import the repository
1. Sign in to Vercel using the GitHub account that owns the repository.
2. Select **Add New → Project**, then import `cloud-issue-tracker`.
3. In project configuration, set **Root Directory** to `backend`.
4. Keep the detected Node/Express configuration unless the dashboard reports a build issue.

### Step 2: Add environment variables
In Vercel → Project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `DATABASE_URL` | Your Neon pooled connection string |
| `CORS_ORIGINS` | `http://localhost:8080` initially |
| `TURNSTILE_SECRET_KEY` | Use the official test secret only for initial deployment testing; replace with real secret after creating Turnstile widget |
| `NODE_ENV` | `production` |

Do not paste these values into source code or screenshots. Deploy the project.

### Step 3: Test the deployed API
Copy the **production domain** from Vercel’s Domains section, such as `https://your-project.vercel.app`. Open:

`https://YOUR-PROJECT.vercel.app/api/issues`

Expected result: JSON array. If the request fails, check Vercel deployment logs and confirm all environment variables were saved for the Production environment.

### Checkpoint 4
- [ ] The Vercel deployment succeeds.
- [ ] `/api/issues` returns JSON over HTTPS.
- [ ] No database credentials are committed to GitHub.

## Part 5 — Publish the Frontend on Cloudflare Pages

### Step 1: Configure the API URL
Open `frontend/js/app.js`. Replace `YOUR-PROJECT` in the production `API_BASE_URL` with the Vercel production hostname, for example:

```js
const API_BASE_URL = isLocal
  ? 'http://localhost:3000/api/issues'
  : 'https://YOUR-PROJECT.vercel.app/api/issues';
```

Replace `YOUR-PROJECT` with the real Vercel project domain. Keep `https://` and `/api/issues`.

### Step 2: Import into Cloudflare Pages
1. Open Cloudflare Dashboard → **Workers & Pages**.
2. Choose **Create application → Pages → Import an existing Git repository**.
3. Select the same GitHub repository.
4. Set Production branch to `main`.
5. Framework preset: `None`.
6. Build command: `exit 0`.
7. Build output directory: `frontend`.
8. Save and deploy.

Cloudflare provides a `https://YOUR-PROJECT.pages.dev` URL after the first successful build.

### Step 3: Allow the deployed frontend in CORS
1. Copy the exact Pages origin (scheme + hostname only, no path and no trailing slash).
2. In Vercel Environment Variables, set `CORS_ORIGINS` to:

`http://localhost:8080,https://YOUR-PROJECT.pages.dev`

3. Save and redeploy the Vercel project so the new environment variable takes effect.
4. Push the updated `frontend/js/app.js` to GitHub so Cloudflare Pages rebuilds.

### Checkpoint 5
- [ ] Pages serves the frontend over HTTPS.
- [ ] The frontend calls the Vercel API, not localhost.
- [ ] GET, POST, and PATCH succeed from the public Pages site.
- [ ] No CORS errors appear in the browser console.

## Part 6 — Configure Cloudflare Turnstile

### Step 1: Create a widget
1. In Cloudflare Dashboard, open **Turnstile** and add a widget.
2. Add your exact `YOUR-PROJECT.pages.dev` hostname.
3. Use Managed mode unless your instructor specifies otherwise.
4. Copy the **Site Key** and **Secret Key** separately.

### Step 2: Configure the frontend
In `frontend/js/app.js`, replace `YOUR-TURNSTILE-SITE-KEY` with the public Site Key. Do not put the Secret Key in the frontend.

### Step 3: Configure the API
In Vercel → Settings → Environment Variables, set `TURNSTILE_SECRET_KEY` to the real Secret Key. Redeploy Vercel.

The project already verifies `X-Turnstile-Token` server-side before creating an issue. A widget in the browser alone is not sufficient; server-side verification is the important security boundary.

### Step 4: Update the security policy
Open `frontend/_headers`. Replace `YOUR-PROJECT` in the `connect-src` directive with the same Vercel hostname. Keep the Content-Security-Policy value on one line. Commit and push changes.

### Checkpoint 6
- [ ] The Turnstile widget appears on the deployed form.
- [ ] Creating an issue succeeds with a valid widget token.
- [ ] A POST without a valid token returns `403 BOT_CHECK_FAILED`.
- [ ] The real Turnstile Secret Key exists only in Vercel, not GitHub or frontend code.

## Part 7 — Add and Verify Security Headers

The `frontend/_headers` file is processed by Cloudflare Pages. It sets a Content-Security-Policy and headers such as `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, and Cross-Origin-Opener-Policy.

After deployment, run:

```bash
curl -I https://YOUR-PROJECT.pages.dev
```

Verify that the response includes the configured headers. Open the app and ensure the Console does not report CSP errors. If you later add external scripts, fonts, or images, update the policy deliberately rather than removing it wholesale.

### Checkpoint 7
- [ ] `curl -I` shows the configured headers.
- [ ] The app still loads and all three API operations work.
- [ ] No secret values appear in terminal screenshots or repository files.

## Part 8 — Final End-to-End Test and Evidence

1. Create an issue on the public Pages site.
2. Refresh the page and verify the issue remains.
3. Open the same Pages URL on a second device/browser.
4. Confirm the same issue appears and its status can be changed.
5. Confirm the matching row in Neon.
6. Open GitHub and verify the latest commit and clean repository state.

### Evidence to capture
- Screenshot 1: GitHub repository showing the project structure.
- Screenshot 2: local Network tab showing GET, POST, and PATCH.
- Screenshot 3: Neon `issues` table with a sample row (no connection string).
- Screenshot 4: Vercel deployment and `/api/issues` response.
- Screenshot 5: Cloudflare Pages live app.
- Screenshot 6: public Network tab showing requests to the Vercel API.
- Screenshot 7: Turnstile widget and successful create flow.
- Screenshot 8: `curl -I` showing security headers.
- Screenshot 9: same issue visible on a second device.

## Final Technical Checkpoint
- [ ] Repository pushed to GitHub; no `.env` or secrets tracked.
- [ ] Neon is the persistent data source.
- [ ] Vercel API returns `GET /api/issues` over HTTPS.
- [ ] Cloudflare Pages serves the frontend over HTTPS.
- [ ] CORS allows the exact local and deployed frontend origins.
- [ ] GET, POST, and PATCH work on the deployed application.
- [ ] Turnstile token is verified on the server.
- [ ] Security headers are present and the browser console is clean.
- [ ] Persistence is verified from another device and Neon.

## Common Problems and Troubleshooting

| Symptom | Likely cause | Check |
|---|---|---|
| `Failed to fetch` | API URL incorrect or API unavailable | Open Vercel `/api/issues`; inspect Console and Vercel logs |
| CORS error on Pages | Pages origin missing from `CORS_ORIGINS` | Exact scheme/host, no trailing slash; redeploy Vercel |
| Vercel returns 500 | Missing/wrong `DATABASE_URL` or missing table | Check Vercel environment variables and Neon SQL Editor |
| Neon says relation does not exist | Schema created in another DB/branch | Run `backend/db/schema.sql` in the database used by `DATABASE_URL` |
| Pages returns 404 | Wrong output directory | Set output directory to `frontend`; `index.html` must be directly inside |
| Create issue returns 403 | Missing/expired Turnstile token or wrong keys | Verify Pages hostname and matching Site/Secret keys |
| Turnstile widget not visible | Wrong Site Key or CSP blocks script | Check browser Console, hostname, and `_headers` CSP |
| New settings do not work | Deployment did not rebuild | Redeploy Vercel/Pages after changing variables or code |
| Git lists `.env` | File created or force-added | Do not commit; untrack it if necessary and rotate any leaked credentials |

## Independent Challenge
Add a disabled/loading state to the submit button while the POST request is in progress. Re-enable it in `finally`, preserve the API contract, and commit the improvement separately.

## End-of-Lab Architecture
```text
Browser → Cloudflare Pages frontend → Vercel Express REST API → Neon Postgres
                    |
                    └── Security headers + Turnstile widget
Vercel API verifies Turnstile tokens before POST /api/issues.
```

**Next lab:** harden API validation, rate limiting, logging, error handling, and security configuration.
