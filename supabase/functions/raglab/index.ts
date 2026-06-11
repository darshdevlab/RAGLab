import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default;

if (!SERVICE_KEY) {
  throw new Error("Missing Supabase service key for RAGLab.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const PUBLIC_ORIGIN = "https://darshdevlab.github.io";
const VECTOR_DIMS = 64;

const corsHeaders = {
  "Access-Control-Allow-Origin": PUBLIC_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
};

const DEMOS = [
  {
    slug: "raglab-architecture",
    title: "RAGLab Architecture",
    source: "demo:raglab-architecture",
    description: "Portfolio architecture corpus for RAG method comparison.",
    dataset: {
      id: "0e3e885c-5d70-4814-bf27-ecd784287c18",
      slug: "raglab-architecture",
      title: "RAGLab Demo Dataset",
      source: "sample",
      documents: 1,
      chunks: 4,
      entities: 57,
      relations: 112,
      avg_chunk_tokens: 94,
    },
    questions: [
      "Which RAG method is safest for a mixed query about Vercel and Supabase deployment?",
      "How does Hybrid RAG combine keyword and vector retrieval?",
      "Which method is best for exact terms like pgvector and BM25?",
      "What connects Vercel, Supabase, pgvector, and GraphRAG?",
    ],
  },
  {
    slug: "clinical-trial",
    title: "CardioMap Trial Protocol",
    source: "demo:clinical-trial",
    description: "Clinical protocol with abbreviations, safety thresholds, and routing relationships.",
    dataset: {
      id: "b56cefe5-2759-40d8-8028-971da298bb3f",
      slug: "clinical-trial",
      title: "CardioMap Trial Protocol",
      source: "browser",
      documents: 1,
      chunks: 3,
      entities: 31,
      relations: 84,
      avg_chunk_tokens: 90,
    },
    questions: [
      "Which exact exclusions mention INV-908, dialysis, or eGFR?",
      "What should happen when a patient has chest pain and shortness of breath?",
      "Which team handles device-quality alerts from PulseBand PB-7?",
      "Explain the relationship between DCA-42, adherence nudges, and week 12 blood pressure.",
    ],
  },
  {
    slug: "incident-runbook",
    title: "Northwind Incident Runbook",
    source: "demo:incident-runbook",
    description: "Production incident runbook with exact SEV terms and service dependency graph.",
    dataset: {
      id: "e90cf5d7-24f4-410b-9c67-36ce8a7fe764",
      slug: "incident-runbook",
      title: "Northwind Incident Runbook",
      source: "browser",
      documents: 1,
      chunks: 3,
      entities: 42,
      relations: 84,
      avg_chunk_tokens: 86,
    },
    questions: [
      "What exact conditions declare SEV-1 for checkout?",
      "How are API Gateway, Cart Service, Redis cache, and Payment Service connected?",
      "When should Payment Service switch to rules-only mode?",
      "Which recovery action fits a routing or request-signing deployment issue?",
    ],
  },
  {
    slug: "support-kb",
    title: "AtlasDesk Support KB",
    source: "demo:support-kb",
    description: "Support policy corpus for refund, retention, plan, and memory-biased support policies.",
    dataset: {
      id: "415a6e7c-7de4-4a09-80bb-4264193e4b3e",
      slug: "support-kb",
      title: "AtlasDesk Support KB",
      source: "browser",
      documents: 1,
      chunks: 2,
      entities: 29,
      relations: 56,
      avg_chunk_tokens: 104,
    },
    questions: [
      "What are the exact requirements in refund policy RFD-14?",
      "Which plan has audit exports and a named customer success manager?",
      "How does a deletion request move through attachments, messages, and analytics?",
      "Based on my preference for strict retention, which plan should I inspect?",
    ],
  },
];

const DEMO_FILES: Record<string, { fileName: string; mime: string; text: string; title: string }> = {
  "raglab-architecture": {
    fileName: "raglab-architecture-notes.md",
    mime: "text/markdown",
    title: "RAGLab Architecture Notes",
    text: `# RAGLab Architecture Notes

RAGLab compares retrieval augmented generation strategies on the same dataset. The prototype is designed for a public portfolio visitor who wants to inspect data, understand retrieval tradeoffs, and see why one RAG method fits a query better than another.

Vector RAG uses pgvector similarity search to find chunks with similar meaning signals. In this demo, embeddings can be deterministic free vectors, then swapped later for an open-source embedding endpoint.

BM25 and keyword retrieval use lexical matching. BM25 is strong for exact terms such as pgvector, Supabase, GraphRAG, latency, citations, and named products. It is explainable and cheap, but it can miss paraphrases.

Hybrid RAG combines keyword scores with vector similarity. A good hybrid retriever normalizes both scores before ranking chunks. It should expose score components so a user can see why a chunk was selected.

Memory RAG adds session context such as preferences, accepted facts, rejected facts, or prior questions. It must include inspect and delete controls because uncontrolled memory can bias retrieval.

GraphRAG creates entities and relationships from the corpus. Entities can include Vercel, Supabase, pgvector, BM25, Hybrid RAG, Memory RAG, GraphRAG, and citations. Relationships connect methods to strengths, limits, storage choices, and deployment decisions.`,
  },
  "clinical-trial": {
    fileName: "cardiomap-gold-qa.json",
    mime: "application/json",
    title: "CardioMap Gold QA",
    text: `[
  {"id":"cm_qa_001","type":"factoid","question":"Which trial arm sends medication adherence nudges?","answer":"The digital coaching arm DCA-42 sends medication adherence nudges.","gold_terms":["DCA-42","digital coaching","adherence nudges"]},
  {"id":"cm_qa_002","type":"eligibility","question":"Which exclusions mention dialysis or INV-908?","answer":"Exclusion criteria include dialysis and current use of investigational drug INV-908.","gold_terms":["dialysis","INV-908","exclusion"]},
  {"id":"cm_qa_003","type":"routing","question":"Where should chest pain with shortness of breath be routed?","answer":"Chest pain with shortness of breath creates a red alert routed to Nurse Triage.","gold_terms":["chest pain","shortness of breath","red alert","Nurse Triage"]}
]`,
  },
  "incident-runbook": {
    fileName: "northwind-incident-runbook.txt",
    mime: "text/plain",
    title: "Northwind Incident Runbook",
    text: `Northwind Incident Response Runbook

SEV-1 is declared when checkout success rate falls below 94 percent for five minutes, payment authorization errors exceed 6 percent, or API Gateway returns more than 2 percent 5xx responses.

Dependency map: API Gateway calls Cart Service. Cart Service calls Inventory Service and Redis Session Cache. Payment Service calls Fraud Scoring. PostgreSQL Orders stores completed orders.

Recovery playbooks: rollback latest Gateway routing rule, scale Payment Service workers, disable nonessential recommendation calls, enable queue drain mode.`,
  },
  "support-kb": {
    fileName: "atlasdesk-support-tickets.jsonl",
    mime: "application/x-ndjson",
    title: "AtlasDesk Support Ticket Stream",
    text: `{"ticket_id":"TCK-1001","plan":"Enterprise","intent":"audit_export","priority":"urgent","message":"Account owner requests audit exports for Q4 compliance review.","resolution":"Verify account owner, generate audit export, notify named customer success manager."}
{"ticket_id":"TCK-1002","plan":"Starter","intent":"refund","priority":"normal","message":"Customer requests refund on day 10 after processing 120 tickets.","resolution":"Eligible under RFD-14 if no custom onboarding was delivered."}
{"ticket_id":"TCK-1003","plan":"Growth","intent":"retention","priority":"normal","message":"Workspace admin asks how long closed tickets remain available.","resolution":"Growth retains closed tickets for 30 months under DRP-30."}`,
  },
  "retail-orders-csv": {
    fileName: "retail-orders.csv",
    mime: "text/csv",
    title: "Retail Orders Table",
    text: `order_id,order_date,region,customer_segment,product_category,order_value,status,refund_requested,delivery_days
ORD-9001,2026-01-04,West,Enterprise,Analytics,1240.00,delivered,false,3
ORD-9002,2026-01-05,East,SMB,Support,210.50,delivered,true,5
ORD-9003,2026-01-08,Central,Midmarket,Security,780.00,processing,false,2`,
  },
  "rag-method-graph": {
    fileName: "rag-method-graph.ttl",
    mime: "text/turtle",
    title: "RAG Method Knowledge Graph",
    text: `@prefix rag: <https://example.com/raglab/> .

rag:HybridRAG rag:combines rag:BM25 .
rag:HybridRAG rag:combines rag:VectorRAG .
rag:BM25 rag:bestFor rag:ExactTermQuery .
rag:VectorRAG rag:uses rag:Pgvector .
rag:GraphRAG rag:uses rag:EntityRelationshipTraversal .
rag:RAGLab rag:compares rag:HybridRAG .`,
  },
};

const DEFAULT_DATASET_ID = DEMOS[0].dataset.id;
const ALLOWED_DATASET_IDS = new Set(DEMOS.map((demo) => demo.dataset.id));
const STOPWORDS = new Set([
  "about",
  "after",
  "again",
  "against",
  "also",
  "and",
  "are",
  "because",
  "been",
  "before",
  "both",
  "but",
  "can",
  "did",
  "does",
  "each",
  "for",
  "from",
  "had",
  "has",
  "have",
  "how",
  "into",
  "more",
  "most",
  "not",
  "only",
  "other",
  "our",
  "over",
  "same",
  "should",
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
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
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

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const path = normalizePath(url.pathname);

  try {
    if (req.method === "GET" && (path === "" || path === "/")) {
      return json({ ok: true, app: "RAGLab", mode: "read_only_demo" });
    }
    if (req.method === "GET" && path === "/api/health") {
      return json({ ok: true, mode: "read_only_demo", dataset: await datasetStats(DEFAULT_DATASET_ID) });
    }
    if (req.method === "GET" && path === "/api/demos") return json({ demos: DEMOS });
    if (req.method === "GET" && path === "/api/dataset/file") {
      const file = datasetFileBySlug(url.searchParams.get("slug"));
      return json(datasetFilePayload(file));
    }
    if (req.method === "GET" && path === "/api/dataset/download") {
      const file = datasetFileBySlug(url.searchParams.get("slug"));
      return textFile(file);
    }
    if (req.method === "GET" && path === "/api/dataset") {
      return json({ dataset: await datasetStats(DEFAULT_DATASET_ID) });
    }
    if (req.method === "GET" && path.startsWith("/api/memory/")) {
      return json({ memories: await listMemories("demo") });
    }
    if (req.method === "POST" && path === "/api/dataset/sample") {
      const body = await req.json().catch(() => ({}));
      const demo = DEMOS.find((item) => item.slug === String(body.slug || "")) || DEMOS[0];
      return json({ dataset: await datasetStats(demo.dataset.id) });
    }
    if (req.method === "POST" && path === "/api/dataset/text") {
      return json({ detail: "Custom indexing is disabled on the public demo. Run the local backend for upload experiments." }, 403);
    }
    if (req.method === "POST" && path === "/api/memory") {
      return json({ detail: "Memory writes are disabled on the public demo. Run the local backend for memory experiments." }, 403);
    }
    if (req.method === "POST" && path === "/api/query") {
      const body = await req.json().catch(() => ({}));
      return json(await compareQuestion(String(body.question || ""), body.dataset_id));
    }
    return json({ detail: "Not found" }, 404);
  } catch (error) {
    console.error(error);
    const status = error instanceof HttpError ? error.status : 500;
    return json({ detail: error instanceof Error ? error.message : String(error) }, status);
  }
});

function normalizePath(pathname: string) {
  const marker = "/raglab";
  const index = pathname.indexOf(marker);
  const path = index >= 0 ? pathname.slice(index + marker.length) : pathname;
  return path || "/";
}

function datasetFileBySlug(slug: string | null) {
  const requestedSlug = String(slug || DEMOS[0].slug);
  const resolvedSlug = DEMO_FILES[requestedSlug] ? requestedSlug : DEMOS[0].slug;
  const file = DEMO_FILES[resolvedSlug];
  if (!file) throw new HttpError(404, "Dataset file is unavailable.");
  return { slug: resolvedSlug, ...file };
}

function datasetFilePayload(file: { slug: string; title: string; fileName: string; mime: string; text: string }) {
  return {
    slug: file.slug,
    title: file.title,
    file_name: file.fileName,
    mime: file.mime,
    text: file.text,
  };
}

async function datasetStats(datasetId: string) {
  assertAllowedDataset(datasetId);
  const { data: dataset, error } = await supabase.from("raglab_datasets").select("*").eq("id", datasetId).single();
  if (error) throw error;
  const [chunks, entities, relations] = await Promise.all([
    countRows("raglab_chunks", datasetId),
    countRows("raglab_entities", datasetId),
    countRows("raglab_relations", datasetId),
  ]);
  const { data: tokenRows } = await supabase.from("raglab_chunks").select("token_count").eq("dataset_id", datasetId);
  const avg = tokenRows?.length ? Math.round(tokenRows.reduce((sum: number, row: any) => sum + row.token_count, 0) / tokenRows.length) : 0;
  const demo = DEMOS.find((item) => item.dataset.id === dataset.id);
  return {
    id: dataset.id,
    slug: demo?.slug || dataset.slug,
    title: dataset.title,
    source: dataset.source,
    documents: 1,
    chunks,
    entities,
    relations,
    avg_chunk_tokens: avg,
  };
}

async function countRows(table: string, datasetId: string) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("dataset_id", datasetId);
  if (error) throw error;
  return count || 0;
}

async function compareQuestion(question: string, requestedDatasetId: unknown) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) throw new HttpError(400, "Question is required.");
  if (cleanQuestion.length > 500) throw new HttpError(400, "Question must be 500 characters or fewer.");
  const datasetId = typeof requestedDatasetId === "string" && requestedDatasetId ? requestedDatasetId : DEFAULT_DATASET_ID;
  assertAllowedDataset(datasetId);

  const [stats, memories, bm25, vector, graph] = await Promise.all([
    datasetStats(datasetId),
    searchMemories(cleanQuestion),
    keywordSearch(datasetId, cleanQuestion),
    vectorSearch(datasetId, cleanQuestion),
    graphSearch(datasetId, cleanQuestion),
  ]);
  const hybrid = hybridSearch(bm25, vector);
  const memoryQuestion = memories.length ? `${cleanQuestion} ${memories.map((memory) => memory.text).join(" ")}` : cleanQuestion;
  const memory = memories.length ? await vectorSearch(datasetId, memoryQuestion) : vector;
  const queryType = classifyQuery(cleanQuestion);
  const results = [
    makeResult("bm25", "BM25 / Keyword RAG", bm25, cleanQuestion, queryType),
    makeResult("vector", "Vector RAG", vector, cleanQuestion, queryType),
    makeResult("hybrid", "Hybrid RAG", hybrid, cleanQuestion, queryType),
    makeResult("memory", "Memory RAG", memory, cleanQuestion, queryType, memories),
    makeResult("graph", "GraphRAG", graph, cleanQuestion, queryType),
  ].sort((a, b) => b.score - a.score);
  const recommended = results[0];

  return {
    question: cleanQuestion,
    session_id: "demo",
    query_type: queryType,
    dataset: stats,
    recommended_method: recommended.method,
    recommended_label: recommended.label,
    recommended_reason: recommendationReason(recommended.method),
    memory_used: memories,
    results,
  };
}

function assertAllowedDataset(datasetId: string) {
  if (!ALLOWED_DATASET_IDS.has(datasetId)) throw new HttpError(403, "Dataset is not available in the public demo.");
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

  const entityIds = new Set(matched.map((entity: any) => entity.id));
  const { data: relations, error } = await supabase
    .from("raglab_relations")
    .select("*, source:source_entity_id(name), target:target_entity_id(name), chunk:evidence_chunk_id(*)")
    .eq("dataset_id", datasetId)
    .limit(500);
  if (error) return withLatency(await fallbackTokenSearch(datasetId, question), performance.now() - start);

  const scored = new Map<string, ChunkHit>();
  for (const relation of relations || []) {
    if (!entityIds.has(relation.source_entity_id) && !entityIds.has(relation.target_entity_id)) continue;
    if (!relation.chunk) continue;
    const current = scored.get(relation.chunk.id);
    scored.set(relation.chunk.id, {
      chunk_id: relation.chunk.id,
      document_id: relation.chunk.document_id,
      dataset_id: relation.chunk.dataset_id,
      chunk_position: relation.chunk.position,
      content: relation.chunk.text,
      entity_names: relation.chunk.entities || [],
      score: (current?.score || 0) + Number(relation.weight || 1),
      reason: `entity relation: ${relation.source?.name || "entity"} -> ${relation.target?.name || "entity"}`,
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
    .filter((hit: ChunkHit) => hit.score > 0)
    .sort((a: ChunkHit, b: ChunkHit) => b.score - a.score)
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

function makeResult(method: string, label: string, hits: ChunkHit[], question: string, queryType: string, memories: any[] = []) {
  const latency = (hits as any).latencyMs || 0;
  let score = scoreMethod(method, hits, latency, queryType);
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
    diagnostics: { retrieved_chunks: hits.length, top_raw_score: hits[0]?.score || 0, storage: "Supabase raglab_ read-only demo" },
  };
}

function scoreMethod(method: string, hits: ChunkHit[], latencyMs: number, queryType: string) {
  if (!hits.length) return 0;
  const top = Math.max(0, hits[0].score || 0);
  const maxScore = Math.max(top, 1);
  const relevance = Math.min(1, top / maxScore);
  const support = Math.min(1, hits.length / 4);
  const fit = methodFit(method, queryType);
  const latencyPenalty = Math.min(0.14, latencyMs / 1600);
  return Number(Math.max(0, Math.min(100, (0.58 * relevance + 0.24 * support + 0.18 * fit - latencyPenalty) * 100)).toFixed(1));
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
  if (sessionId !== "demo") return [];
  const { data, error } = await supabase.from("raglab_memories").select("id,text,created_at").eq("session_id", "demo").order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data || [];
}

async function searchMemories(question: string) {
  const memories = await listMemories("demo");
  const query = hashEmbedding(question);
  return memories
    .map((memory: any) => ({ ...memory, score: cosine(query, hashEmbedding(memory.text)) }))
    .filter((memory: any) => memory.score > 0.05)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3);
}

function tokenize(text: string) {
  return [...text.toLowerCase().matchAll(/[a-z][a-z0-9_-]{1,}/g)]
    .map((match) => match[0])
    .filter((token) => !STOPWORDS.has(token) && token.length > 1);
}

function hashEmbedding(text: string) {
  const vector = Array(VECTOR_DIMS).fill(0);
  for (const token of tokenize(text)) {
    const hash = fnv1a(token);
    vector[hash % VECTOR_DIMS] += hash & 1 ? 1 : -1;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / norm).toFixed(6)));
}

function cosine(left: number[], right: number[]) {
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
  const sentences = hits.slice(0, 2).flatMap((hit) =>
    hit.content.split(/(?<=[.!?])\s+/).map((sentence) => ({
      sentence,
      overlap: tokenize(sentence).filter((token) => queryTerms.has(token)).length,
    }))
  );
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
    memory: ["Uses session preferences", "Improves multi-turn continuity", "Read-only demo memory"],
    graph: ["Uses entity relationships", "Good for connected facts", "Runs from raglab_entities and raglab_relations"],
  }[method] || [];
}

function limitations(method: string) {
  return {
    bm25: ["Can miss paraphrases", "Sensitive to wording"],
    vector: ["V1 uses hashed free embeddings", "Semantic model adapter is next"],
    hybrid: ["Needs score calibration", "More moving parts"],
    memory: ["Only helps when useful memory exists", "Public memory writes are disabled"],
    graph: ["Entity extraction is simple in V1", "Advanced graph DB can come later"],
  }[method] || [];
}

function recommendationReason(method: string) {
  return {
    hybrid: "Hybrid won because it balances keyword precision with vector recall on this query.",
    vector: "Vector RAG won because pgvector similarity produced the strongest evidence set.",
    bm25: "BM25 won because exact query terms matched the dataset strongly.",
    memory: "Memory RAG won because stored demo preferences changed the retrieval context.",
    graph: "GraphRAG won because entity relationships produced the strongest support.",
  }[method] || "The top method had the best combined score.";
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function textFile(file: { fileName: string; mime: string; text: string }) {
  return new Response(file.text, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": `${file.mime}; charset=utf-8`,
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
