import { createClient } from "npm:@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}")["default"];

if (!SERVICE_KEY) {
  throw new Error("Missing Supabase service/secret key for RAGLab function.");
}

const supabase = createClient(PROJECT_URL, SERVICE_KEY);
const BUCKET = "raglab_documents";
const VECTOR_DIMS = 64;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SAMPLE_TEXT = `# RAGLab Demo Dataset

RAGLab is a product prototype for comparing retrieval augmented generation strategies on the same dataset. The platform should help a user upload documents, ask natural language questions, inspect retrieved evidence, and see which RAG strategy works best for that dataset and query type.

Vector RAG uses hosted pgvector similarity search to find chunks with similar meaning signals. In this hosted prototype the embedding is a deterministic hashed token vector so the app works without a paid model API. Later it can be swapped for an open-source embedding endpoint. Vector RAG is useful for concept questions, but it can fail when the query requires an exact term, identifier, or quoted phrase.

BM25 and keyword RAG use Postgres full-text search. BM25 is strong when the user searches for exact terms such as pgvector, Supabase, GraphRAG, latency, citations, or a named product. BM25 is fast, explainable, and cheap. It can miss paraphrases when the document uses different wording from the question.

Hybrid RAG combines keyword scores with vector similarity scores. Hybrid RAG is often the safest default because it keeps exact-term precision while recovering semantic matches. A good hybrid system normalizes BM25 and vector scores before combining them. It should show score components so the user can understand why a chunk was selected.

Memory RAG adds session context. It stores user preferences, prior questions, accepted facts, and rejected facts. Memory RAG is useful when the user says things like remember that I prefer low cost deployment and later asks which architecture should be selected. Memory must include approve, delete, and inspect controls because uncontrolled memory can make retrieval biased or stale.

GraphRAG builds an entity and relationship layer over the document collection. Entities can include RAGLab, Supabase, pgvector, Vercel, BM25, Hybrid RAG, Memory RAG, GraphRAG, and citations. Relationships connect methods to strengths, limitations, storage choices, and deployment decisions. GraphRAG is useful for questions about how concepts connect, which methods depend on embeddings, or which architecture links Vercel with Supabase.

For the online version, Vercel can host the interactive frontend, but this live prototype is served from a Supabase Edge Function. Supabase stores documents, chunks, metadata, vector embeddings through pgvector, keyword search indexes, memory rows, entities, and relations. This means the first online version does not need separate Pinecone, Qdrant, Weaviate, or Neo4j deployments. Those adapters can be added later if the product becomes a database benchmark.

RAGLab should not pretend every RAG method is correct. The dashboard should show retrieved chunks, citations, latency, method strengths, method limitations, and a recommendation score. A recommendation is only trustworthy when evidence is visible. The strongest portfolio version is a full working end-to-end prototype: data ingestion, chunking, indexing, query execution, retrieval comparison, scoring, ranking, and interactive UI.`;

const STOPWORDS = new Set([
  "about",
  "after",
  "again",
  "against",
  "all",
  "also",
  "and",
  "any",
  "are",
  "because",
  "been",
  "before",
  "being",
  "both",
  "but",
  "can",
  "did",
  "does",
  "doing",
  "each",
  "few",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "into",
  "its",
  "just",
  "more",
  "most",
  "not",
  "now",
  "off",
  "once",
  "only",
  "other",
  "our",
  "out",
  "over",
  "same",
  "should",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "too",
  "under",
  "until",
  "very",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "why",
  "will",
  "with",
  "you",
  "your",
]);

type ChunkHit = {
  chunk_id: string;
  document_id?: string;
  dataset_id?: string;
  chunk_position: number;
  content: string;
  entity_names: string[];
  score: number;
  reason: string;
};

type MethodResult = {
  method: string;
  label: string;
  answer: string;
  score: number;
  latency_ms: number;
  strengths: string[];
  limitations: string[];
  evidence: Array<Record<string, unknown>>;
  diagnostics: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const path = normalizePath(url.pathname);

  try {
    if (req.method === "GET" && (path === "" || path === "/")) return htmlResponse();
    if (req.method === "GET" && path === "/api/health") return json({ ok: true, dataset: await ensureSampleStats() });
    if (req.method === "GET" && path === "/api/dataset") return json({ dataset: await ensureSampleStats() });
    if (req.method === "GET" && path.startsWith("/api/memory/")) {
      const sessionId = decodeURIComponent(path.split("/").pop() || "demo");
      return json({ memories: await listMemories(sessionId) });
    }
    if (req.method === "POST" && path === "/api/dataset/sample") return json({ dataset: await ensureSampleStats() });
    if (req.method === "POST" && path === "/api/dataset/text") {
      const body = await req.json();
      return json({ dataset: await indexDataset(body.title || "Browser Dataset", body.text || "", false) });
    }
    if (req.method === "POST" && path === "/api/memory") {
      const body = await req.json();
      const sessionId = String(body.session_id || "demo");
      await addMemory(sessionId, String(body.text || ""));
      return json({ memories: await listMemories(sessionId) });
    }
    if (req.method === "POST" && path === "/api/query") {
      const body = await req.json();
      return json(await compareQuestion(String(body.question || ""), String(body.session_id || "demo"), body.dataset_id));
    }
    return json({ detail: "Not found" }, 404);
  } catch (error) {
    console.error(error);
    return json({ detail: error instanceof Error ? error.message : String(error) }, 500);
  }
});

function normalizePath(pathname: string) {
  const marker = "/raglab";
  const index = pathname.indexOf(marker);
  const path = index >= 0 ? pathname.slice(index + marker.length) : pathname;
  return path || "/";
}

async function ensureSampleStats() {
  const existing = await getDatasetBySlug("sample-raglab-demo");
  if (existing) {
    const stats = await datasetStats(existing.id);
    if (stats.chunks > 0) return stats;
  }
  return await indexDataset("RAGLab Demo Dataset", SAMPLE_TEXT, true);
}

async function getDatasetBySlug(slug: string) {
  const { data, error } = await supabase.from("raglab_datasets").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

async function indexDataset(title: string, text: string, isSample: boolean) {
  const clean = text.trim();
  if (clean.length < 80) throw new Error("Dataset text is too short.");
  const hash = String(fnv1a(clean));
  const slug = isSample ? "sample-raglab-demo" : `browser-${Date.now()}-${hash}`;

  const existing = isSample ? await getDatasetBySlug(slug) : null;
  if (existing) {
    const stats = await datasetStats(existing.id);
    if (stats.chunks > 0) return stats;
  }

  const { data: dataset, error: datasetError } = await supabase
    .from("raglab_datasets")
    .insert({ slug, title, source: isSample ? "sample" : "browser", content_hash: hash, is_sample: isSample })
    .select("*")
    .single();
  if (datasetError) throw datasetError;

  const storagePath = `${dataset.id}/${safeFileName(title)}.txt`;
  await supabase.storage.from(BUCKET).upload(storagePath, new Blob([clean], { type: "text/plain" }), { upsert: true });

  const { data: document, error: documentError } = await supabase
    .from("raglab_documents")
    .insert({ dataset_id: dataset.id, title, source: isSample ? "sample" : "browser", storage_path: storagePath, content: clean })
    .select("*")
    .single();
  if (documentError) throw documentError;

  const chunks = chunkText(clean).map((chunk, position) => ({
    dataset_id: dataset.id,
    document_id: document.id,
    position,
    text: chunk,
    token_count: tokenize(chunk).length,
    tokens: tokenize(chunk),
    entities: extractEntities(chunk),
    embedding: hashEmbedding(chunk),
  }));
  const { data: insertedChunks, error: chunkError } = await supabase.from("raglab_chunks").insert(chunks).select("*");
  if (chunkError) throw chunkError;

  await buildGraph(dataset.id, insertedChunks || []);
  if (isSample) {
    await addMemory("demo", "Prefer RAG methods that show citations, low hallucination risk, and readable evidence.");
    await addMemory("demo", "For portfolio demos, favor methods that work online without expensive managed infrastructure.");
  }
  return await datasetStats(dataset.id);
}

async function buildGraph(datasetId: string, chunks: any[]) {
  const entityRows = new Map<string, { dataset_id: string; name: string; normalized_name: string; embedding: number[] }>();
  for (const chunk of chunks) {
    for (const entity of chunk.entities || []) {
      const normalized = normalizeEntity(entity);
      if (!entityRows.has(normalized)) {
        entityRows.set(normalized, { dataset_id: datasetId, name: entity, normalized_name: normalized, embedding: hashEmbedding(entity) });
      }
    }
  }
  if (!entityRows.size) return;
  const { data: entities, error } = await supabase
    .from("raglab_entities")
    .upsert([...entityRows.values()], { onConflict: "dataset_id,normalized_name" })
    .select("*");
  if (error) throw error;
  const entityByName = new Map((entities || []).map((entity: any) => [entity.normalized_name, entity]));

  const relationRows: any[] = [];
  for (const chunk of chunks) {
    const names = [...new Set((chunk.entities || []).map(normalizeEntity))].slice(0, 9);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const left = entityByName.get(names[i]);
        const right = entityByName.get(names[j]);
        if (left && right) {
          relationRows.push({
            dataset_id: datasetId,
            source_entity_id: left.id,
            target_entity_id: right.id,
            evidence_chunk_id: chunk.id,
            relation_type: "co_occurs",
            weight: 1,
          });
        }
      }
    }
  }
  if (relationRows.length) {
    const { error: relationError } = await supabase.from("raglab_relations").insert(relationRows);
    if (relationError) throw relationError;
  }
}

async function datasetStats(datasetId: string) {
  const { data: dataset, error } = await supabase.from("raglab_datasets").select("*").eq("id", datasetId).single();
  if (error) throw error;
  const [chunks, entities, relations] = await Promise.all([
    countTable("raglab_chunks", "dataset_id", datasetId),
    countTable("raglab_entities", "dataset_id", datasetId),
    countTable("raglab_relations", "dataset_id", datasetId),
  ]);
  const { data: tokenRows } = await supabase.from("raglab_chunks").select("token_count").eq("dataset_id", datasetId);
  const avg = tokenRows?.length ? Math.round(tokenRows.reduce((sum: number, row: any) => sum + row.token_count, 0) / tokenRows.length) : 0;
  return { id: dataset.id, title: dataset.title, source: dataset.source, documents: 1, chunks, entities, relations, avg_chunk_tokens: avg };
}

async function countTable(table: string, column: string, value: string) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true }).eq(column, value);
  if (error) throw error;
  return count || 0;
}

async function compareQuestion(question: string, sessionId: string, requestedDatasetId?: string) {
  if (!question.trim()) throw new Error("Question is required.");
  const stats = requestedDatasetId ? await datasetStats(requestedDatasetId) : await ensureSampleStats();
  const datasetId = stats.id;
  const memoryHits = await searchMemories(sessionId, question);

  const [bm25, vector, graph] = await Promise.all([
    keywordSearch(datasetId, question),
    vectorSearch(datasetId, question),
    graphSearch(datasetId, question),
  ]);
  const hybrid = hybridSearch(bm25, vector);
  const memory = memoryHits.length ? await vectorSearch(datasetId, `${question} ${memoryHits.map((m) => m.text).join(" ")}`) : vector;

  const queryType = classifyQuery(question);
  const results = [
    makeResult("bm25", "BM25 / Keyword RAG", bm25, question, queryType),
    makeResult("vector", "Vector RAG", vector, question, queryType),
    makeResult("hybrid", "Hybrid RAG", hybrid, question, queryType),
    makeResult("memory", "Memory RAG", memory, question, queryType, memoryHits),
    makeResult("graph", "GraphRAG", graph, question, queryType),
  ].sort((a, b) => b.score - a.score);

  const recommended = results[0];
  const { data: run } = await supabase
    .from("raglab_runs")
    .insert({
      session_id: sessionId,
      dataset_id: datasetId,
      question,
      query_type: queryType,
      recommended_method: recommended.method,
      recommended_label: recommended.label,
      recommended_score: recommended.score,
    })
    .select("*")
    .single();
  if (run) await persistResults(run.id, results);

  return {
    question,
    session_id: sessionId,
    query_type: queryType,
    dataset: stats,
    recommended_method: recommended.method,
    recommended_label: recommended.label,
    recommended_reason: recommendationReason(recommended.method),
    memory_used: memoryHits,
    results,
  };
}

async function persistResults(runId: string, results: MethodResult[]) {
  for (const result of results) {
    const { data: resultRow } = await supabase
      .from("raglab_run_results")
      .insert({
        run_id: runId,
        method: result.method,
        label: result.label,
        score: result.score,
        latency_ms: result.latency_ms,
        answer: result.answer,
        diagnostics: result.diagnostics,
      })
      .select("*")
      .single();
    if (!resultRow) continue;
    const evidenceRows = result.evidence.map((item: any, index) => ({
      run_result_id: resultRow.id,
      chunk_id: item.chunk_id,
      rank: index + 1,
      score: item.score,
      reason: item.reason,
      snippet: item.text,
    }));
    if (evidenceRows.length) await supabase.from("raglab_run_evidence").insert(evidenceRows);
  }
}

async function keywordSearch(datasetId: string, question: string): Promise<ChunkHit[]> {
  const start = performance.now();
  const { data, error } = await supabase.rpc("raglab_match_keyword", {
    p_dataset_id: datasetId,
    p_query: question,
    p_match_count: 5,
  });
  let hits = error ? [] : (data || []).map((row: any) => ({
    chunk_id: row.chunk_id,
    document_id: row.document_id,
    dataset_id: row.dataset_id,
    chunk_position: row.chunk_position,
    content: row.content,
    entity_names: row.entity_names || [],
    score: Number(row.keyword_rank || 0),
    reason: "Postgres full-text keyword match",
  }));
  if (!hits.length) hits = await fallbackTokenSearch(datasetId, question);
  return withLatency(hits, performance.now() - start);
}

async function vectorSearch(datasetId: string, question: string): Promise<ChunkHit[]> {
  const start = performance.now();
  const { data, error } = await supabase.rpc("raglab_match_vector", {
    p_dataset_id: datasetId,
    p_query_embedding: hashEmbedding(question),
    p_match_count: 5,
  });
  let hits = error ? [] : (data || []).map((row: any) => ({
    chunk_id: row.chunk_id,
    document_id: row.document_id,
    dataset_id: row.dataset_id,
    chunk_position: row.chunk_position,
    content: row.content,
    entity_names: row.entity_names || [],
    score: Number(row.similarity || 0),
    reason: "pgvector cosine similarity",
  }));
  if (!hits.length) hits = await fallbackTokenSearch(datasetId, question);
  return withLatency(hits, performance.now() - start);
}

async function graphSearch(datasetId: string, question: string): Promise<ChunkHit[]> {
  const start = performance.now();
  const terms = new Set(tokenize(question).map(normalizeEntity));
  const { data: entities } = await supabase.from("raglab_entities").select("*").eq("dataset_id", datasetId);
  const matched = (entities || []).filter((entity: any) => terms.has(entity.normalized_name) || question.toLowerCase().includes(entity.normalized_name));
  if (!matched.length) return withLatency(await fallbackTokenSearch(datasetId, question), performance.now() - start);
  const ids = matched.map((entity: any) => entity.id);
  const idSet = new Set(ids);
  const { data: relations, error } = await supabase
    .from("raglab_relations")
    .select("*, source:source_entity_id(name), target:target_entity_id(name), chunk:evidence_chunk_id(*)")
    .eq("dataset_id", datasetId)
    .limit(500);
  if (error) return withLatency(await fallbackTokenSearch(datasetId, question), performance.now() - start);
  const scored = new Map<string, ChunkHit>();
  for (const relation of (relations || []).filter((item: any) => idSet.has(item.source_entity_id) || idSet.has(item.target_entity_id))) {
    if (!relation.chunk) continue;
    const current = scored.get(relation.chunk.id);
    const score = (current?.score || 0) + Number(relation.weight || 1);
    scored.set(relation.chunk.id, {
      chunk_id: relation.chunk.id,
      document_id: relation.chunk.document_id,
      dataset_id: relation.chunk.dataset_id,
      chunk_position: relation.chunk.position,
      content: relation.chunk.text,
      entity_names: relation.chunk.entities || [],
      score,
      reason: `entity relation: ${relation.source?.name || "entity"} → ${relation.target?.name || "entity"}`,
    });
  }
  return withLatency([...scored.values()].sort((a, b) => b.score - a.score).slice(0, 5), performance.now() - start);
}

async function fallbackTokenSearch(datasetId: string, question: string): Promise<ChunkHit[]> {
  const queryTerms = new Set(tokenize(question));
  const { data } = await supabase.from("raglab_chunks").select("*").eq("dataset_id", datasetId);
  return (data || [])
    .map((chunk: any) => {
      const score = (chunk.tokens || []).filter((token: string) => queryTerms.has(token)).length;
      return {
        chunk_id: chunk.id,
        document_id: chunk.document_id,
        dataset_id: chunk.dataset_id,
        chunk_position: chunk.position,
        content: chunk.text,
        entity_names: chunk.entities || [],
        score,
        reason: "token overlap fallback",
      };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function hybridSearch(bm25: ChunkHit[], vector: ChunkHit[]) {
  const normalizedBm25 = normalizeHitScores(bm25);
  const normalizedVector = normalizeHitScores(vector);
  const byId = new Map<string, ChunkHit>();
  for (const hit of [...bm25, ...vector]) byId.set(hit.chunk_id, hit);
  return [...byId.values()]
    .map((hit) => ({
      ...hit,
      score: 0.52 * (normalizedBm25.get(hit.chunk_id) || 0) + 0.48 * (normalizedVector.get(hit.chunk_id) || 0),
      reason: `hybrid score: keyword ${(normalizedBm25.get(hit.chunk_id) || 0).toFixed(2)} + vector ${(normalizedVector.get(hit.chunk_id) || 0).toFixed(2)}`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function makeResult(method: string, label: string, hits: ChunkHit[], question: string, queryType: string, memories: any[] = []): MethodResult {
  const latency = (hits as any).latencyMs || 0;
  let score = scoreMethod(method, question, hits, latency, queryType);
  if (method === "memory" && memories.length) score = Math.min(100, score + 6);
  const evidence = hits.slice(0, 4).map((hit) => ({
    chunk_id: hit.chunk_id,
    source: "Supabase",
    title: "RAGLab dataset",
    position: hit.chunk_position,
    text: compact(hit.content, 520),
    score: Number(hit.score.toFixed(4)),
    reason: hit.reason,
    entities: hit.entity_names?.slice(0, 8) || [],
  }));
  return {
    method,
    label,
    answer: answerFromHits(question, hits, method === "memory" && memories.length ? `Session memory used: ${compact(memories[0].text, 120)} ` : ""),
    score,
    latency_ms: Number(latency.toFixed(2)),
    strengths: strengths(method),
    limitations: limitations(method),
    evidence,
    diagnostics: { retrieved_chunks: hits.length, top_raw_score: hits[0]?.score || 0, storage: "Supabase raglab_ tables" },
  };
}

function scoreMethod(method: string, question: string, hits: ChunkHit[], latencyMs: number, queryType: string) {
  if (!hits.length) return 0;
  const top = Math.max(0, hits[0].score || 0);
  const maxScore = Math.max(top, 1);
  const relevance = Math.min(1, top / maxScore);
  const support = Math.min(1, hits.length / 4);
  const fit = methodFit(method, queryType);
  const latencyPenalty = Math.min(0.14, latencyMs / 1600);
  return Number(Math.max(0, Math.min(100, ((0.58 * relevance) + (0.24 * support) + (0.18 * fit) - latencyPenalty) * 100)).toFixed(1));
}

function methodFit(method: string, type: string) {
  const fits: Record<string, Record<string, number>> = {
    exact: { bm25: 1, hybrid: 0.9, vector: 0.55, memory: 0.45, graph: 0.5 },
    semantic: { vector: 1, hybrid: 0.9, graph: 0.65, memory: 0.6, bm25: 0.45 },
    relationship: { graph: 1, hybrid: 0.8, vector: 0.65, bm25: 0.5, memory: 0.55 },
    memory: { memory: 1, hybrid: 0.7, vector: 0.6, graph: 0.5, bm25: 0.45 },
    mixed: { hybrid: 1, vector: 0.75, bm25: 0.72, graph: 0.65, memory: 0.6 },
  };
  return fits[type]?.[method] || 0.5;
}

function classifyQuery(question: string) {
  const q = question.toLowerCase();
  if (["remember", "previous", "prefer", "session", "my requirement"].some((term) => q.includes(term))) return "memory";
  if (["connect", "relationship", "related", "between", "links", "depends", "influence"].some((term) => q.includes(term))) return "relationship";
  if (["exact", "term", "keyword", "named", "id", "quote"].some((term) => q.includes(term))) return "exact";
  if (["why", "how", "explain", "meaning", "similar", "concept"].some((term) => q.includes(term))) return "semantic";
  return "mixed";
}

async function listMemories(sessionId: string) {
  const { data, error } = await supabase.from("raglab_memories").select("*").eq("session_id", sessionId).order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data || [];
}

async function addMemory(sessionId: string, text: string) {
  const clean = text.trim();
  if (clean.length < 5) throw new Error("Memory text is too short.");
  const existing = await listMemories(sessionId);
  if (existing.some((memory) => memory.text === clean)) return;
  const { error } = await supabase.from("raglab_memories").insert({ session_id: sessionId, text: clean, embedding: hashEmbedding(clean) });
  if (error) throw error;
}

async function searchMemories(sessionId: string, question: string) {
  const memories = await listMemories(sessionId);
  const query = hashEmbedding(question);
  return memories
    .map((memory) => ({ ...memory, score: cosine(query, parseVector(memory.embedding) || hashEmbedding(memory.text)) }))
    .filter((memory) => memory.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function chunkText(text: string) {
  const sentences = text.replace(/\r\n/g, "\n").split(/(?<=[.!?])\s+|\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current: string[] = [];
  let count = 0;
  for (const sentence of sentences) {
    const length = tokenize(sentence).length;
    if (current.length && count + length > 120) {
      chunks.push(current.join(" "));
      current = current.slice(-1);
      count = tokenize(current.join(" ")).length;
    }
    current.push(sentence);
    count += length;
  }
  if (current.length) chunks.push(current.join(" "));
  return chunks;
}

function tokenize(text: string) {
  return [...text.toLowerCase().matchAll(/[a-z][a-z0-9_-]{1,}/g)]
    .map((match) => match[0])
    .filter((token) => !STOPWORDS.has(token) && token.length > 1);
}

function extractEntities(text: string) {
  const matches = [...text.matchAll(/\b(?:[A-Z][a-zA-Z0-9]*(?:[- ][A-Z]?[a-zA-Z0-9]+){0,3}|[A-Z]{2,}(?:[- ][A-Z0-9]+)*)\b/g)].map((match) => match[0].replaceAll("-", " ").trim());
  const entities = [...new Set(matches.filter((entity) => entity.length > 2 && !["The", "This", "And", "For"].includes(entity)))];
  if (entities.length >= 6) return entities;
  for (const token of tokenize(text)) {
    if (token.length > 4 && !entities.includes(token)) entities.push(token);
    if (entities.length >= 8) break;
  }
  return entities;
}

function hashEmbedding(text: string) {
  const vector = Array(VECTOR_DIMS).fill(0);
  for (const token of tokenize(text)) {
    const hash = fnv1a(token);
    const idx = hash % VECTOR_DIMS;
    vector[idx] += (hash & 1) ? 1 : -1;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / norm).toFixed(6)));
}

function cosine(left: number[], right: number[]) {
  if (!Array.isArray(right)) return 0;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let i = 0; i < Math.min(left.length, right.length); i++) {
    dot += left[i] * right[i];
    leftNorm += left[i] * left[i];
    rightNorm += right[i] * right[i];
  }
  return dot / ((Math.sqrt(leftNorm) * Math.sqrt(rightNorm)) || 1);
}

function parseVector(value: unknown) {
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value !== "string") return null;
  const values = value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
  return values.length ? values : null;
}

function fnv1a(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeEntity(entity: string) {
  return entity.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function safeFileName(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "dataset";
}

function withLatency<T extends ChunkHit[]>(hits: T, latencyMs: number): T {
  (hits as any).latencyMs = latencyMs;
  return hits;
}

function normalizeHitScores(hits: ChunkHit[]) {
  const max = Math.max(...hits.map((hit) => hit.score), 0) || 1;
  return new Map(hits.map((hit) => [hit.chunk_id, hit.score / max]));
}

function answerFromHits(question: string, hits: ChunkHit[], prefix = "") {
  if (!hits.length) return `${prefix}No strong evidence was retrieved. Try a more specific question.`.trim();
  const queryTerms = new Set(tokenize(question));
  const sentences = hits.slice(0, 2).flatMap((hit) => hit.content.split(/(?<=[.!?])\s+/).map((sentence) => ({ sentence, overlap: tokenize(sentence).filter((token) => queryTerms.has(token)).length })));
  sentences.sort((a, b) => b.overlap - a.overlap);
  return `${prefix}${sentences.slice(0, 2).map((item) => item.sentence).join(" ") || compact(hits[0].content, 240)}`.trim();
}

function compact(text: string, limit: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1).trim()}...`;
}

function strengths(method: string) {
  return {
    bm25: ["Strong for exact terms", "Fast and explainable", "Uses Postgres full-text search"],
    vector: ["Uses hosted pgvector", "Finds token-similarity matches", "Ready to swap to open-source embeddings"],
    hybrid: ["Balances exact and vector retrieval", "Robust default for mixed queries", "Shows score components"],
    memory: ["Uses session preferences", "Improves multi-turn continuity", "Stores memory in Supabase"],
    graph: ["Uses entity relationships", "Good for connected facts", "Runs from raglab_entities and raglab_relations"],
  }[method] || [];
}

function limitations(method: string) {
  return {
    bm25: ["Can miss paraphrases", "Sensitive to wording"],
    vector: ["V1 uses hashed free embeddings", "Semantic model adapter is next"],
    hybrid: ["Needs score calibration", "More moving parts"],
    memory: ["Only helps when useful memory exists", "Needs delete/approve controls next"],
    graph: ["Entity extraction is simple in V1", "Advanced graph DB can come later"],
  }[method] || [];
}

function recommendationReason(method: string) {
  return {
    hybrid: "Hybrid won because it balances keyword precision with vector recall on this query.",
    vector: "Vector RAG won because pgvector similarity produced the strongest evidence set.",
    bm25: "BM25 won because exact query terms matched the dataset strongly.",
    memory: "Memory RAG won because stored session preferences changed the retrieval context.",
    graph: "GraphRAG won because entity relationships produced the strongest support.",
  }[method] || "The top method had the best combined score.";
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function htmlResponse() {
  return new Response(HTML, { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } });
}

const HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>RAGLab Live</title><style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#18221f;background:#eef1ec}*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#fff,#eef1ec)}button,textarea{font:inherit}button{cursor:pointer}.app{width:min(1440px,calc(100vw - 32px));margin:0 auto;padding:20px 0 28px}.top{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #ccd5ce;min-height:76px}.top h1{margin:4px 0 0;font-size:clamp(28px,3vw,44px);letter-spacing:0;line-height:1}.eyebrow,.status,.querytype{color:#38534d;font-size:13px;font-weight:800;text-transform:uppercase}.status{border:1px solid #c8d4cf;border-radius:999px;background:#fbfcfa;padding:9px 14px;text-transform:none}.grid{display:grid;grid-template-columns:minmax(280px,350px) 1fr;gap:18px;padding-top:18px;align-items:start}.side,.stage{display:grid;gap:14px;min-width:0}.panel,.query,.rec,.methods,.detail,.empty{border:1px solid #cbd4ce;border-radius:8px;background:rgba(255,255,255,.9);box-shadow:0 12px 28px rgba(43,56,50,.06)}.panel{padding:14px}.head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.head h2{margin:0;font-size:16px}.icon{width:34px;height:34px;border:1px solid #c8d4cf;border-radius:7px;background:#fff}.stats{display:grid;grid-template-columns:1fr 1fr;gap:8px}.stat{min-height:66px;border:1px solid #d7ded9;border-radius:7px;background:#f8faf7;padding:10px}.stat strong{display:block;font-size:22px;line-height:1}.stat span,.meta span,.memories p,.method small,.evidence span{color:#61706a;font-size:12px}.meta{display:grid;gap:3px;margin:12px 0}.secondary,.run{min-height:40px;border:1px solid #bfcac4;border-radius:7px;background:#fff;color:#17342f;font-weight:800}.secondary{width:100%;margin-top:8px}.run{width:120px;border-color:#14695e;background:#14695e;color:#fff}.hidden{display:none}.data,.memory,.question textarea{width:100%;border:1px solid #c8d4cf;border-radius:7px;background:#fff;color:#18221f;resize:vertical}.data{min-height:118px;margin-top:10px;padding:10px}.memory{min-height:74px;padding:10px}.count{display:inline-grid;min-width:26px;height:26px;place-items:center;border-radius:999px;background:#f0bd56;color:#2c210c;font-size:12px;font-weight:900}.memories{display:grid;gap:7px;margin-top:10px}.memories p{margin:0;border-left:3px solid #8b4bb3;padding-left:9px;line-height:1.35}.query{padding:14px}.question{display:grid;grid-template-columns:1fr 120px;gap:12px;align-items:center}.question textarea{min-height:62px;padding:12px}.bank{display:flex;gap:8px;overflow-x:auto;min-width:0;padding-top:10px}.bank button{flex:0 0 auto;max-width:330px;border:1px solid #d0d8d3;border-radius:999px;background:#f8faf7;color:#273630;padding:8px 11px;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rec{display:flex;align-items:center;justify-content:space-between;gap:18px;border-color:#a8c9c2;background:#f4fbf8;padding:18px}.rec span{color:#14695e;font-size:12px;font-weight:900;text-transform:uppercase}.rec h2,.detail h2,.empty h2{margin:4px 0;font-size:24px}.rec p{max-width:780px;margin:0;color:#46564f}.layout{display:grid;grid-template-columns:minmax(260px,360px) 1fr;gap:14px;align-items:start}.methods{display:grid;gap:8px;padding:10px}.method{display:grid;grid-template-columns:42px 1fr 72px;align-items:center;gap:10px;min-height:68px;border:1px solid transparent;border-radius:7px;background:#f9fbf8;padding:9px;color:#17251f;text-align:left}.method.active{border-color:#14695e;background:#eef8f5}.mark{display:grid;width:38px;height:38px;place-items:center;border-radius:7px;color:#fff;font-size:20px;font-weight:900}.bm25{background:#5b6f32}.vector{background:#14695e}.hybrid{background:#9a5d17}.memory{background:#7b3ea1}.graph{background:#9f2f48}.score{display:grid;gap:5px;text-align:right}.score span{font-size:13px;font-weight:900}.score i{display:block;height:7px;justify-self:end;border-radius:999px;background:#14695e}.detail{min-height:560px;padding:16px}.detailhead{display:flex;align-items:center;justify-content:space-between;gap:12px}.answer{margin:14px 0;border-left:4px solid #f0bd56;padding:4px 0 4px 12px;color:#2b372f;line-height:1.55}.tags{display:grid;grid-template-columns:1fr 1fr;gap:10px}.tag{display:flex;min-height:100px;flex-wrap:wrap;align-content:flex-start;gap:7px;border:1px solid #d3dad5;border-radius:7px;padding:10px;background:#fbfcfa}.tag strong{flex:0 0 100%;font-size:13px}.tag span,.entities span{border-radius:999px;padding:5px 8px;font-size:12px}.good span{background:#e6f5f1;color:#165a51}.warn span{background:#fff4df;color:#734407}.evidences{display:grid;gap:10px;margin-top:14px}.evidence{border:1px solid #d3dad5;border-radius:7px;background:#fff;padding:12px}.evidence div:first-child{display:flex;align-items:center;justify-content:space-between;gap:10px}.evidence p{margin:9px 0;color:#2e3b34;line-height:1.48}.entities{display:flex;flex-wrap:wrap;gap:6px}.entities span{background:#edf0eb;color:#4a5952}.empty{display:grid;min-height:420px;place-items:center;align-content:center;color:#38534d}.hide{display:none}@media(max-width:1060px){.grid,.layout{grid-template-columns:1fr}.side{grid-template-columns:1fr 1fr}}@media(max-width:760px){.app{width:min(100vw - 20px,1440px);padding-top:12px}.top,.rec{align-items:flex-start;flex-direction:column}.side,.tags{grid-template-columns:1fr}.question{grid-template-columns:1fr}.run{width:100%}.method{grid-template-columns:38px 1fr 62px}}
</style></head><body><main class="app"><header class="top"><div><div class="eyebrow">RAGLab Live</div><h1>RAG strategy selector</h1></div><div class="status" id="status">Supabase engine ready</div></header><section class="grid"><aside class="side"><section class="panel"><div class="head"><h2>Dataset</h2><button class="icon" id="load">↻</button></div><div class="stats"><div class="stat"><strong id="chunks">0</strong><span>Chunks</span></div><div class="stat"><strong id="entities">0</strong><span>Entities</span></div><div class="stat"><strong id="relations">0</strong><span>Relations</span></div><div class="stat"><strong id="tokens">0</strong><span>Avg tokens</span></div></div><div class="meta"><strong id="title">No dataset</strong><span id="source">Waiting</span></div><input class="hidden" id="file" type="file" accept=".txt,.md,.csv"/><button class="secondary" id="upload">Upload file</button><textarea class="data" id="text" placeholder="Paste TXT, Markdown, or CSV content"></textarea><button class="secondary" id="index">Index pasted text</button></section><section class="panel"><div class="head"><h2>Memory</h2><span class="count" id="memoryCount">0</span></div><textarea class="memory" id="memoryText">Prefer the cheapest fully online architecture that still shows real retrieval evidence.</textarea><button class="secondary" id="addMemory">Add memory</button><div class="memories" id="memories"></div></section></aside><section class="stage"><section class="query"><div class="question"><textarea id="question">Which RAG method is safest for a mixed query about Vercel and Supabase deployment?</textarea><button class="run" id="run">Run</button></div><div class="bank" id="bank"></div></section><section class="rec hide" id="rec"><div><span>Recommended</span><h2 id="recommended">-</h2><p id="reason"></p></div><div class="querytype" id="queryType">mixed</div></section><section class="layout hide" id="layout"><div class="methods" id="methods"></div><article class="detail" id="detail"></article></section><section class="empty" id="empty"><h2>Ready to compare hosted RAG strategies</h2></section></section></section></main><script>
const SESSION='demo';const qs=['Which RAG method is safest for a mixed query about Vercel and Supabase deployment?','How does Hybrid RAG combine keyword and vector retrieval?','Which method is best for exact terms like pgvector and BM25?','What connects Vercel, Supabase, pgvector, and GraphRAG?','Based on my preferences, which architecture should be selected?'];let state={response:null,selected:''};const $=id=>document.getElementById(id);const api=async(p,o={})=>{const r=await fetch(location.pathname.replace(/\\/$/,'')+p,o);const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.detail||'Request failed');return j};const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll(\"'\",'&#039;');function status(s){$('status').textContent=s}function busy(v){document.querySelectorAll('button').forEach(b=>b.disabled=v)}function renderDataset(d){$('chunks').textContent=d.chunks;$('entities').textContent=d.entities;$('relations').textContent=d.relations;$('tokens').textContent=d.avg_chunk_tokens;$('title').textContent=d.title;$('source').textContent=d.source}function renderMemory(m){$('memoryCount').textContent=m.length;$('memories').innerHTML=m.slice(0,3).map(x=>'<p>'+esc(x.text)+'</p>').join('')}function icon(m){return{bm25:'⌕',vector:'✦',hybrid:'▦',memory:'◎',graph:'◇'}[m]||'•'}function renderResults(r){state.response=r;state.selected=r.results[0]?.method||'';$('empty').classList.add('hide');$('rec').classList.remove('hide');$('layout').classList.remove('hide');$('recommended').textContent=r.recommended_label;$('reason').textContent=r.recommended_reason;$('queryType').textContent=r.query_type;renderMethods();renderDetail()}function renderMethods(){const r=state.response;if(!r)return;$('methods').innerHTML=r.results.map(x=>'<button class=\"method '+(x.method===state.selected?'active':'')+'\" data-m=\"'+x.method+'\"><span class=\"mark '+x.method+'\">'+icon(x.method)+'</span><span><strong>'+esc(x.label)+'</strong><small>'+x.latency_ms.toFixed(2)+' ms</small></span><span class=\"score\"><span>'+x.score.toFixed(1)+'</span><i style=\"width:'+Math.max(2,Math.min(100,x.score))+'%\"></i></span></button>').join('');$('methods').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.selected=b.dataset.m;renderMethods();renderDetail()})}function renderDetail(){const r=state.response;if(!r)return;const x=r.results.find(y=>y.method===state.selected)||r.results[0];$('detail').innerHTML='<div class=\"detailhead\"><div><span>'+esc(x.label)+'</span><h2>'+x.score.toFixed(1)+' score</h2></div><div class=\"mark '+x.method+'\">'+icon(x.method)+'</div></div><p class=\"answer\">'+esc(x.answer)+'</p><div class=\"tags\">'+tag('Strengths',x.strengths,'good')+tag('Limits',x.limitations,'warn')+'</div><div class=\"evidences\">'+(x.evidence.map(evidence).join('')||'<p>No evidence retrieved.</p>')+'</div>'}function tag(t,a,c){return'<div class=\"tag '+c+'\"><strong>'+t+'</strong>'+a.map(i=>'<span>'+esc(i)+'</span>').join('')+'</div>'}function evidence(e){return'<article class=\"evidence\"><div><strong>Chunk '+(e.position+1)+'</strong><span>'+esc(e.reason)+'</span></div><p>'+esc(e.text)+'</p><div class=\"entities\">'+(e.entities||[]).slice(0,6).map(x=>'<span>'+esc(x)+'</span>').join('')+'</div></article>'}async function refresh(){const d=await api('/api/dataset');renderDataset(d.dataset);const m=await api('/api/memory/'+SESSION);renderMemory(m.memories)}async function run(){busy(true);status('Running hosted retrieval');try{const d=await api('/api/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:$('question').value,session_id:SESSION})});renderDataset(d.dataset);renderResults(d);status('Comparison ready')}catch(e){status(e.message)}finally{busy(false)}}async function indexText(t,title='Browser Dataset'){busy(true);status('Indexing in Supabase');try{const d=await api('/api/dataset/text',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,text:t})});renderDataset(d.dataset);status('Dataset indexed')}catch(e){status(e.message)}finally{busy(false)}}async function addMem(){busy(true);try{const m=await api('/api/memory',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:SESSION,text:$('memoryText').value})});renderMemory(m.memories);status('Memory saved')}catch(e){status(e.message)}finally{busy(false)}}document.addEventListener('DOMContentLoaded',async()=>{$('bank').innerHTML=qs.map(q=>'<button>'+esc(q)+'</button>').join('');$('bank').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('question').value=b.textContent;run()});$('run').onclick=run;$('load').onclick=async()=>{await api('/api/dataset/sample',{method:'POST'});await refresh()};$('upload').onclick=()=>$('file').click();$('file').onchange=async e=>{const f=e.target.files[0];if(f)await indexText(await f.text(),f.name)};$('index').onclick=()=>indexText($('text').value);$('addMemory').onclick=addMem;await refresh()});
</script></body></html>`;
