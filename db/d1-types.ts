export interface D1QueryResult<T> {
  results: T[];
  meta: { changes: number };
}

export interface D1PreparedQuery {
  bind(...values: Array<string | number | null>): D1PreparedQuery;
  run<T = Record<string, unknown>>(): Promise<D1QueryResult<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1QueryResult<T>>;
}

export interface D1DatabaseClient {
  prepare(query: string): D1PreparedQuery;
}
