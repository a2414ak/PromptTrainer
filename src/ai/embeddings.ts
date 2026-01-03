import "server-only";
import { ai } from "@/ai/genkit";

export const EMBEDDING_DIM = 1536;

export async function embedText1536(text: string): Promise<number[]> {
  const res = await ai.embed({
    embedder: "openai/text-embedding-3-small",
    content: text,
  });

  // ai.embed() は配列で返る型になっているので先頭を使う
  const first = res?.[0];
  const v = first?.embedding;

  if (!Array.isArray(v) || v.length !== EMBEDDING_DIM) {
    throw new Error(
      `Embedding dimension mismatch: got=${Array.isArray(v) ? v.length : "N/A"}, expected=${EMBEDDING_DIM}`
    );
  }

  return v;
}
