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
  if (!raw) return { page: "datasets", slug: "" };

  const parts = raw.split("/").filter(Boolean);
  if (parts.length === 1 && getDemo(parts[0])) return { page: "dataset", slug: parts[0] };
  return { page: parts[0] || "datasets", slug: parts[1] || "" };
}

async function renderRoute() {
  const route = parseRoute();
  const page = ["datasets", "dataset", "benchmark"].includes(route.page) ? route.page : "datasets";

  if (page === "dataset" && route.slug) {
    await renderDatasetRoute(route.slug);
    return;
  }

  if (page === "benchmark" && route.slug) {
    await renderBenchmarkRoute(route.slug);
    return;
  }

  renderDatasetIndex();
}

async function renderDatasetRoute(slug) {
  try {
    await ensureDataset(slug);
    const demo = getDemo(slug);
    renderTopNav("dataset", slug);
    setPageTitle("EDA");
    setStatus("EDA ready");
    renderDatasetPage(demo, state.activeFile);
  } catch (error) {
    renderErrorPage(error.message || "Dataset could not be loaded.");
  }
}

async function renderBenchmarkRoute(slug) {
  try {
    await ensureDataset(slug);
    const demo = getDemo(slug);
    renderTopNav("benchmark", slug);
    setPageTitle("Benchmark");
    setStatus("Benchmark ready");
    renderBenchmarkPage(demo, state.activeFile);
  } catch (error) {
    renderErrorPage(error.message || "Benchmark could not be loaded.");
  }
}

async function ensureDataset(slug) {
  const demo = getDemo(slug);
  if (!demo) throw new Error("Dataset not found.");

  if (state.activeSlug === slug && state.activeFile) return;

  setStatus("Loading dataset");
  state.activeSlug = slug;
  state.selectedQuery = null;
  state.activeFile = await fetchDatasetFile(slug);
  state.chunks = createChunks(slug, state.activeFile);
}

function renderTopNav(page, slug = state.activeSlug) {
  const demo = getDemo(slug);
  const edaHref = demo ? `#/dataset/${demo.slug}` : "";
  const benchmarkHref = demo ? `#/benchmark/${demo.slug}` : "";
  $("topNav").innerHTML = `
    <a class="${page === "datasets" ? "is-active" : ""}" href="#/datasets">Datasets</a>
    ${
      demo
        ? `<a class="${page === "dataset" ? "is-active" : ""}" href="${escapeHtml(edaHref)}">EDA</a>`
        : `<span class="nav-disabled">EDA</span>`
    }
    ${
      demo
        ? `<a class="${page === "benchmark" ? "is-active" : ""}" href="${escapeHtml(benchmarkHref)}">Benchmark</a>`
        : `<span class="nav-disabled">Benchmark</span>`
    }
  `;
}

function renderDatasetIndex() {
  renderTopNav("datasets");
  setPageTitle("Datasets");
  setStatus(`${state.demos.length} datasets ready`);
  $("pageView").innerHTML = `
    <section class="page-shell">
      <header class="page-head page-head--wide">
        <div>
          <span class="section-kicker">Start here</span>
          <h2>Choose your dataset</h2>
          <p>Pick one prepared data shape, inspect its EDA page, download the source file, then run the benchmark page with example retrieval questions.</p>
        </div>
        <div class="quick-stats">
          ${miniStat(state.demos.length, "Dataset types")}
          ${miniStat(methodProfiles.length, "RAG methods")}
          ${miniStat(totalPreparedQueries(), "Queries")}
        </div>
      </header>

      <div class="dataset-card-grid">
        ${state.demos.map((demo) => datasetCard(demo)).join("")}
      </div>
    </section>
  `;
}

function datasetCard(demo) {
  const file = datasetFiles[demo.slug];
  const dataset = demo.dataset || {};
  const metric = demo.profile?.primaryMetric || "Records";
  return `
    <article class="dataset-card">
      <div class="card-kicker">
        <span>${escapeHtml(demo.profile?.kind || "Demo dataset")}</span>
        <b>${file ? escapeHtml(extensionLabel(file.fileName)) : "file"}</b>
      </div>
      <h3>${escapeHtml(demo.title)}</h3>
      <p>${escapeHtml(demo.description || demo.profile?.focus || "Prepared benchmark dataset.")}</p>
      <div class="dataset-stats">
        ${miniStat(dataset.records || dataset.documents || 0, metric)}
        ${miniStat(dataset.fields || 1, "Fields")}
        ${miniStat(dataset.entities || 0, "Entities")}
      </div>
      <div class="best-fit-line">
        ${(demo.profile?.bestFor || []).slice(0, 3).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
      <div class="dataset-actions">
        <a class="primary-button" href="#/dataset/${escapeHtml(demo.slug)}">Explore EDA</a>
        <a class="download-button" href="#/benchmark/${escapeHtml(demo.slug)}">Benchmark</a>
      </div>
    </article>
  `;
}

function renderDatasetPage(demo, file) {
  const analysis = analyzeText(file.text);
  const dataset = demo.dataset || {};
  const sampleChunks = state.chunks.slice(0, 4);

  $("pageView").innerHTML = `
    <article class="page-shell">
      <header class="page-head">
        <div>
          <div class="heading-row">
            <span class="section-kicker">${escapeHtml(demo.profile?.kind || "Demo corpus")}</span>
            <span class="format-badge">${escapeHtml(extensionLabel(file.fileName))}</span>
          </div>
          <h2>${escapeHtml(demo.title)}</h2>
          <p>${escapeHtml(demo.profile?.focus || demo.description || "Prepared dataset.")}</p>
        </div>
        <div class="action-stack">
          <a class="primary-button" href="#/benchmark/${escapeHtml(demo.slug)}">Benchmark RAG</a>
          <button type="button" class="download-button" id="downloadDataset">Download ${escapeHtml(extensionLabel(file.fileName))}</button>
        </div>
      </header>

      <section class="stat-grid">
        ${statCard(demo.profile?.primaryMetric || "Records", dataset.records || dataset.documents || analysis.paragraphs)}
        ${statCard("Fields", dataset.fields || analysis.headings.length || 1)}
        ${statCard("Chunks", state.chunks.length || dataset.chunks || analysis.paragraphs)}
        ${statCard("Entities", dataset.entities || 0)}
        ${statCard("Words", analysis.words)}
      </section>

      <section class="eda-layout">
        <div class="analysis-panel analysis-panel--summary">
          <div class="section-title">
            <h3>EDA Summary</h3>
            <span class="section-kicker">${formatNumber(analysis.characters)} chars</span>
          </div>
          <div class="summary-list">
            ${summaryRow("Type", demo.profile?.kind || "Demo dataset")}
            ${summaryRow("Source", demo.source || dataset.source || "demo")}
            ${summaryRow("File", file.fileName)}
            ${summaryRow("Structure", `${analysis.lines} lines, ${analysis.paragraphs} blocks, ${analysis.sentences} sentences`)}
            ${summaryRow("Ingestion", demo.profile?.ingestion || "Load as text, chunk, embed, and index.")}
          </div>
        </div>

        <div class="analysis-panel">
          <div class="section-title">
            <h3>Best Fit</h3>
            <span class="section-kicker">retrievers</span>
          </div>
          <div class="fit-list">
            ${(demo.profile?.bestFor || ["Hybrid RAG", "BM25", "Vector RAG"])
              .map((item, index) => `<span><b>${index + 1}</b>${escapeHtml(item)}</span>`)
              .join("")}
          </div>
        </div>

        <div class="analysis-panel">
          <div class="section-title">
            <h3>Top Terms</h3>
            <span class="section-kicker">frequency</span>
          </div>
          <div class="term-list">${renderTerms(analysis.topTerms)}</div>
        </div>
      </section>

      <section class="sample-panel">
        <div class="section-title">
          <h3>Sample Data</h3>
          <span class="section-kicker">${escapeHtml(file.fileName)}</span>
        </div>
        <div class="sample-grid">
          ${sampleChunks.map((chunk) => sampleCard(chunk)).join("")}
        </div>
      </section>

      <section class="file-panel">
        <div class="file-toolbar">
          <div class="section-title">
            <h3>Raw File Preview</h3>
          </div>
          <span class="file-name">${escapeHtml(file.fileName)}</span>
        </div>
        <pre class="file-preview">${escapeHtml(file.text)}</pre>
      </section>
    </article>
  `;

  $("downloadDataset").addEventListener("click", () => downloadDataset(file));
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

function renderBenchmarkPage(demo, file) {
  const queries = benchmarkQueries[demo.slug] || [];
  const results = state.selectedQuery ? runBenchmark(state.selectedQuery) : [];

  $("pageView").innerHTML = `
    <article class="page-shell benchmark-shell">
      <header class="page-head">
        <div>
          <div class="heading-row">
            <span class="section-kicker">${escapeHtml(demo.profile?.kind || "Demo corpus")}</span>
            <span class="format-badge">${escapeHtml(extensionLabel(file.fileName))}</span>
          </div>
          <h2>${escapeHtml(demo.title)}</h2>
          <p>Choose a prepared query and compare BM25, Vector RAG, Hybrid RAG, GraphRAG, and Field-aware RAG side by side on this dataset.</p>
        </div>
        <div class="action-stack">
          <a class="download-button" href="#/dataset/${escapeHtml(demo.slug)}">Back to EDA</a>
          <button type="button" class="download-button" id="downloadDataset">Download ${escapeHtml(extensionLabel(file.fileName))}</button>
        </div>
      </header>

      <section class="benchmark-layout">
        <aside class="query-panel-page">
          <div class="section-title">
            <h3>Example Queries</h3>
            <span class="section-kicker">${queries.length} prepared</span>
          </div>
          <div class="query-grid">
            ${queries
              .map((query, index) => {
                const active = state.selectedQuery?.text === query.text ? " is-active" : "";
                return `
                  <button type="button" class="query-card${active}" data-index="${index}">
                    <span>${escapeHtml(query.type)}</span>
                    <strong>${escapeHtml(query.text)}</strong>
                  </button>
                `;
              })
              .join("")}
          </div>
        </aside>

        <section class="result-zone ${state.selectedQuery ? "" : "is-muted"}" id="resultZone">
          ${
            state.selectedQuery
              ? renderBenchmarkResults(results)
              : `<div class="benchmark-empty"><h3>Select a query to run the side-by-side retrieval benchmark.</h3></div>`
          }
        </section>
      </section>
    </article>
  `;

  $("downloadDataset").addEventListener("click", () => downloadDataset(file));
  $("pageView").querySelectorAll(".query-card").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedQuery = benchmarkQueries[demo.slug][Number(button.dataset.index)];
      renderBenchmarkPage(demo, state.activeFile);
    });
  });
}

function renderBenchmarkResults(results) {
  const winner = results[0];
  return `
    <div class="winner-band">
      <div>
        <span class="section-kicker">Recommended</span>
        <h3>${escapeHtml(winner.label)}</h3>
      </div>
      <p>${escapeHtml(winner.reason)}</p>
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

function renderErrorPage(message) {
  renderTopNav("datasets");
  setPageTitle("Datasets");
  setStatus("Load failed");
  $("pageView").innerHTML = `
    <section class="empty-state">
      <h2>${escapeHtml(message)}</h2>
      <a class="primary-button" href="#/datasets">Back to datasets</a>
    </section>
  `;
}

function getDemo(slug) {
  return state.demos.find((item) => item.slug === slug) || localBySlug.get(slug);
}

function setPageTitle(title) {
  $("pageTitle").textContent = title;
  document.title = title === "Datasets" ? "RAGLab" : `${title} | RAGLab`;
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
