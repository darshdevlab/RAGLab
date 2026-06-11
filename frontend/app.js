const HOSTED_API_BASE = "https://peluzzqoihjvkdtedsiz.supabase.co/functions/v1/raglab";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const API_BASE = LOCAL_HOSTS.has(window.location.hostname) ? "" : HOSTED_API_BASE;

const datasetFiles = {
  "raglab-architecture": {
    fileName: "raglab-architecture-notes.md",
    mime: "text/markdown",
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
    text: `[
  {
    "id": "cm_qa_001",
    "type": "factoid",
    "question": "Which trial arm sends medication adherence nudges?",
    "answer": "The digital coaching arm DCA-42 sends medication adherence nudges.",
    "gold_terms": ["DCA-42", "digital coaching", "adherence nudges"]
  },
  {
    "id": "cm_qa_002",
    "type": "eligibility",
    "question": "Which exclusions mention dialysis or INV-908?",
    "answer": "Exclusion criteria include dialysis and current use of investigational drug INV-908.",
    "gold_terms": ["dialysis", "INV-908", "exclusion"]
  },
  {
    "id": "cm_qa_003",
    "type": "routing",
    "question": "Where should chest pain with shortness of breath be routed?",
    "answer": "Chest pain with shortness of breath creates a red alert routed to Nurse Triage.",
    "gold_terms": ["chest pain", "shortness of breath", "red alert", "Nurse Triage"]
  },
  {
    "id": "cm_qa_004",
    "type": "abbreviation",
    "question": "What does eGFR mean in the protocol glossary?",
    "answer": "eGFR means estimated glomerular filtration rate.",
    "gold_terms": ["eGFR", "estimated glomerular filtration rate"]
  },
  {
    "id": "cm_qa_005",
    "type": "endpoint",
    "question": "What is the primary endpoint at week 12?",
    "answer": "The primary endpoint is change in systolic blood pressure at week 12.",
    "gold_terms": ["primary endpoint", "systolic blood pressure", "week 12"]
  },
  {
    "id": "cm_qa_006",
    "type": "device",
    "question": "Which team handles PulseBand PB-7 device-quality alerts?",
    "answer": "Device-quality alerts from PulseBand PB-7 route to Biomedical Operations.",
    "gold_terms": ["PulseBand PB-7", "device-quality alerts", "Biomedical Operations"]
  }
]`,
  },
  "incident-runbook": {
    fileName: "northwind-incident-runbook.txt",
    mime: "text/plain",
    text: `Northwind Incident Response Runbook

Northwind Cloud runs a checkout platform with API Gateway, Cart Service, Payment Service, Inventory Service, Fraud Scoring, PostgreSQL Orders, and Redis Session Cache.

SEV-1 is declared when checkout success rate falls below 94 percent for five minutes, payment authorization errors exceed 6 percent, or API Gateway returns more than 2 percent 5xx responses.

SEV-2 is declared when p95 latency exceeds 900 ms for ten minutes or one region has elevated queue depth. The escalation channel is #incident-checkout. The incident commander owns customer status updates every fifteen minutes.

Dependency map: API Gateway calls Cart Service. Cart Service calls Inventory Service and Redis Session Cache. Payment Service calls Fraud Scoring. PostgreSQL Orders stores completed orders.

Fallbacks: If Redis Session Cache is unavailable, Cart Service can serve stale carts for ten minutes. If Fraud Scoring is unavailable, Payment Service switches to rules-only mode after Risk Operations approval.

Recovery playbooks: rollback latest Gateway routing rule, scale Payment Service workers, disable nonessential recommendation calls, enable queue drain mode. Rollback is preferred when the latest deployment changed routing, headers, or request signing.`,
  },
  "support-kb": {
    fileName: "atlasdesk-support-tickets.jsonl",
    mime: "application/x-ndjson",
    text: `{"ticket_id":"TCK-1001","plan":"Enterprise","intent":"audit_export","priority":"urgent","message":"Account owner requests audit exports for Q4 compliance review.","resolution":"Verify account owner, generate audit export, notify named customer success manager."}
{"ticket_id":"TCK-1002","plan":"Starter","intent":"refund","priority":"normal","message":"Customer requests refund on day 10 after processing 120 tickets.","resolution":"Eligible under RFD-14 if no custom onboarding was delivered."}
{"ticket_id":"TCK-1003","plan":"Growth","intent":"retention","priority":"normal","message":"Workspace admin asks how long closed tickets remain available.","resolution":"Growth retains closed tickets for 30 months under DRP-30."}
{"ticket_id":"TCK-1004","plan":"Enterprise","intent":"urgent_response","priority":"urgent","message":"Annual contract customer reports missed one hour urgent response target.","resolution":"Review ENT-A9 service credit path and incident timeline."}
{"ticket_id":"TCK-1005","plan":"Starter","intent":"deletion","priority":"normal","message":"User asks to delete attachments, ticket messages, and analytics records.","resolution":"Deletion removes attachments first, then messages, then analytics aggregates in the nightly privacy job."}
{"ticket_id":"TCK-1006","plan":"Growth","intent":"upgrade","priority":"low","message":"Customer wants audit exports without moving all agents to Enterprise.","resolution":"Audit exports are Enterprise only; explain compliance feature boundary."}`,
  },
  "retail-orders-csv": {
    fileName: "retail-orders.csv",
    mime: "text/csv",
    text: `order_id,order_date,region,customer_segment,product_category,order_value,status,refund_requested,delivery_days
ORD-9001,2026-01-04,West,Enterprise,Analytics,1240.00,delivered,false,3
ORD-9002,2026-01-05,East,SMB,Support,210.50,delivered,true,5
ORD-9003,2026-01-08,Central,Midmarket,Security,780.00,processing,false,2
ORD-9004,2026-01-10,West,SMB,Analytics,189.00,delivered,false,4
ORD-9005,2026-01-12,South,Enterprise,Security,1540.25,delayed,false,8
ORD-9006,2026-01-14,East,Midmarket,Data Platform,960.75,delivered,false,3
ORD-9007,2026-01-16,Central,SMB,Support,145.00,cancelled,true,0
ORD-9008,2026-01-19,South,Midmarket,Analytics,640.20,delivered,false,6
ORD-9009,2026-01-22,West,Enterprise,Data Platform,2210.00,processing,false,1
ORD-9010,2026-01-24,East,Enterprise,Security,1765.40,delivered,false,2`,
  },
  "rag-method-graph": {
    fileName: "rag-method-graph.ttl",
    mime: "text/turtle",
    text: `@prefix rag: <https://example.com/raglab/> .

rag:HybridRAG rag:combines rag:BM25 .
rag:HybridRAG rag:combines rag:VectorRAG .
rag:HybridRAG rag:bestFor rag:MixedQuery .
rag:BM25 rag:bestFor rag:ExactTermQuery .
rag:BM25 rag:uses rag:PostgresFullTextSearch .
rag:VectorRAG rag:uses rag:Pgvector .
rag:VectorRAG rag:bestFor rag:SemanticQuery .
rag:MemoryRAG rag:uses rag:SessionPreference .
rag:MemoryRAG rag:risk rag:StaleContext .
rag:GraphRAG rag:uses rag:EntityRelationshipTraversal .
rag:GraphRAG rag:bestFor rag:DependencyQuestion .
rag:Supabase rag:stores rag:Documents .
rag:Supabase rag:stores rag:Chunks .
rag:Supabase rag:stores rag:Embeddings .
rag:Vercel rag:hosts rag:Frontend .
rag:RAGLab rag:compares rag:HybridRAG .
rag:RAGLab rag:compares rag:BM25 .
rag:RAGLab rag:compares rag:VectorRAG .
rag:RAGLab rag:compares rag:MemoryRAG .
rag:RAGLab rag:compares rag:GraphRAG .`,
  },
};

const localDemos = [
  {
    slug: "raglab-architecture",
    title: "RAGLab Architecture Notes",
    source: "demo:unstructured-markdown",
    description: "Narrative architecture notes for unstructured document retrieval.",
    profile: {
      kind: "Unstructured document",
      focus: "Markdown notes with paragraphs, named systems, and retrieval tradeoffs.",
      primaryMetric: "Sections",
      bestFor: ["Hybrid RAG", "GraphRAG", "BM25"],
      ingestion: "Chunk by heading and paragraph, then index with lexical, vector, hybrid, and graph methods.",
    },
    dataset: { records: 7, fields: 1, chunks: 6, entities: 34, relations: 58, avg_chunk_tokens: 66 },
  },
  {
    slug: "clinical-trial",
    title: "CardioMap Gold QA",
    source: "demo:qa-json",
    description: "Question-answer benchmark fixtures with expected terms.",
    profile: {
      kind: "Question-answer JSON",
      focus: "Gold QA pairs for testing answer retrieval and term coverage.",
      primaryMetric: "QA pairs",
      bestFor: ["BM25", "Hybrid RAG", "Field-aware RAG"],
      ingestion: "Treat each QA object as a supervised evaluation item with question, answer, type, and gold terms.",
    },
    dataset: { records: 6, fields: 5, chunks: 6, entities: 22, relations: 31, avg_chunk_tokens: 34 },
  },
  {
    slug: "incident-runbook",
    title: "Northwind Incident Runbook",
    source: "demo:plain-text-runbook",
    description: "Plain text operational runbook with thresholds and recovery steps.",
    profile: {
      kind: "Plain text runbook",
      focus: "Operational instructions, exact SEV thresholds, dependencies, and fallback actions.",
      primaryMetric: "Sections",
      bestFor: ["BM25", "Hybrid RAG", "GraphRAG"],
      ingestion: "Split by blank lines and preserve exact incident codes for keyword and hybrid retrieval.",
    },
    dataset: { records: 7, fields: 1, chunks: 5, entities: 29, relations: 45, avg_chunk_tokens: 57 },
  },
  {
    slug: "support-kb",
    title: "AtlasDesk Support Ticket Stream",
    source: "demo:jsonl-tickets",
    description: "Semi-structured support records in JSON Lines format.",
    profile: {
      kind: "Semi-structured JSONL",
      focus: "One support ticket per line with plan, intent, priority, message, and resolution fields.",
      primaryMetric: "Tickets",
      bestFor: ["Field-aware RAG", "Hybrid RAG", "BM25"],
      ingestion: "Parse each JSONL line as a document row while keeping structured fields for filters.",
    },
    dataset: { records: 6, fields: 6, chunks: 6, entities: 24, relations: 38, avg_chunk_tokens: 30 },
  },
  {
    slug: "retail-orders-csv",
    title: "Retail Orders Table",
    source: "demo:tabular-csv",
    description: "Structured order data for table-aware retrieval and filtering.",
    profile: {
      kind: "Structured CSV",
      focus: "Rows and columns with dates, regions, customer segments, order values, statuses, and delivery metrics.",
      primaryMetric: "Rows",
      bestFor: ["Field-aware RAG", "BM25", "Hybrid RAG"],
      ingestion: "Parse as tabular data, profile columns, and create row-level text for retrieval.",
    },
    dataset: { records: 10, fields: 9, chunks: 10, entities: 18, relations: 20, avg_chunk_tokens: 19 },
  },
  {
    slug: "rag-method-graph",
    title: "RAG Method Knowledge Graph",
    source: "demo:turtle-graph",
    description: "RDF-style triples for relationship and GraphRAG experiments.",
    profile: {
      kind: "Knowledge graph triples",
      focus: "Subject-predicate-object statements connecting RAG methods, query types, tools, and deployment pieces.",
      primaryMetric: "Triples",
      bestFor: ["GraphRAG", "Hybrid RAG", "Vector RAG"],
      ingestion: "Parse triples into entities and relations, then use graph traversal for relationship questions.",
    },
    dataset: { records: 20, fields: 3, chunks: 8, entities: 16, relations: 20, avg_chunk_tokens: 11 },
  },
];

const benchmarkQueries = {
  "raglab-architecture": [
    { type: "mixed", text: "Which RAG method is safest for mixed exact and semantic architecture questions?", terms: ["hybrid", "keyword", "vector", "score"] },
    { type: "exact", text: "Where do pgvector, Supabase, and Vercel fit in the architecture?", terms: ["pgvector", "supabase", "vercel"] },
    { type: "relationship", text: "How are GraphRAG entities connected to deployment decisions?", terms: ["graphrag", "entities", "relationships", "deployment"] },
    { type: "semantic", text: "Why can vector retrieval miss identifiers or quoted phrases?", terms: ["vector", "exact", "identifier", "phrase"] },
    { type: "memory", text: "What risk does uncontrolled memory add to retrieval?", terms: ["memory", "bias", "inspect", "delete"] },
  ],
  "clinical-trial": [
    { type: "exact", text: "Which exclusions mention dialysis or INV-908?", terms: ["dialysis", "inv-908", "exclusion"] },
    { type: "routing", text: "Where should chest pain with shortness of breath route?", terms: ["chest", "shortness", "red", "triage"] },
    { type: "abbreviation", text: "What does eGFR mean?", terms: ["egfr", "estimated", "glomerular"] },
    { type: "endpoint", text: "What is measured at week 12?", terms: ["endpoint", "systolic", "week"] },
    { type: "device", text: "Which team handles PulseBand PB-7 alerts?", terms: ["pulseband", "device", "biomedical"] },
  ],
  "incident-runbook": [
    { type: "exact", text: "What exact conditions declare SEV-1?", terms: ["sev-1", "94", "6", "5xx"] },
    { type: "relationship", text: "How are API Gateway, Cart Service, Redis, and Payment Service connected?", terms: ["api", "gateway", "cart", "redis", "payment"] },
    { type: "fallback", text: "When should Payment Service switch to rules-only mode?", terms: ["payment", "rules-only", "fraud", "risk"] },
    { type: "recovery", text: "Which recovery action fits routing or request signing changes?", terms: ["rollback", "routing", "signing"] },
    { type: "latency", text: "What condition declares SEV-2 for p95 latency?", terms: ["sev-2", "p95", "900"] },
  ],
  "support-kb": [
    { type: "filter", text: "Which Enterprise ticket requests audit exports?", terms: ["enterprise", "audit", "export"] },
    { type: "policy", text: "Which refund ticket is eligible under RFD-14?", terms: ["refund", "rfd-14", "eligible"] },
    { type: "retention", text: "Which plan keeps closed tickets for 30 months?", terms: ["growth", "retains", "30"] },
    { type: "workflow", text: "How does a deletion request process attachments and messages?", terms: ["deletion", "attachments", "messages", "analytics"] },
    { type: "upgrade", text: "Which ticket says audit exports require Enterprise?", terms: ["audit", "exports", "enterprise"] },
  ],
  "retail-orders-csv": [
    { type: "filter", text: "Which Enterprise orders are related to Security?", terms: ["enterprise", "security"] },
    { type: "status", text: "Which orders requested refunds?", terms: ["refund", "true"] },
    { type: "region", text: "Which West region orders have Analytics or Data Platform?", terms: ["west", "analytics", "data"] },
    { type: "delivery", text: "Which delayed order had the longest delivery time?", terms: ["delayed", "8"] },
    { type: "value", text: "Which order has value above 2000?", terms: ["2210", "ord-9009"] },
  ],
  "rag-method-graph": [
    { type: "relationship", text: "What does HybridRAG combine?", terms: ["hybridrag", "combines", "bm25", "vectorrag"] },
    { type: "graph", text: "Which method is best for DependencyQuestion?", terms: ["graphrag", "dependencyquestion"] },
    { type: "storage", text: "What does Supabase store?", terms: ["supabase", "documents", "chunks", "embeddings"] },
    { type: "deployment", text: "What does Vercel host?", terms: ["vercel", "frontend"] },
    { type: "comparison", text: "Which methods does RAGLab compare?", terms: ["raglab", "compares", "hybridrag", "bm25"] },
  ],
};

const methodProfiles = [
  { id: "bm25", label: "BM25", strength: "Exact terms", latency: 26 },
  { id: "vector", label: "Vector RAG", strength: "Semantic match", latency: 48 },
  { id: "hybrid", label: "Hybrid RAG", strength: "Balanced recall", latency: 62 },
  { id: "graph", label: "GraphRAG", strength: "Relationships", latency: 84 },
  { id: "field", label: "Field-aware RAG", strength: "Structured filters", latency: 34 },
];

const stopwords = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "because",
  "been",
  "but",
  "can",
  "does",
  "for",
  "from",
  "has",
  "have",
  "how",
  "into",
  "must",
  "not",
  "only",
  "or",
  "over",
  "should",
  "such",
  "than",
  "that",
  "the",
  "their",
  "then",
  "this",
  "through",
  "to",
  "uses",
  "what",
  "when",
  "where",
  "which",
  "with",
]);

const state = {
  activeFile: null,
  activeSlug: "",
  chunks: [],
  customPrompt: "",
  demos: [],
  selectedQuery: null,
};

const $ = (id) => document.getElementById(id);
const localBySlug = new Map(localDemos.map((demo) => [demo.slug, demo]));

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("hashchange", renderRoute);

async function init() {
  await refreshDatasets();
  await renderRoute();
}

async function refreshDatasets() {
  setStatus("Choose a dataset");
  try {
    const payload = await api("/api/demos");
    state.demos = mergeDemos(payload.demos || []);
  } catch {
    state.demos = localDemos;
  }
  setStatus(`${state.demos.length} datasets ready`);
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Request failed: ${response.status}`);
  }
  return payload;
}

function mergeDemos(remoteDemos) {
  const remoteBySlug = new Map(remoteDemos.map((demo) => [demo.slug, demo]));
  const orderedLocal = localDemos.map((local) => mergeDemo(remoteBySlug.get(local.slug) || local));
  const remoteOnly = remoteDemos.filter((demo) => !localBySlug.has(demo.slug)).map(mergeDemo);
  return [...orderedLocal, ...remoteOnly];
}

function mergeDemo(remote) {
  const local = localBySlug.get(remote.slug) || {};
  return {
    ...remote,
    ...local,
    profile: { ...(remote.profile || {}), ...(local.profile || {}) },
    dataset: { ...(remote.dataset || {}), ...(local.dataset || {}) },
  };
}

function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "").trim();
  const parts = raw.split("/").filter(Boolean);
  if (!parts.length) return { slug: "" };
  if (parts.length === 1 && getDemo(parts[0])) return { slug: parts[0] };
  return { slug: parts[1] || "" };
}

async function renderRoute() {
  const { slug } = parseRoute();
  try {
    if (slug) await ensureDataset(slug);
    renderChatWorkspace();
  } catch (error) {
    renderChatWorkspace(error.message || "Dataset could not be loaded.");
  }
}

async function ensureDataset(slug) {
  const demo = getDemo(slug);
  if (!demo) throw new Error("Dataset not found.");
  if (state.activeSlug === slug && state.activeFile) return;

  setStatus("Loading dataset");
  state.activeSlug = slug;
  state.selectedQuery = null;
  state.customPrompt = "";
  state.activeFile = await fetchDatasetFile(slug);
  state.chunks = createChunks(slug, state.activeFile);
  setStatus("Dataset loaded");
}

function renderChatWorkspace(errorMessage = "") {
  const demo = getDemo(state.activeSlug);
  const file = demo ? state.activeFile : null;
  const analysis = file ? analyzeText(file.text) : null;
  const queries = demo ? benchmarkQueries[demo.slug] || [] : [];
  const results = demo && state.selectedQuery ? runBenchmark(state.selectedQuery) : [];

  setPageTitle("RAG Chat Benchmark");
  setStatus(demo ? `${state.chunks.length} chunks ready` : `${state.demos.length} datasets ready`);

  $("pageView").innerHTML = `
    <section class="chat-workspace">
      <aside class="chat-sidebar">
        <div class="sidebar-section dataset-section">
          <div class="section-title">
            <h2>Datasets</h2>
            <span class="section-kicker">${state.demos.length} ready</span>
          </div>
          <div class="dataset-menu">
            ${state.demos.map((item) => datasetMenuItem(item)).join("")}
          </div>
        </div>

        <div class="sidebar-section eda-section">
          ${
            demo && file && analysis
              ? renderSidebarEda(demo, file, analysis)
              : renderSidebarPlaceholder(errorMessage)
          }
        </div>
      </aside>

      <main class="chat-main">
        <section class="chat-thread" id="chatThread">
          ${renderChatIntro(demo, file, analysis, errorMessage)}
          ${demo && !state.selectedQuery ? renderEmptyChatSpace() : ""}
          ${demo && state.selectedQuery ? renderBenchmarkConversation(state.selectedQuery, results) : ""}
        </section>
        <div class="chat-input-stack">
          ${demo ? renderQueryOptions(queries) : ""}
          ${renderPromptComposer(demo)}
        </div>
      </main>
    </section>
  `;

  bindChatEvents(demo);
}

function datasetMenuItem(demo) {
  const file = datasetFiles[demo.slug];
  const active = demo.slug === state.activeSlug ? " is-active" : "";
  return `
    <button type="button" class="dataset-menu-item${active}" data-slug="${escapeHtml(demo.slug)}">
      <span>${escapeHtml(demo.profile?.kind || "Demo dataset")}</span>
      <strong>${escapeHtml(demo.title)}</strong>
      <small>${file ? escapeHtml(extensionLabel(file.fileName)) : "file"}</small>
    </button>
  `;
}

function renderSidebarPlaceholder(errorMessage) {
  return `
    <div class="eda-empty">
      <span class="section-kicker">EDA</span>
      <h2>${errorMessage ? escapeHtml(errorMessage) : "Select a dataset"}</h2>
      <p>Dataset profile, sample rows, top terms, chunks, and download controls will appear here.</p>
    </div>
  `;
}

function renderSidebarEda(demo, file, analysis) {
  const dataset = demo.dataset || {};
  const sampleChunks = state.chunks.slice(0, 2);
  return `
    <div class="eda-card">
      <div class="eda-title">
        <div>
          <span class="section-kicker">EDA</span>
          <h2>${escapeHtml(demo.title)}</h2>
        </div>
        <span class="format-badge">${escapeHtml(extensionLabel(file.fileName))}</span>
      </div>
      <p>${escapeHtml(demo.profile?.focus || demo.description || "Prepared dataset.")}</p>

      <div class="sidebar-stats">
        ${miniStat(dataset.records || dataset.documents || analysis.paragraphs, demo.profile?.primaryMetric || "Records")}
        ${miniStat(dataset.fields || analysis.headings.length || 1, "Fields")}
        ${miniStat(state.chunks.length || dataset.chunks || analysis.paragraphs, "Chunks")}
        ${miniStat(analysis.words, "Words")}
      </div>

      <div class="eda-block">
        <div class="section-title">
          <h3>Best Fit</h3>
        </div>
        <div class="fit-list">
          ${(demo.profile?.bestFor || ["Hybrid RAG", "BM25", "Vector RAG"])
            .map((item, index) => `<span><b>${index + 1}</b>${escapeHtml(item)}</span>`)
            .join("")}
        </div>
      </div>

      <div class="eda-block">
        <div class="section-title">
          <h3>Top Terms</h3>
        </div>
        <div class="term-list">${renderTerms(analysis.topTerms)}</div>
      </div>

      <div class="eda-block">
        <div class="section-title">
          <h3>Sample</h3>
        </div>
        <div class="sidebar-samples">
          ${sampleChunks.map((chunk) => sampleCard(chunk)).join("")}
        </div>
      </div>

      <div class="eda-actions">
        <button type="button" class="download-button" id="downloadDataset">Download dataset</button>
      </div>
    </div>
  `;
}

function renderEmptyChatSpace() {
  return `<div class="chat-empty-space" aria-hidden="true"></div>`;
}

function renderChatIntro(demo, file, analysis, errorMessage) {
  if (errorMessage) {
    return `
      <article class="chat-message assistant-message">
        <span class="avatar">RL</span>
        <div class="message-bubble">
          <h3>Dataset load failed</h3>
          <p>${escapeHtml(errorMessage)}</p>
        </div>
      </article>
    `;
  }

  if (!demo || !file || !analysis) {
    return `
      <article class="chat-message assistant-message">
        <span class="avatar">RL</span>
        <div class="message-bubble">
          <h3>Select a dataset from the left</h3>
          <p>The chat will load the selected dataset, show EDA in the sidebar, and let you benchmark prepared or custom retrieval questions.</p>
          <div class="welcome-stats">
            ${miniStat(state.demos.length, "Dataset types")}
            ${miniStat(methodProfiles.length, "RAG methods")}
            ${miniStat(totalPreparedQueries(), "Example queries")}
          </div>
        </div>
      </article>
    `;
  }

  return "";
}

function renderQueryOptions(queries) {
  if (!queries.length) return "";
  return `
    <section class="query-option-panel">
      <div class="section-title">
        <h3>Suggested queries</h3>
        <span class="section-kicker">click to fill prompt</span>
      </div>
      <div class="query-grid">
        ${queries
          .map((query, index) => {
            const active = state.customPrompt === query.text ? " is-active" : "";
            return `
              <button type="button" class="query-card${active}" data-query-index="${index}">
                <span>${escapeHtml(query.type)}</span>
                <strong>${escapeHtml(query.text)}</strong>
              </button>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderBenchmarkConversation(query, results) {
  const telemetry = retrievalTelemetry(query, results);
  return `
    <article class="chat-message user-message">
      <div class="message-bubble">
        <span class="message-label">${query.custom ? "Custom prompt" : "Prepared query"}</span>
        <p>${escapeHtml(query.text)}</p>
      </div>
    </article>

    <article class="chat-message assistant-message">
      <span class="avatar">RL</span>
      <div class="message-bubble result-bubble">
        ${renderBenchmarkResults(results, telemetry)}
      </div>
    </article>
  `;
}

function renderPromptComposer(demo) {
  return `
    <form class="prompt-composer" id="queryForm">
      <textarea
        id="customPrompt"
        name="customPrompt"
        rows="2"
        ${demo ? "" : "disabled"}
        placeholder="${demo ? "Ask a custom retrieval question for this dataset" : "Select a dataset first"}"
      >${escapeHtml(state.customPrompt)}</textarea>
      <div class="composer-actions">
        <button type="button" class="download-button" id="clearQuery" ${demo && (state.selectedQuery || state.customPrompt) ? "" : "disabled"}>Clear</button>
        <button type="submit" class="primary-button" ${demo ? "" : "disabled"}>Run benchmark</button>
      </div>
    </form>
  `;
}

function bindChatEvents(demo) {
  $("pageView").querySelectorAll(".dataset-menu-item").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.hash = `#/chat/${button.dataset.slug}`;
    });
  });

  $("pageView").querySelectorAll(".query-card").forEach((button) => {
    button.addEventListener("click", () => {
      const query = (benchmarkQueries[demo.slug] || [])[Number(button.dataset.queryIndex)];
      state.customPrompt = query?.text || "";
      state.selectedQuery = null;
      renderChatWorkspace();
      $("customPrompt")?.focus();
    });
  });

  $("downloadDataset")?.addEventListener("click", () => downloadDataset(state.activeFile));
  $("clearQuery")?.addEventListener("click", () => {
    state.selectedQuery = null;
    state.customPrompt = "";
    renderChatWorkspace();
  });

  $("queryForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!demo) return;
    const text = $("customPrompt").value.trim();
    if (!text) return;
    state.customPrompt = text;
    state.selectedQuery = buildBenchmarkQuery(text, demo);
    renderChatWorkspace();
    scrollChatToBottom();
  });
}

async function fetchDatasetFile(slug) {
  const localFile = datasetFiles[slug];
  if (localFile) return normalizeFilePayload(slug, localFile);

  const payload = await api(`/api/dataset/file?slug=${encodeURIComponent(slug)}`);
  if (payload.text) return normalizeFilePayload(slug, payload);
  throw new Error("Dataset file is unavailable.");
}

function normalizeFilePayload(slug, payload) {
  const demo = localBySlug.get(slug);
  return {
    slug,
    title: payload.title || demo?.title || slug,
    fileName: payload.fileName || payload.file_name || `${slug}.txt`,
    mime: payload.mime || "text/plain",
    text: String(payload.text || ""),
  };
}

function buildBenchmarkQuery(text, demo) {
  const prepared = (benchmarkQueries[demo.slug] || []).find((query) => query.text === text);
  if (prepared) return prepared;
  return buildCustomQuery(text);
}

function buildCustomQuery(text) {
  const tokens = tokenize(text).filter((token) => token.length > 2);
  return {
    custom: true,
    terms: [...new Set(tokens)].slice(0, 10),
    text,
    type: inferQueryType(text),
  };
}

function inferQueryType(text) {
  const lower = text.toLowerCase();
  if (/\b(which|where|status|region|plan|ticket|order|field|filter)\b/.test(lower)) return "filter";
  if (/\b(connect|connected|relationship|dependency|combine|graph|link)\b/.test(lower)) return "relationship";
  if (/\b(exact|id|code|policy|threshold|sev|ord-|tck-)\b/.test(lower)) return "exact";
  if (/\b(similar|why|explain|meaning|semantic|broad)\b/.test(lower)) return "semantic";
  return "mixed";
}

function renderBenchmarkResults(results, telemetry) {
  const winner = results[0];
  return `
    <div class="answer-summary">
      <div>
        <span class="section-kicker">Recommended retriever</span>
        <h3>${escapeHtml(winner.label)}</h3>
      </div>
      <p>${escapeHtml(winner.reason)}</p>
    </div>

    <div class="token-ledger">
      ${miniStat(telemetry.queryTokens, "Query tokens")}
      ${miniStat(telemetry.chunksScanned, "Chunks scanned")}
      ${miniStat(telemetry.chunksRetrieved, "Chunks retrieved")}
      ${miniStat(telemetry.retrievedTokens, "Retrieved tokens")}
      ${miniStat(telemetry.contextTokens, "Context tokens")}
    </div>

    <div class="score-note">
      <strong>Benchmarking method:</strong>
      <span>Score = relevance 42% + term coverage 28% + method fit 20% + evidence strength 10%. Latency is estimated from method base cost and chunk count.</span>
    </div>

    <div class="comparison-board">
      ${results.map((result, index) => methodCard(result, index)).join("")}
    </div>
  `;
}

function methodCard(result, index) {
  const topEvidence = result.evidence[0];
  return `
    <article class="method-card method-card--${escapeHtml(result.id)}">
      <div class="method-head">
        <span class="rank-badge">#${index + 1}</span>
        <div>
          <strong>${escapeHtml(result.label)}</strong>
          <small>${escapeHtml(result.strength)}</small>
        </div>
      </div>
      <div class="score-meter">
        <strong>${result.score}</strong>
        <span><i style="width:${result.score}%"></i></span>
      </div>
      <div class="metric-grid">
        ${metric("Relevance", result.relevance)}
        ${metric("Coverage", result.coverage)}
        ${metric("Latency", `${result.latency} ms`)}
        ${metric("Evidence", result.evidence.length)}
      </div>
      <div class="evidence-box">
        <span>${escapeHtml(topEvidence?.title || "No evidence")}</span>
        <p>${escapeHtml(topEvidence?.text || "No matching chunk was retrieved.")}</p>
      </div>
    </article>
  `;
}

function metric(label, value) {
  return `<span><b>${escapeHtml(value)}</b><small>${escapeHtml(label)}</small></span>`;
}

function retrievalTelemetry(query, results) {
  const evidenceById = new Map();
  results.forEach((result) => {
    result.evidence.forEach((chunk) => evidenceById.set(chunk.id, chunk));
  });
  const retrievedText = [...evidenceById.values()].map((chunk) => `${chunk.title} ${chunk.text}`).join(" ");
  const queryTokens = estimateTokens(query.text);
  const retrievedTokens = estimateTokens(retrievedText);
  return {
    chunksRetrieved: evidenceById.size,
    chunksScanned: state.chunks.length,
    contextTokens: queryTokens + retrievedTokens,
    queryTokens,
    retrievedTokens,
  };
}

function estimateTokens(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(0, Math.ceil(words * 1.3));
}

function getDemo(slug) {
  return state.demos.find((item) => item.slug === slug) || localBySlug.get(slug);
}

function setPageTitle(title) {
  $("pageTitle").textContent = title;
  document.title = title === "RAG Chat Benchmark" ? "RAGLab" : `${title} | RAGLab`;
}

function miniStat(value, label) {
  return `
    <span class="mini-stat">
      <strong>${escapeHtml(formatNumber(value))}</strong>
      <small>${escapeHtml(label)}</small>
    </span>
  `;
}

function totalPreparedQueries() {
  return Object.values(benchmarkQueries).reduce((total, queries) => total + queries.length, 0);
}

function scrollChatToBottom() {
  requestAnimationFrame(() => {
    const thread = $("chatThread");
    if (thread) thread.scrollTop = thread.scrollHeight;
  });
}

function runBenchmark(query) {
  const results = methodProfiles.map((method) => scoreMethod(method, query));
  results.sort((left, right) => right.score - left.score || left.latency - right.latency);
  return results;
}

function scoreMethod(method, query) {
  const scored = state.chunks
    .map((chunk) => ({ chunk, score: scoreChunk(method.id, query, chunk) }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
  const top = scored[0]?.score || 0;
  const max = Math.max(1, ...scored.map((item) => item.score));
  const normalizedTop = Math.min(1, top / max);
  const coverage = coverageScore(scored.map((item) => `${item.chunk.searchText} ${item.chunk.text}`).join(" "), query.terms);
  const fit = methodFit(method.id, query.type, state.activeSlug);
  const evidenceStrength = Math.min(1, scored.filter((item) => item.score > 0).length / 3);
  const score = Math.round((normalizedTop * 0.42 + coverage * 0.28 + fit * 0.2 + evidenceStrength * 0.1) * 100);

  return {
    ...method,
    score,
    coverage: `${Math.round(coverage * 100)}%`,
    relevance: `${Math.round(normalizedTop * 100)}%`,
    latency: method.latency + Math.round(state.chunks.length * latencyMultiplier(method.id)),
    evidence: scored.filter((item) => item.score > 0).map((item) => item.chunk),
    reason: reasonFor(method.id, query.type),
  };
}

function scoreChunk(methodId, query, chunk) {
  const queryTokens = tokenize(query.text);
  const chunkTokens = tokenize(chunk.searchText);
  const tokenSet = new Set(chunkTokens);
  const overlap = queryTokens.filter((token) => tokenSet.has(token)).length;
  const termHits = (query.terms || []).filter((term) => chunk.searchText.toLowerCase().includes(term.toLowerCase())).length;
  const exactBoost = termHits * 2.2;
  const semanticBoost = queryTokens.filter((token) => chunk.searchText.toLowerCase().includes(token.slice(0, Math.min(5, token.length)))).length * 0.35;
  const fieldBoost = Object.values(chunk.fields || {}).filter((value) => queryTokens.some((token) => String(value).toLowerCase().includes(token))).length * 1.6;
  const graphBoost = relationTokens(chunk.searchText).filter((token) => queryTokens.includes(token)).length * 1.8;

  const weights = {
    bm25: [1.35, 2.2, 0.2, 0.4, 0.4],
    vector: [0.65, 0.7, 1.2, 0.3, 0.7],
    hybrid: [1.1, 1.5, 0.8, 0.7, 0.7],
    graph: [0.7, 0.8, 0.5, 0.2, 1.9],
    field: [0.7, 1.0, 0.2, 2.1, 0.3],
  }[methodId];

  return overlap * weights[0] + exactBoost * weights[1] + semanticBoost * weights[2] + fieldBoost * weights[3] + graphBoost * weights[4];
}

function coverageScore(text, terms) {
  if (!terms?.length) return 0;
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term.toLowerCase())).length / terms.length;
}

function methodFit(methodId, queryType, slug) {
  const fitByType = {
    exact: { bm25: 1, hybrid: 0.88, field: 0.75, vector: 0.5, graph: 0.45 },
    relationship: { graph: 1, hybrid: 0.82, vector: 0.7, bm25: 0.55, field: 0.45 },
    graph: { graph: 1, hybrid: 0.78, vector: 0.68, bm25: 0.52, field: 0.42 },
    filter: { field: 1, bm25: 0.82, hybrid: 0.8, vector: 0.48, graph: 0.42 },
    semantic: { vector: 1, hybrid: 0.86, graph: 0.65, bm25: 0.48, field: 0.38 },
    mixed: { hybrid: 1, bm25: 0.78, vector: 0.75, graph: 0.68, field: 0.62 },
  };
  const slugFit = {
    "retail-orders-csv": { field: 0.18 },
    "support-kb": { field: 0.12 },
    "rag-method-graph": { graph: 0.18 },
    "clinical-trial": { bm25: 0.1, field: 0.08 },
  };
  return Math.min(1, (fitByType[queryType]?.[methodId] || fitByType.mixed[methodId] || 0.5) + (slugFit[slug]?.[methodId] || 0));
}

function reasonFor(methodId, queryType) {
  const reasons = {
    bm25: "Best when exact strings, IDs, and policy terms dominate the query.",
    vector: "Best when wording is broad and semantic similarity matters more than exact labels.",
    hybrid: "Strong default because it balances exact keyword hits with semantic recall.",
    graph: "Best when the query asks about dependencies, links, or subject-predicate-object relationships.",
    field: "Best when structured fields such as plan, status, region, or ticket intent should constrain retrieval.",
  };
  if (queryType === "filter" && methodId === "field") return "Structured fields make this query easier to constrain before ranking evidence.";
  return reasons[methodId];
}

function latencyMultiplier(methodId) {
  return { bm25: 1, vector: 2, hybrid: 3, graph: 4, field: 1.5 }[methodId] || 2;
}

function createChunks(slug, file) {
  if (slug === "clinical-trial") return parseJsonQa(file.text);
  if (slug === "support-kb") return parseJsonl(file.text);
  if (slug === "retail-orders-csv") return parseCsv(file.text);
  if (slug === "rag-method-graph") return parseTriples(file.text);
  return parseBlocks(file.text, file.fileName);
}

function parseJsonQa(text) {
  try {
    return JSON.parse(text).map((item, index) => ({
      id: item.id || `qa-${index + 1}`,
      title: `${item.type || "QA"} ${index + 1}`,
      text: `Q: ${item.question} A: ${item.answer} Terms: ${(item.gold_terms || []).join(", ")}`,
      searchText: `${item.question} ${item.answer} ${(item.gold_terms || []).join(" ")}`,
      fields: item,
    }));
  } catch {
    return parseBlocks(text, "qa-json");
  }
}

function parseJsonl(text) {
  return text
    .split(/\n+/)
    .filter(Boolean)
    .map((line, index) => {
      const item = JSON.parse(line);
      const title = `${item.ticket_id} | ${item.plan} | ${item.intent}`;
      return {
        id: item.ticket_id || `ticket-${index + 1}`,
        title,
        text: `${item.message} Resolution: ${item.resolution}`,
        searchText: Object.values(item).join(" "),
        fields: item,
      };
    });
}

function parseCsv(text) {
  const rows = text.trim().split(/\n/);
  const headers = rows.shift().split(",");
  return rows.map((row, index) => {
    const values = splitCsvRow(row);
    const fields = Object.fromEntries(headers.map((header, fieldIndex) => [header, values[fieldIndex] || ""]));
    return {
      id: fields.order_id || `row-${index + 1}`,
      title: `${fields.order_id} | ${fields.region} | ${fields.status}`,
      text: headers.map((header) => `${header}: ${fields[header]}`).join("; "),
      searchText: Object.values(fields).join(" "),
      fields,
    };
  });
}

function parseTriples(text) {
  return text
    .split(/\n+/)
    .filter((line) => line.trim().startsWith("rag:"))
    .map((line, index) => ({
      id: `triple-${index + 1}`,
      title: line.replace(/\s*\.\s*$/, ""),
      text: line,
      searchText: line.replace(/rag:/g, " ").replace(/[^\w-]+/g, " "),
      fields: { triple: line },
    }));
}

function parseBlocks(text, fileName) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => ({
      id: `${fileName}-${index + 1}`,
      title: block.startsWith("#") ? block.replace(/^#+\s*/, "") : `Section ${index + 1}`,
      text: compact(block.replace(/^#+\s*/, ""), 360),
      searchText: block,
      fields: {},
    }));
}

function splitCsvRow(row) {
  const values = [];
  let current = "";
  let quoted = false;
  for (const char of row) {
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function sampleCard(chunk) {
  return `
    <article class="sample-card">
      <span>${escapeHtml(chunk.id)}</span>
      <strong>${escapeHtml(chunk.title)}</strong>
      <p>${escapeHtml(compact(chunk.text, 220))}</p>
    </article>
  `;
}

function analyzeText(text) {
  const words = tokenize(text);
  const indexedWords = words.filter((word) => !stopwords.has(word) && word.length > 2);
  const counts = indexedWords.reduce((map, word) => {
    map.set(word, (map.get(word) || 0) + 1);
    return map;
  }, new Map());
  const topTerms = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8)
    .map(([term, count]) => ({ term, count }));

  return {
    characters: text.length,
    headings: text
      .split(/\n+/)
      .filter((line) => line.trim().startsWith("#"))
      .map((line) => line.replace(/^#+\s*/, "").trim()),
    lines: text.split(/\n/).filter((line) => line.trim()).length,
    paragraphs: text.split(/\n\s*\n/).filter((block) => block.trim()).length,
    sentences: text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 8).length,
    topTerms,
    uniqueTerms: new Set(indexedWords).size,
    words: words.length,
  };
}

function tokenize(text) {
  return [...String(text).toLowerCase().matchAll(/[a-z0-9][a-z0-9_-]{1,}/g)]
    .map((match) => match[0])
    .filter((token) => !stopwords.has(token));
}

function relationTokens(text) {
  return [...String(text).toLowerCase().matchAll(/rag:([a-z0-9_-]+)/g)].map((match) => match[1]);
}

function statCard(label, value) {
  return `
    <div class="stat-box">
      <strong>${escapeHtml(formatNumber(value))}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function summaryRow(label, value) {
  return `
    <div class="summary-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderTerms(terms) {
  if (!terms.length) return `<div class="summary-row"><strong>No indexed terms</strong></div>`;
  const max = Math.max(...terms.map((item) => item.count), 1);
  return terms
    .map((item) => {
      const width = Math.max(8, Math.round((item.count / max) * 100));
      return `
        <div class="term-row">
          <span>${escapeHtml(item.term)}</span>
          <i><b style="width:${width}%"></b></i>
          <em>${item.count}</em>
        </div>
      `;
    })
    .join("");
}

function downloadDataset(file) {
  const blob = new Blob([file.text], { type: `${file.mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function extensionLabel(fileName) {
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "txt";
  return `.${extension.toLowerCase()}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function compact(text, limit) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1).trim()}...`;
}

function setStatus(message) {
  $("status").textContent = message;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
