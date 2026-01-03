// src/lib/upstashVector.ts
import "server-only";
/* eslint-disable no-console */

export type UpstashVector = {
  id: string | number;
  vector?: number[];
  values?: number[]; // 互換
  metadata?: Record<string, any>;
};

export type UpstashHit = {
  id?: string;
  score?: number;
  metadata?: Record<string, any>;
  vector?: number[];
  [key: string]: any;
};

export type UpstashQueryResponse = {
  result?: UpstashHit[];
  results?: UpstashHit[];
  [key: string]: any;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} が未設定です`);
  return v;
}

function getBaseUrl(): string {
  return requireEnv("UPSTASH_VECTOR_REST_URL").replace(/\/+$/, "");
}

function getToken(): string {
  return requireEnv("UPSTASH_VECTOR_REST_TOKEN");
}

function getNamespace(): string {
  return process.env.UPSTASH_VECTOR_NAMESPACE || "";
}

function buildUrl(path: string, namespace?: string): string {
  const base = getBaseUrl();
  const ns = (namespace ?? getNamespace()).trim();
  if (!ns) return `${base}${path}`;
  const u = new URL(`${base}${path}`);
  u.searchParams.set("namespace", ns);
  return u.toString();
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function toNumberVector(v: UpstashVector): number[] {
  const vec = (v.vector ?? v.values ?? []).map((n) => Number(n));
  // NaN 排除（必要なら）
  if (vec.some((x) => !Number.isFinite(x))) {
    throw new Error(`vector に数値でない要素があります id=${v.id}`);
  }
  return vec;
}

async function postJson<T>(
  url: string,
  bodyObj: unknown,
  init?: RequestInit
): Promise<{ status: number; text: string; json?: T; payloadChars: number }> {
  const token = getToken();
  const payload = JSON.stringify(bodyObj);

  // ★重要：init を最後に ... しない（headers/method が上書きされる事故を防ぐ）
  const res = await fetch(url, {
    // init で渡したいものはここで明示的に拾う（例：signal など）
    signal: init?.signal,

    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: payload,
  });

  const text = await res.text();

  let json: T | undefined;
  try {
    json = text ? (JSON.parse(text) as T) : undefined;
  } catch {
    // JSONでない応答もあり得るので握りつぶし
  }

  return { status: res.status, text, json, payloadChars: payload.length };
}

/**
 * Upstash Vector: upsert（many）
 * - 大量投入を想定し、batchで分割する版
 */
export async function upstashUpsertMany(
  vectors: UpstashVector[],
  opts?: { batchSize?: number; namespace?: string; debug?: boolean }
): Promise<any[]> {
  const url = buildUrl("/upsert", opts?.namespace);

  const bodyArray = vectors.map((v) => ({
    id: String(v.id),
    vector: toNumberVector(v),
    metadata: v.metadata ?? {},
  }));

  const batchSize = opts?.batchSize ?? 100; // まずは安全寄り
  const batches = chunk(bodyArray, batchSize);

  const results: any[] = [];

  for (let i = 0; i < batches.length; i++) {
    const b = batches[i];

    if (opts?.debug) {
      const preview = JSON.stringify(b);
      console.log(
        `[upstash] POST ${url} batch=${i + 1}/${batches.length} count=${b.length} payloadChars=${preview.length}`
      );
      console.log(`[upstash] payload head=${preview.slice(0, 250)}`);
      console.log(`[upstash] payload tail=${preview.slice(Math.max(0, preview.length - 250))}`);
    }

    const { status, text, json } = await postJson<any>(url, b);

    if (opts?.debug) {
      console.log(`[upstash] status=${status}`);
      console.log(`[upstash] response(head)=${text.slice(0, 800)}`);
    }

    if (status < 200 || status >= 300) {
      throw new Error(`Upstash upsert failed: status=${status} body=${text}`);
    }

    results.push(json ?? text);
  }

  return results;
}

/**
 * Upstash Vector: query
 */
export async function upstashQuery(
  vector: number[],
  topK: number,
  opts?: {
    namespace?: string;
    includeMetadata?: boolean;
    includeVectors?: boolean;
    // filter 等を使いたい場合はここに追加（Upstashの仕様に合わせて）
    filter?: string;
  }
): Promise<UpstashQueryResponse> {
  const url = buildUrl("/query", opts?.namespace);

  const payload: Record<string, any> = {
    vector,
    topK,
    includeMetadata: opts?.includeMetadata ?? true,
  };
  if (opts?.includeVectors) payload.includeVectors = true;
  if (opts?.filter) payload.filter = opts.filter;

  const { status, text, json } = await postJson<UpstashQueryResponse>(url, payload);

  if (status < 200 || status >= 300) {
    throw new Error(`Upstash query failed: status=${status} body=${text}`);
  }

  if (json) return json;
  // text が空のケースを避ける
  return text ? (JSON.parse(text) as UpstashQueryResponse) : {};
}

/**
 * result / results どちらでも受けられるようにする
 */
export function normalizeUpstashHits(resp: UpstashQueryResponse): UpstashHit[] {
  const arr = (resp?.result ?? resp?.results ?? []) as unknown;
  return Array.isArray(arr) ? (arr as UpstashHit[]) : [];
}
