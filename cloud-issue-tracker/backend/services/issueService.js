// Lab 5 Part 9: the data service now stores issues in Neon Postgres.
// The three exported functions keep the same names, arguments and return
// values as the Lab 3 JSON-file version, so routes and controller are unchanged.
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readIssues() {
  return sql`
    SELECT id, title, description, priority, status, created_at AS "createdAt"
    FROM issues
    ORDER BY created_at`;
}

async function createIssue({ title, description, priority }) {
  const rows = await sql`
    INSERT INTO issues (title, description, priority)
    VALUES (${title}, ${description}, ${priority})
    RETURNING id, title, description, priority, status, created_at AS "createdAt"`;
  return rows[0];
}

async function updateIssueStatus(id, status) {
  if (!UUID_PATTERN.test(id)) {
    return null;
  }
  const rows = await sql`
    UPDATE issues SET status = ${status}
    WHERE id = ${id}
    RETURNING id, title, description, priority, status, created_at AS "createdAt"`;
  return rows[0] || null;
}

module.exports = {
  readIssues,
  createIssue,
  updateIssueStatus
};
