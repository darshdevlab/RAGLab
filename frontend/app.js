const HOSTED_API_BASE = "https://peluzzqoihjvkdtedsiz.supabase.co/functions/v1/raglab";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const API_BASE = LOCAL_HOSTS.has(window.location.hostname) ? "" : HOSTED_API_BASE;

const datasetFiles = {
  "raglab-architecture": `# RAGLab Demo Dataset

RAGLab is a product prototype for comparing retrieval augmented generation strategies on the same dataset. The platform helps a visitor choose prepared demo corpora, ask natural language questions, inspect retrieved evidence, and see which RAG strategy works best for that dataset and query type.

Vector RAG uses hosted pgvector similarity search to find chunks with similar meaning signals. In this hosted prototype the embedding is a deterministic hashed token vector so the app works without a paid model API. Later it can be swapped for an open-source embedding endpoint. Vector RAG is useful for concept questions, but it can fail when the query requires an exact term, identifier, or quoted phrase.

BM25 and keyword RAG use Postgres full-text search. BM25 is strong when the user searches for exact terms such as pgvector, Supabase, GraphRAG, latency, citations, or a named product. BM25 is fast, explainable, and cheap. It can miss paraphrases when the document uses different wording from the question.

Hybrid RAG combines keyword scores with vector similarity scores. Hybrid RAG is often the safest default because it keeps exact-term precision while recovering semantic matches. A good hybrid system normalizes BM25 and vector scores before combining them. It should show score components so the user can understand why a chunk was selected.

Memory RAG adds session context. It stores user preferences, prior questions, accepted facts, and rejected facts. Memory RAG is useful when the user says things like remember that I prefer low cost deployment and later asks which architecture should be selected. Memory must include approve, delete, and inspect controls because uncontrolled memory can make retrieval biased or stale.

GraphRAG builds an entity and relationship layer over the document collection. Entities can include RAGLab, Supabase, pgvector, Vercel, BM25, Hybrid RAG, Memory RAG, GraphRAG, and citations. Relationships connect methods to strengths, limitations, storage choices, and deployment decisions. GraphRAG is useful for questions about how concepts connect, which methods depend on embeddings, or which architecture links Vercel with Supabase.

For the online version, Vercel can host the interactive frontend, but this live prototype is served from a Supabase Edge Function. Supabase stores documents, chunks, metadata, vector embeddings through pgvector, keyword search indexes, memory rows, entities, and relations. This means the first online version does not need separate Pinecone, Qdrant, Weaviate, or Neo4j deployments. Those adapters can be added later if the product becomes a database benchmark.

RAGLab should not pretend every RAG method is correct. The dashboard should show retrieved chunks, citations, latency, method strengths, method limitations, and a recommendation score. A recommendation is only trustworthy when evidence is visible. The strongest portfolio version is a full working end-to-end prototype: data ingestion, chunking, indexing, query execution, retrieval comparison, scoring, ranking, and interactive UI.`,

  "clinical-trial": `# CardioMap Trial Protocol

CardioMap is a synthetic clinical trial protocol for a remote blood pressure monitoring study. The protocol compares usual care with a digital coaching arm called DCA-42. Participants wear the PulseBand PB-7 cuff, answer symptom surveys, and receive medication adherence nudges. The primary endpoint is change in systolic blood pressure at week 12.

Eligibility requires adults aged 35 to 75 with two clinic systolic readings above 140 mmHg or one home seven-day average above 135 mmHg. Exclusion criteria include pregnancy, dialysis, active myocarditis, recent stroke within 90 days, and current use of investigational drug INV-908. Patients with atrial fibrillation may enroll only if their resting heart rate is below 110 bpm.

The safety workflow routes red alerts to Nurse Triage, amber alerts to the coaching queue, and device-quality alerts to Biomedical Operations. A red alert is generated when systolic pressure exceeds 180 mmHg, diastolic pressure exceeds 120 mmHg, or the patient reports chest pain with shortness of breath. Amber alerts cover missed readings for three days, dizziness, or mild edema.

The protocol glossary defines SBP as systolic blood pressure, DBP as diastolic blood pressure, eGFR as estimated glomerular filtration rate, and AE as adverse event. Keyword retrieval should be strong for exact abbreviations such as eGFR, AE, PB-7, DCA-42, and INV-908. Semantic retrieval should help when a user asks about kidney function, safety routing, or high blood pressure without using the exact terms.

CardioMap has a monitoring graph that connects PulseBand PB-7 to Biomedical Operations, Nurse Triage to red alerts, and DCA-42 to adherence nudges. The graph also links chest pain to red alert escalation and dialysis to exclusion. A relationship query about which teams handle device problems should traverse from device-quality alerts to Biomedical Operations.`,

  "incident-runbook": `# Northwind Incident Response Runbook

Northwind Cloud runs a synthetic checkout platform with API Gateway, Cart Service, Payment Service, Inventory Service, Fraud Scoring, PostgreSQL Orders, and Redis Session Cache. The customer-facing service level objective is 99.9 percent monthly availability and p95 checkout latency below 450 ms.

Incident SEV-1 is declared when checkout success rate falls below 94 percent for five minutes, payment authorization errors exceed 6 percent, or API Gateway returns more than 2 percent 5xx responses. SEV-2 is declared when p95 latency exceeds 900 ms for ten minutes or one region has elevated queue depth. The escalation channel is #incident-checkout and the incident commander owns status updates every fifteen minutes.

The dependency map is important. API Gateway calls Cart Service, Cart Service calls Inventory Service and Redis Session Cache, Payment Service calls Fraud Scoring, and PostgreSQL Orders stores completed orders. If Redis Session Cache is unavailable, Cart Service can serve stale carts for ten minutes. If Fraud Scoring is unavailable, Payment Service must switch to rules-only mode after approval from Risk Operations.

Recovery playbooks include rollback of the latest Gateway routing rule, scaling Payment Service workers, disabling nonessential recommendation calls, and enabling queue drain mode. Rollback is preferred when the latest deployment changed routing, headers, or request signing. Queue drain mode is preferred when the database is healthy but workers are behind.

GraphRAG should perform well on questions about service dependencies and escalation paths. BM25 should perform well for exact strings such as SEV-1, p95, #incident-checkout, Redis Session Cache, and rules-only mode. Hybrid retrieval should do well when a query mixes exact incident codes with broad language about checkout failure.`,

  "support-kb": `# AtlasDesk Customer Support Knowledge Base

AtlasDesk is a synthetic B2B support product with three plans: Starter, Growth, and Enterprise. Starter includes email support with a 24 hour target, Growth includes chat support with a four hour target, and Enterprise includes a named customer success manager with a one hour urgent target.

Refund policy RFD-14 says a customer can receive a full refund within 14 days if fewer than 500 tickets were processed and no custom onboarding was delivered. After 14 days, billing credits require Finance Approval. Enterprise customers with annual contracts use addendum ENT-A9, which allows service credits for missed urgent response targets.

Data retention policy DRP-30 keeps closed tickets for 30 months on Growth and Enterprise, but only 12 months on Starter. Audit exports are available on Enterprise and must be requested by an account owner. A deletion request removes attachments first, then ticket messages, then analytics aggregates during the next nightly privacy job.

The support graph connects Enterprise to customer success manager, urgent target, audit exports, and ENT-A9. It connects refund requests to RFD-14, Finance Approval, and billing credits. It connects deletion requests to attachments, ticket messages, analytics aggregates, and privacy job. Relationship queries should explain the chain rather than only return a single policy paragraph.

Memory RAG is useful for AtlasDesk when the user says they prefer low-cost plans, short response times, or strict retention. If the user remembers that they are evaluating Enterprise compliance, retrieval should bias toward audit exports, retention, account owner controls, and service credits.`,
};

const localDemos = [
  {
    slug: "raglab-architecture",
    title: "RAGLab Architecture",
    source: "demo:raglab-architecture",
    description: "Portfolio architecture corpus for RAG method comparison.",
    profile: {
      kind: "Architecture docs",
      focus: "RAG architecture, pgvector, deployment options, and GraphRAG relationships.",
    },
    dataset: {
      slug: "raglab-architecture",
      title: "RAGLab Demo Dataset",
      source: "sample",
      documents: 1,
      chunks: 4,
      entities: 57,
      relations: 112,
      avg_chunk_tokens: 94,
    },
  },
  {
    slug: "clinical-trial",
    title: "CardioMap Trial Protocol",
    source: "demo:clinical-trial",
    description: "Clinical protocol with abbreviations, safety thresholds, and routing relationships.",
    profile: {
      kind: "Clinical protocol",
      focus: "Clinical abbreviations, safety thresholds, escalation routing, and device-quality alerts.",
    },
    dataset: {
      slug: "clinical-trial",
      title: "CardioMap Trial Protocol",
      source: "browser",
      documents: 1,
      chunks: 3,
      entities: 31,
      relations: 84,
      avg_chunk_tokens: 90,
    },
  },
  {
    slug: "incident-runbook",
    title: "Northwind Incident Runbook",
    source: "demo:incident-runbook",
    description: "Production incident runbook with exact SEV terms and service dependency graph.",
    profile: {
      kind: "Incident runbook",
      focus: "SEV rules, service dependency chains, payment fallback, and rollback decisions.",
    },
    dataset: {
      slug: "incident-runbook",
      title: "Northwind Incident Runbook",
      source: "browser",
      documents: 1,
      chunks: 3,
      entities: 42,
      relations: 84,
      avg_chunk_tokens: 86,
    },
  },
  {
    slug: "support-kb",
    title: "AtlasDesk Support KB",
    source: "demo:support-kb",
    description: "Support policy corpus for refund, retention, plan, and memory-biased queries.",
    profile: {
      kind: "Support KB",
      focus: "Refund policies, support plans, retention controls, and memory-biased recommendations.",
    },
    dataset: {
      slug: "support-kb",
      title: "AtlasDesk Support KB",
      source: "browser",
      documents: 1,
      chunks: 2,
      entities: 29,
      relations: 56,
      avg_chunk_tokens: 104,
    },
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
    state.demos = (payload.demos?.length ? payload.demos : localDemos).map(mergeDemo);
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

function mergeDemo(remote) {
  const local = localBySlug.get(remote.slug) || {};
  return {
    ...local,
    ...remote,
    profile: { ...(local.profile || {}), ...(remote.profile || {}) },
    dataset: { ...(local.dataset || {}), ...(remote.dataset || {}) },
  };
}

function renderDatasetList() {
  $("datasetCount").textContent = state.demos.length;
  $("datasetList").innerHTML = state.demos
    .map((demo) => {
      const active = demo.slug === state.activeSlug ? " is-active" : "";
      return `
        <button type="button" class="dataset-item${active}" data-slug="${escapeHtml(demo.slug)}">
          <strong>${escapeHtml(demo.title)}</strong>
          <span>${escapeHtml(demo.profile?.kind || demo.source || "Demo dataset")}</span>
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
  try {
    const payload = await api(`/api/dataset/file?slug=${encodeURIComponent(slug)}`);
    if (payload.text) return normalizeFilePayload(slug, payload);
  } catch {
    // The hosted API may still be on the previous function version; browser fallback keeps downloads working.
  }

  const text = datasetFiles[slug];
  if (!text) throw new Error("Dataset file is unavailable.");
  return normalizeFilePayload(slug, { text });
}

function normalizeFilePayload(slug, payload) {
  const demo = localBySlug.get(slug);
  return {
    slug,
    title: payload.title || demo?.title || slug,
    fileName: payload.file_name || `${slug}.md`,
    mime: payload.mime || "text/markdown",
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
          <span class="section-kicker">${escapeHtml(demo.profile?.kind || "Demo corpus")}</span>
          <h2>${escapeHtml(demo.title)}</h2>
          <p>${escapeHtml(description)}</p>
        </div>
        <button type="button" class="download-button" id="downloadDataset">Download .md</button>
      </header>

      <section class="stat-grid">
        ${statCard("Documents", dataset.documents || 1)}
        ${statCard("Chunks", dataset.chunks || analysis.paragraphs)}
        ${statCard("Entities", dataset.entities || 0)}
        ${statCard("Relations", dataset.relations || 0)}
        ${statCard("Words", analysis.words)}
      </section>

      <section class="eda-grid">
        <div class="analysis-panel">
          <div class="section-title">
            <h3>Content Profile</h3>
            <span class="section-kicker">${formatNumber(analysis.characters)} chars</span>
          </div>
          <div class="summary-list">
            ${summaryRow("Source", demo.source || dataset.source || "demo")}
            ${summaryRow("File", file.fileName)}
            ${summaryRow("Structure", `${analysis.headings.length} headings, ${analysis.paragraphs} paragraphs, ${analysis.sentences} sentences`)}
            ${summaryRow("Vocabulary", `${formatNumber(analysis.uniqueTerms)} unique indexed terms`)}
            ${summaryRow("Avg chunk", `${dataset.avg_chunk_tokens || estimateAvgTokens(analysis)} tokens`)}
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

function estimateAvgTokens(analysis) {
  return Math.max(1, Math.round(analysis.words / Math.max(1, analysis.paragraphs)));
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
