// Lab 5: the REST API is now the source of truth (no in-memory issues array)
// Local machine → local API; deployed site (Cloudflare Pages) → Vercel API.
// Replace YOUR-PROJECT with your own Vercel project domain.
const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE_URL = isLocal
  ? 'http://localhost:3000/api/issues'
  : 'https://cloud-issue-tracker246000.vercel.app/api/issuescd';

// Lab 5 Part 15: Turnstile site key (public). Locally use Cloudflare's test key.
const TURNSTILE_SITE_KEY = isLocal
  ? '1x00000000000000000000AA'
  : 'YOUR-TURNSTILE-SITE-KEY';

const issueForm = document.querySelector('#issue-form');
const titleInput = document.querySelector('#title');
const descriptionInput = document.querySelector('#description');
const priorityInput = document.querySelector('#priority');
const issuesList = document.querySelector('#issues-list');
const issueCount = document.querySelector('#issue-count');
const formMessage = document.querySelector('#form-message');

// Draw the Turnstile widget inside the form (explicit rendering)
let turnstileWidgetId = null;
if (window.turnstile) {
  turnstileWidgetId = turnstile.render('#turnstile-widget', {
    sitekey: TURNSTILE_SITE_KEY
  });
}

// Send a request, parse the JSON body, and throw if the status is not 2xx
async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);

  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  }

  if (!response.ok) {
    // API errors look like { error: { code, message } } (see docs/api-contract.md)
    const message = body?.error?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body;
}

function renderIssues(issues) {
  issuesList.replaceChildren();
  issueCount.textContent = issues.length;

  issues.forEach((issue) => {
    const card = document.createElement('article');
    card.className = 'issue-card';

    const heading = document.createElement('h3');
    heading.textContent = issue.title;

    const description = document.createElement('p');
    description.textContent = issue.description;

    const meta = document.createElement('p');
    meta.textContent = `Priority: ${issue.priority} | Status: ${issue.status}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = issue.status === 'Open' ? 'Mark Resolved' : 'Reopen';
    button.addEventListener('click', () => changeIssueStatus(issue));

    card.append(heading, description, meta, button);
    issuesList.append(card);
  });
}

// View: GET /api/issues
async function loadIssues() {
  try {
    formMessage.textContent = 'Loading issues...';
    const issues = await apiRequest(API_BASE_URL);
    renderIssues(issues);
    formMessage.textContent = '';
  } catch (error) {
    console.error(error);
    formMessage.textContent = `Could not load issues: ${error.message}`;
  }
}

// Create: POST /api/issues
issueForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    priority: priorityInput.value
  };

  const turnstileToken = window.turnstile ? turnstile.getResponse(turnstileWidgetId) : '';
  if (!turnstileToken) {
    formMessage.textContent = 'Please complete the bot check first.';
    return;
  }

  try {
    formMessage.textContent = 'Submitting issue...';

    await apiRequest(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Turnstile-Token': turnstileToken
      },
      body: JSON.stringify(payload)
    });

    issueForm.reset();
    priorityInput.value = 'Medium';
    await loadIssues();
    formMessage.textContent = 'Issue created successfully.';
  } catch (error) {
    console.error(error);
    formMessage.textContent = `Could not create issue: ${error.message}`;
  } finally {
    // A token can be used only once, so get a fresh one for the next submit
    turnstile.reset(turnstileWidgetId);
  }
});

// Change status: PATCH /api/issues/{id}/status
async function changeIssueStatus(issue) {
  const nextStatus = issue.status === 'Open' ? 'Resolved' : 'Open';

  try {
    await apiRequest(`${API_BASE_URL}/${issue.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: nextStatus })
    });

    await loadIssues();
  } catch (error) {
    console.error(error);
    formMessage.textContent = `Could not update issue: ${error.message}`;
  }
}

loadIssues();
