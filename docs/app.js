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
      ingestion: "Parse triples into entities and relations, then use graph traversal for relationship questions.",
    },
    dataset: { records: 20, fields: 3, chunks: 8, entities: 16, relations: 20, avg_chunk_tokens: 11 },
  },
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
  "when",
  "which",
  "with",
]);

const state = {
  activeFile: null,
  activeSlug: "",
  demos: [],
};

const $ = (id) => document.getElementById(id);
const localBySlug = new Map(localDemos.map((demo) => [demo.slug, demo]));

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await refreshDatasets();
  const deepLinkedSlug = window.location.hash.replace("#", "");
  if (deepLinkedSlug && state.demos.some((demo) => demo.slug === deepLinkedSlug)) {
    loadDataset(deepLinkedSlug);
  }
}

async function refreshDatasets() {
  setStatus("Loading datasets");
  try {
    const payload = await api("/api/demos");
    state.demos = mergeDemos(payload.demos || []);
  } catch {
    state.demos = localDemos;
  }
  renderDatasetList();
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

function renderDatasetList() {
  $("datasetCount").textContent = state.demos.length;
  $("datasetList").innerHTML = state.demos
    .map((demo) => {
      const active = demo.slug === state.activeSlug ? " is-active" : "";
      const file = datasetFiles[demo.slug];
      return `
        <button type="button" class="dataset-item${active}" data-slug="${escapeHtml(demo.slug)}">
          <strong>${escapeHtml(demo.title)}</strong>
          <span>${escapeHtml(demo.profile?.kind || demo.source || "Demo dataset")}${file ? ` | ${escapeHtml(extensionLabel(file.fileName))}` : ""}</span>
        </button>
      `;
    })
    .join("");

  $("datasetList").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => loadDataset(button.dataset.slug));
  });
}

async function loadDataset(slug) {
  const demo = state.demos.find((item) => item.slug === slug);
  if (!demo) return;

  state.activeSlug = slug;
  renderDatasetList();
  setStatus("Loading dataset file");

  try {
    const file = await fetchDatasetFile(slug);
    state.activeFile = file;
    renderDatasetDashboard(demo, file);
    window.location.hash = slug;
    setStatus("Dataset loaded");
  } catch (error) {
    $("datasetView").innerHTML = `<div class="empty-state"><h2>${escapeHtml(error.message)}</h2></div>`;
    setStatus("Dataset load failed");
  }
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

function renderDatasetDashboard(demo, file) {
  const analysis = analyzeText(file.text);
  const dataset = demo.dataset || {};
  const description = demo.profile?.focus || demo.description || "Prepared dataset.";

  $("datasetView").innerHTML = `
    <article class="eda-shell">
      <header class="eda-head">
        <div>
          <div class="heading-row">
            <span class="section-kicker">${escapeHtml(demo.profile?.kind || "Demo corpus")}</span>
            <span class="format-badge">${escapeHtml(extensionLabel(file.fileName))}</span>
          </div>
          <h2>${escapeHtml(demo.title)}</h2>
          <p>${escapeHtml(description)}</p>
        </div>
        <button type="button" class="download-button" id="downloadDataset">Download ${escapeHtml(extensionLabel(file.fileName))}</button>
      </header>

      <section class="stat-grid">
        ${statCard(demo.profile?.primaryMetric || "Records", dataset.records || dataset.documents || analysis.paragraphs)}
        ${statCard("Fields", dataset.fields || analysis.headings.length || 1)}
        ${statCard("Chunks", dataset.chunks || analysis.paragraphs)}
        ${statCard("Entities", dataset.entities || 0)}
        ${statCard("Words", analysis.words)}
      </section>

      <section class="eda-grid">
        <div class="analysis-panel">
          <div class="section-title">
            <h3>Content Profile</h3>
            <span class="section-kicker">${formatNumber(analysis.characters)} chars</span>
          </div>
          <div class="summary-list">
            ${summaryRow("Type", demo.profile?.kind || "Demo dataset")}
            ${summaryRow("Source", demo.source || dataset.source || "demo")}
            ${summaryRow("File", file.fileName)}
            ${summaryRow("MIME", file.mime)}
            ${summaryRow("Structure", `${analysis.lines} lines, ${analysis.paragraphs} blocks, ${analysis.sentences} sentences`)}
            ${summaryRow("Ingestion", demo.profile?.ingestion || "Load as text, chunk, embed, and index.")}
          </div>
        </div>

        <div class="analysis-panel">
          <div class="section-title">
            <h3>Top Terms</h3>
            <span class="section-kicker">frequency</span>
          </div>
          <div class="term-list">
            ${renderTerms(analysis.topTerms)}
          </div>
        </div>
      </section>

      <section class="file-panel">
        <div class="file-toolbar">
          <div class="section-title">
            <h3>Dataset File</h3>
          </div>
          <span class="file-name">${escapeHtml(file.fileName)}</span>
        </div>
        <pre class="file-preview">${escapeHtml(file.text)}</pre>
      </section>
    </article>
  `;

  $("downloadDataset").addEventListener("click", () => downloadDataset(file));
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
  return [...text.toLowerCase().matchAll(/[a-z][a-z0-9-]{1,}/g)].map((match) => match[0]);
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
