import { connect } from "@tursodatabase/serverless";

type Client = ReturnType<typeof connect>;
type ResultSet = Awaited<ReturnType<Client["execute"]>>;
type InArgs = Parameters<Client["execute"]>[1];

export interface TypedResultSet<T> extends Omit<ResultSet, "rows"> {
  rows: T[];
}

// @tursodatabase/serverless returns rows as numeric-indexed objects {"0": val, "1": val, ...}.
// This wrapper maps each row to a named-property object using result.columns.
function mapRows<T = Record<string, unknown>>(result: ResultSet): TypedResultSet<T> {
  if (!Array.isArray(result?.columns) || result.columns.length === 0) {
    return result as unknown as TypedResultSet<T>;
  }
  return {
    ...result,
    rows: result.rows.map((row: unknown) => {
      const r = row as Record<string, unknown>;
      return Object.fromEntries(
        result.columns.map((col: string, i: number) => [col, r[i]])
      ) as T;
    }),
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
  execute: async <T = Record<string, unknown>>(sql: string, args?: InArgs): Promise<TypedResultSet<T>> => {
    const conn = getDb();
    const result = await (args !== undefined ? conn.execute(sql, args) : conn.execute(sql));
    return mapRows<T>(result);
  },
};
