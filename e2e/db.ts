import "dotenv/config";
import { Client } from "pg";

// Playwright's test runner transforms each file as CommonJS, and the
// generated Prisma client (src/generated/prisma) uses import.meta — real
// ESM-only syntax with no CommonJS equivalent — so @/lib/db can't be
// imported here the way every other test in this project imports it.
// Raw `pg` (already a project dependency, same driver Prisma's own
// adapter wraps) is a plain read-only escape hatch for this one file's
// after-the-fact verification queries; every state-changing step in the
// e2e spec still goes through the real UI and the real server actions.
async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function findLeadByName(name: string) {
  return withClient(async (client) => {
    const res = await client.query('SELECT * FROM leads WHERE name = $1 LIMIT 1', [name]);
    return res.rows[0] ?? null;
  });
}

export async function findQuoteByLeadId(leadId: string) {
  return withClient(async (client) => {
    const res = await client.query('SELECT * FROM quotes WHERE "leadId" = $1 LIMIT 1', [leadId]);
    return res.rows[0] ?? null;
  });
}

export async function findQuoteById(id: string) {
  return withClient(async (client) => {
    const res = await client.query("SELECT * FROM quotes WHERE id = $1 LIMIT 1", [id]);
    return res.rows[0] ?? null;
  });
}

export async function findLeadById(id: string) {
  return withClient(async (client) => {
    const res = await client.query("SELECT * FROM leads WHERE id = $1 LIMIT 1", [id]);
    return res.rows[0] ?? null;
  });
}

export async function deleteTestData(leadId?: string, quoteId?: string) {
  await withClient(async (client) => {
    if (quoteId) await client.query("DELETE FROM quotes WHERE id = $1", [quoteId]);
    if (leadId) await client.query("DELETE FROM leads WHERE id = $1", [leadId]);
  });
}
