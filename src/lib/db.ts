import { connect } from "@tursodatabase/serverless";

// @tursodatabase/serverless returns rows as numeric-indexed objects {"0": val, "1": val, ...}.
// This wrapper maps each row to a named-property object using result.columns.
function mapRows(result: any) {
  if (!Array.isArray(result?.columns) || result.columns.length === 0) return result;
  return {
    ...result,
    rows: result.rows.map((row: any) =>
      Object.fromEntries(result.columns.map((col: string, i: number) => [col, row[i]]))
    ),
  };
}

// @tursodatabase/serverless sessions are single-use HTTP sessions — create a fresh
// connection per execute() call. This is the correct pattern for HTTP-based serverless drivers.
function getDb() {
  return connect({
    url: import.meta.env.TURSO_DATABASE_URL,
    authToken: import.meta.env.TURSO_AUTH_TOKEN,
  });
}

export const db = {
  execute: async (sql: string, args?: any[]) => {
    const conn = getDb();
    return mapRows(await (args !== undefined ? conn.execute(sql, args) : conn.execute(sql)));
  },
};
