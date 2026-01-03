"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ApiResp = any;

export function UpstashTestPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // ⚠️ 注意：vector は本番では「埋め込みの次元」と一致させる必要があります。
  // まずは疎通用に短いダミーで。Upstash側が次元固定ならエラーになります。
  const dummyVector = [0.01, 0.02, 0.03];

  async function callQuery() {
    setLoading(true);
    setResult("");
    try {
      const r = await fetch("/api/upstash/test/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vector: dummyVector, topK: 5 }),
      });
      const data: ApiResp = await r.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setResult(`ERROR: ${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  async function callUpsert() {
    setLoading(true);
    setResult("");
    try {
      const vectors = [
        {
          id: "demo-1",
          vector: dummyVector,
          metadata: { title: "demo doc", category: "test" },
        },
      ];

      const r = await fetch("/api/upstash/test/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vectors }),
      });
      const data: ApiResp = await r.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setResult(`ERROR: ${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="font-bold">Upstash Vector テスト</div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={callUpsert} disabled={loading}>
          Upsert を叩く
        </Button>
        <Button onClick={callQuery} disabled={loading} variant="outline">
          Query を叩く
        </Button>
      </div>

      <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto whitespace-pre-wrap">
        {loading ? "loading..." : result || "（結果がここに表示されます）"}
      </pre>
    </div>
  );
}
