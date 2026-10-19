import { createClient } from "@tursodatabase/serverless/compat";

type Client = ReturnType<typeof createClient>;
type ResultSet = Awaited<ReturnType<Client["execute"]>>;
type InArgs = unknown[];

export interface TypedResultSet<T> extends Omit<ResultSet, "rows"> {
  rows: T[];
}

// @tursodatabase/serverless returns rows as numeric-indexed objects {"0": val, "1": val, ...}.
// This wrapper maps each row to a named-property object using result.columns.
function mapRows<T = Record<string, unknown>>(
  result: ResultSet,
): TypedResultSet<T> {
  if (!Array.isArray(result?.columns) || result.columns.length === 0) {
    return result as unknown as TypedResultSet<T>;
  }
  return {
    ...result,
    rows: result.rows.map((row: unknown) => {
      const r = row as Record<string, unknown>;
      return Object.fromEntries(
        result.columns.map((col: string, i: number) => [col, r[i]]),
      ) as T;
    }),
  };
}

// The 1.4 driver removed Connection.execute(); the /compat entry keeps the
// libsql-style execute() API. Keep creating a fresh client per call.
function getDb() {
  return createClient({
    url: import.meta.env.TURSO_DATABASE_URL,
    authToken: import.meta.env.TURSO_AUTH_TOKEN,
  });
}

export const db = {
  execute: async <T = Record<string, unknown>>(
    sql: string,
    args?: InArgs,
  ): Promise<TypedResultSet<T>> => {
    const conn = getDb();
    const result = await (args !== undefined
      ? conn.execute(sql, args as Parameters<Client["execute"]>[1])
      : conn.execute(sql));
    return mapRows<T>(result);
  },
};
