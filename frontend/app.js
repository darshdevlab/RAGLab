const SESSION_ID = "demo";
const HOSTED_API_BASE = "https://peluzzqoihjvkdtedsiz.supabase.co/functions/v1/raglab";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const API_BASE = LOCAL_HOSTS.has(window.location.hostname) ? "" : HOSTED_API_BASE;

const hostedDemos = [
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
    description: "Support policy corpus for refund, retention, plan, and memory-biased queries.",
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

const benchmarkRegistry = {
  "raglab-architecture": [
    {
      type: "mixed",
      question: "Which RAG method is safest for a mixed query about Vercel and Supabase deployment?",
      expected: "Hybrid RAG is safest because it balances exact keyword precision with vector recall and keeps evidence visible.",
      terms: ["Hybrid RAG", "keyword", "vector", "Vercel", "Supabase", "evidence"],
    },
    {
      type: "semantic",
      question: "How does Hybrid RAG combine keyword and vector retrieval?",
      expected: "Hybrid RAG combines normalized keyword scores with vector similarity scores before ranking chunks.",
      terms: ["keyword scores", "vector similarity", "normalized", "ranking"],
    },
    {
      type: "exact",
      question: "Which method is best for exact terms like pgvector and BM25?",
      expected: "BM25 or keyword RAG is strongest for exact terms such as pgvector and BM25.",
      terms: ["BM25", "keyword", "exact terms", "pgvector"],
    },
    {
      type: "relationship",
      question: "What connects Vercel, Supabase, pgvector, and GraphRAG?",
      expected: "The architecture connects Vercel frontend/orchestration with Supabase storage, pgvector search, and GraphRAG entity relationships.",
      terms: ["Vercel", "Supabase", "pgvector", "GraphRAG", "relationships"],
    },
  ],
  "clinical-trial": [
    {
      type: "exact",
      question: "Which exact exclusions mention INV-908, dialysis, or eGFR?",
      expected: "Exclusions include dialysis and current use of investigational drug INV-908; eGFR is defined in the glossary.",
      terms: ["dialysis", "INV-908", "exclusion", "eGFR", "glossary"],
    },
    {
      type: "routing",
      question: "What should happen when a patient has chest pain and shortness of breath?",
      expected: "Chest pain with shortness of breath generates a red alert routed to Nurse Triage.",
      terms: ["chest pain", "shortness of breath", "red alert", "Nurse Triage"],
    },
    {
      type: "relationship",
      question: "Which team handles device-quality alerts from PulseBand PB-7?",
      expected: "Device-quality alerts from PulseBand PB-7 route to Biomedical Operations.",
      terms: ["PulseBand PB-7", "device-quality alerts", "Biomedical Operations"],
    },
    {
      type: "semantic",
      question: "Explain the relationship between DCA-42, adherence nudges, and week 12 blood pressure.",
      expected: "DCA-42 is the digital coaching arm that sends adherence nudges and measures systolic blood pressure change at week 12.",
      terms: ["DCA-42", "adherence nudges", "week 12", "systolic blood pressure"],
    },
  ],
  "incident-runbook": [
    {
      type: "exact",
      question: "What exact conditions declare SEV-1 for checkout?",
      expected: "SEV-1 is declared for checkout success below 94 percent, payment authorization errors above 6 percent, or API Gateway 5xx above 2 percent.",
      terms: ["SEV-1", "94 percent", "payment authorization", "6 percent", "API Gateway", "5xx"],
    },
    {
      type: "relationship",
      question: "How are API Gateway, Cart Service, Redis cache, and Payment Service connected?",
      expected: "API Gateway calls Cart Service, Cart Service uses Redis Session Cache, and Payment Service connects to Fraud Scoring.",
      terms: ["API Gateway", "Cart Service", "Redis Session Cache", "Payment Service", "Fraud Scoring"],
    },
    {
      type: "routing",
      question: "When should Payment Service switch to rules-only mode?",
      expected: "Payment Service switches to rules-only mode when Fraud Scoring is unavailable after approval from Risk Operations.",
      terms: ["Payment Service", "rules-only mode", "Fraud Scoring", "Risk Operations"],
    },
    {
      type: "semantic",
      question: "Which recovery action fits a routing or request-signing deployment issue?",
      expected: "Rollback is preferred when the latest deployment changed routing, headers, or request signing.",
      terms: ["rollback", "routing", "headers", "request signing", "latest deployment"],
    },
  ],
  "support-kb": [
    {
      type: "exact",
      question: "What are the exact requirements in refund policy RFD-14?",
      expected: "RFD-14 allows a full refund within 14 days if fewer than 500 tickets were processed and no custom onboarding was delivered.",
      terms: ["RFD-14", "14 days", "500 tickets", "custom onboarding", "full refund"],
    },
    {
      type: "exact",
      question: "Which plan has audit exports and a named customer success manager?",
      expected: "Enterprise has audit exports and a named customer success manager.",
      terms: ["Enterprise", "audit exports", "named customer success manager"],
    },
    {
      type: "relationship",
      question: "How does a deletion request move through attachments, messages, and analytics?",
      expected: "A deletion request removes attachments first, then ticket messages, then analytics aggregates during the nightly privacy job.",
      terms: ["deletion request", "attachments", "ticket messages", "analytics aggregates", "privacy job"],
    },
    {
      type: "memory",
      question: "Based on my preference for strict retention, which plan should I inspect?",
      expected: "Strict retention should inspect Enterprise or Growth because they keep closed tickets for 30 months and Enterprise adds compliance controls.",
      terms: ["strict retention", "Enterprise", "Growth", "30 months", "audit exports"],
    },
  ],
};

const METHOD_ORDER = ["bm25", "vector", "hybrid", "memory", "graph"];

const defaultQuestions = [
  "Which RAG method is safest for a mixed query about Vercel and Supabase deployment?",
  "How does Hybrid RAG combine keyword and vector retrieval?",
  "Which method is best for exact terms like pgvector and BM25?",
  "What connects Vercel, Supabase, pgvector, and GraphRAG?",
  "Based on my preferences, which architecture should be selected?",
];

const state = {
  activeDemoSlug: "",
  benchmark: null,
  datasetId: "",
  demos: [],
  response: null,
  selectedMethod: "",
};

const $ = (id) => document.getElementById(id);

function configureRuntimeMode() {
  if (!API_BASE) return;
  ["memoryText", "addMemory"].forEach((id) => {
    const element = $(id);
    if (element) element.hidden = true;
  });
}

function setStatus(message) {
  $("status").textContent = message;
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Request failed: ${response.status}`);
  }
  return payload;
}

function setBusy(isBusy) {
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = isBusy;
  });
}

function renderDataset(dataset) {
  state.datasetId = dataset.id || "";
  state.activeDemoSlug = dataset.slug || state.activeDemoSlug;
  $("statChunks").textContent = dataset.chunks;
  $("statEntities").textContent = dataset.entities;
  $("statRelations").textContent = dataset.relations;
  $("statTokens").textContent = dataset.avg_chunk_tokens;
  $("datasetTitle").textContent = dataset.title;
  $("datasetSource").textContent = dataset.source;
  renderDemos();
  renderBenchmarkSetup();
}

function renderMemory(memories) {
  $("memoryCount").textContent = memories.length;
  $("memoryList").innerHTML = memories
    .slice(0, 3)
    .map((memory) => `<p>${escapeHtml(memory.text)}</p>`)
    .join("");
}

function activeDemo() {
  return state.demos.find((demo) => demo.slug === state.activeDemoSlug) || state.demos[0] || null;
}

function activeQuestions() {
  return activeDemo()?.questions?.length ? activeDemo().questions : defaultQuestions;
}

function activeBenchmark() {
  return activeDemo()?.benchmark?.length ? activeDemo().benchmark : [];
}

function withBenchmark(demo) {
  const fallback = hostedDemos.find((item) => item.slug === demo.slug) || {};
  return {
    ...fallback,
    ...demo,
    dataset: { ...(fallback.dataset || {}), ...(demo.dataset || {}) },
    questions: demo.questions?.length ? demo.questions : fallback.questions || defaultQuestions,
    benchmark: benchmarkRegistry[demo.slug] || fallback.benchmark || [],
  };
}

function renderDemos() {
  if (!$("demoList")) return;
  $("demoList").innerHTML = state.demos
    .map((demo) => {
      const active = demo.slug === state.activeDemoSlug ? " is-active" : "";
      return `<button type="button" class="demo-chip${active}" data-slug="${escapeHtml(demo.slug)}" title="${escapeHtml(demo.description)}">${escapeHtml(demo.title)}</button>`;
    })
    .join("");
  $("demoList").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => loadSample(button.dataset.slug));
  });
}

function renderBenchmarkSetup() {
  const qa = activeBenchmark();
  if (!$("benchmarkQuestions")) return;
  state.benchmark = null;
  $("benchmarkCount").textContent = qa.length;
  $("benchmarkStatus").textContent = `0/${qa.length}`;
  $("benchmarkBoard").classList.add("is-hidden");
  $("benchmarkBoard").innerHTML = "";
  $("benchmarkQuestions").innerHTML = qa
    .map(
      (item, index) => `
        <button type="button" data-question="${escapeHtml(item.question)}">
          <strong>Q${index + 1}</strong>
          <span>${escapeHtml(item.type)}</span>
          <small>${escapeHtml(item.question)}</small>
        </button>
      `
    )
    .join("");
  $("benchmarkQuestions").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      $("question").value = button.dataset.question;
      runQuery();
    });
  });
  renderPrepRail("ready");
}

function renderPrepRail(status) {
  if (!$("prepRail")) return;
  const labels = [
    ["bm25", "BM25"],
    ["vector", "Vector"],
    ["hybrid", "Hybrid"],
    ["memory", "Memory"],
    ["graph", "Graph"],
  ];
  $("prepRail").innerHTML = labels
    .map(([method, label]) => `<span class="prep-chip prep-chip--${status}"><i class="method-icon method-icon--${method}">${methodIcon(method)}</i>${label}</span>`)
    .join("");
}

function renderQuestionBank() {
  $("questionBank").innerHTML = activeQuestions()
    .map((question) => `<button type="button" data-question="${escapeHtml(question)}">${escapeHtml(question)}</button>`)
    .join("");
  $("questionBank").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      $("question").value = button.dataset.question;
      runQuery();
    });
  });
}

async function refreshDemos() {
  try {
    const data = await api("/api/demos");
    state.demos = (data.demos?.length ? data.demos : hostedDemos).map(withBenchmark);
  } catch {
    state.demos = hostedDemos.map(withBenchmark);
  }
  if (!state.activeDemoSlug && state.demos.length) {
    state.activeDemoSlug = state.demos[0].slug;
  }
  renderDemos();
  renderQuestionBank();
  renderBenchmarkSetup();
}

function renderResults(response) {
  state.response = response;
  state.selectedMethod = response.results[0]?.method || "";
  $("emptyState").classList.add("is-hidden");
  $("recommendationBand").classList.remove("is-hidden");
  $("resultLayout").classList.remove("is-hidden");
  $("recommendedLabel").textContent = response.recommended_label;
  $("recommendedReason").textContent = response.recommended_reason;
  $("queryType").textContent = response.query_type;
  renderMethodList();
  renderSelectedMethod();
  renderComparisonCards();
}

function renderMethodList() {
  const response = state.response;
  if (!response) return;
  $("methodColumn").innerHTML = response.results
    .map((result) => {
      const active = result.method === state.selectedMethod ? " is-active" : "";
      const icon = methodIcon(result.method);
      return `
        <button type="button" class="method-row${active}" data-method="${result.method}">
          <span class="method-icon method-icon--${result.method}">${icon}</span>
          <span><strong>${escapeHtml(result.label)}</strong><small>${result.latency_ms.toFixed(2)} ms</small></span>
          <span class="score-wrap"><span>${result.score.toFixed(1)}</span><i style="width:${Math.max(2, Math.min(100, result.score))}%"></i></span>
        </button>
      `;
    })
    .join("");
  $("methodColumn").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMethod = button.dataset.method;
      renderMethodList();
      renderSelectedMethod();
    });
  });
}

function renderComparisonCards() {
  const response = state.response;
  if (!response) return;
  $("comparisonStrip").classList.remove("is-hidden");
  const sorted = orderResults(response.results);
  $("comparisonCards").innerHTML = sorted
    .map(
      (result) => `
        <article class="comparison-card comparison-card--${result.method}">
          <div class="comparison-head">
            <span class="method-icon method-icon--${result.method}">${methodIcon(result.method)}</span>
            <div>
              <strong>${escapeHtml(result.label)}</strong>
              <small>${result.latency_ms.toFixed(2)} ms</small>
            </div>
          </div>
          <div class="metric-row">
            <span><b>${result.score.toFixed(1)}</b><small>Score</small></span>
            <span><b>${result.evidence.length}</b><small>Evidence</small></span>
            <span><b>${Math.round(result.diagnostics?.top_raw_score || 0)}</b><small>Raw</small></span>
          </div>
          <p>${escapeHtml(compactText(result.answer, 220))}</p>
        </article>
      `
    )
    .join("");
}

function renderSelectedMethod() {
  const response = state.response;
  if (!response) return;
  const selected = response.results.find((result) => result.method === state.selectedMethod) || response.results[0];
  if (!selected) return;

  $("methodDetail").innerHTML = `
    <div class="method-detail-head">
      <div>
        <span>${escapeHtml(selected.label)}</span>
        <h2>${selected.score.toFixed(1)} score</h2>
      </div>
      <div class="detail-icon">${methodIcon(selected.method)}</div>
    </div>
    <p class="answer">${escapeHtml(selected.answer)}</p>
    <div class="tag-columns">
      ${tagList("Strengths", selected.strengths, "good")}
      ${tagList("Limits", selected.limitations, "warn")}
    </div>
    <div class="evidence-list">
      ${selected.evidence.map(renderEvidence).join("") || "<p class='muted'>No evidence retrieved.</p>"}
    </div>
  `;
}

function renderEvidence(item) {
  return `
    <article class="evidence-item">
      <div><strong>Chunk ${item.position + 1}</strong><span>${escapeHtml(item.reason)}</span></div>
      <p>${escapeHtml(item.text)}</p>
      <div class="entity-row">
        ${item.entities.slice(0, 6).map((entity) => `<span>${escapeHtml(entity)}</span>`).join("")}
      </div>
    </article>
  `;
}

function orderResults(results) {
  return [...results].sort((left, right) => METHOD_ORDER.indexOf(left.method) - METHOD_ORDER.indexOf(right.method));
}

function tagList(title, items, tone) {
  return `
    <div class="tag-list tag-list--${tone}">
      <strong>${title}</strong>
      ${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}

function methodIcon(method) {
  return {
    bm25: "⌕",
    vector: "✦",
    hybrid: "▦",
    memory: "◎",
    graph: "◇",
  }[method] || "•";
}

async function refreshDataset() {
  const data = await api("/api/dataset");
  renderDataset(data.dataset);
}

async function refreshMemory() {
  const data = await api(`/api/memory/${SESSION_ID}`);
  renderMemory(data.memories);
}

async function runQuery() {
  setBusy(true);
  setStatus("Running retrieval engines");
  try {
    const data = await api("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: $("question").value, session_id: SESSION_ID, dataset_id: state.datasetId || undefined }),
    });
    renderDataset(data.dataset);
    renderResults(data);
    setStatus("Comparison ready");
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

async function runBenchmark() {
  const qa = activeBenchmark();
  if (!qa.length) return;
  setBusy(true);
  renderPrepRail("running");
  $("benchmarkBoard").classList.remove("is-hidden");
  $("benchmarkBoard").innerHTML = "<div class=\"benchmark-loading\">Preparing benchmark...</div>";
  try {
    const runs = [];
    for (let index = 0; index < qa.length; index += 1) {
      setStatus(`Benchmark ${index + 1}/${qa.length}`);
      $("benchmarkStatus").textContent = `${index + 1}/${qa.length}`;
      const response = await api("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: qa[index].question, session_id: SESSION_ID, dataset_id: state.datasetId || undefined }),
      });
      runs.push({ qa: qa[index], response });
    }
    const summary = summarizeBenchmark(runs);
    state.benchmark = summary;
    renderBenchmarkResults(summary);
    $("benchmarkStatus").textContent = `${qa.length}/${qa.length}`;
    setStatus("Benchmark ready");
  } catch (error) {
    $("benchmarkBoard").innerHTML = `<div class="benchmark-loading">${escapeHtml(error.message)}</div>`;
    setStatus(error.message);
  } finally {
    renderPrepRail("ready");
    setBusy(false);
  }
}

function summarizeBenchmark(runs) {
  const byMethod = new Map();
  for (const method of METHOD_ORDER) {
    byMethod.set(method, {
      method,
      label: "",
      scoreTotal: 0,
      latencyTotal: 0,
      coverageTotal: 0,
      evidenceTotal: 0,
      wins: 0,
      rankTotal: 0,
      samples: [],
    });
  }
  for (const run of runs) {
    orderResults(run.response.results).forEach((result) => {
      const bucket = byMethod.get(result.method);
      const coverage = termCoverage(result, run.qa);
      const rank = run.response.results.findIndex((item) => item.method === result.method) + 1;
      bucket.label = result.label;
      bucket.scoreTotal += result.score;
      bucket.latencyTotal += result.latency_ms;
      bucket.coverageTotal += coverage.percent;
      bucket.evidenceTotal += result.evidence.length;
      bucket.rankTotal += rank;
      bucket.wins += run.response.recommended_method === result.method ? 1 : 0;
      bucket.samples.push({
        question: run.qa.question,
        expected: run.qa.expected,
        answer: result.answer,
        coverage: coverage.percent,
        matched: coverage.matched,
      });
    });
  }
  const questionCount = Math.max(1, runs.length);
  return {
    questionCount,
    dataset: runs[0]?.response.dataset,
    methods: [...byMethod.values()].map((item) => {
      const evidenceQuality = Math.min(100, (item.evidenceTotal / questionCount / 4) * 100);
      const accuracy = item.coverageTotal / questionCount;
      const score = item.scoreTotal / questionCount;
      return {
        ...item,
        accuracy,
        avgScore: score,
        avgLatency: item.latencyTotal / questionCount,
        avgEvidence: item.evidenceTotal / questionCount,
        avgRank: item.rankTotal / questionCount,
        confidence: Math.round(accuracy * 0.55 + score * 0.35 + evidenceQuality * 0.1),
      };
    }),
    runs,
  };
}

function termCoverage(result, qa) {
  const haystack = normalizeForMatch([result.answer, ...result.evidence.map((item) => item.text)].join(" "));
  const matched = qa.terms.filter((term) => {
    const normalized = normalizeForMatch(term);
    if (haystack.includes(normalized)) return true;
    return normalized.split(" ").filter(Boolean).every((piece) => haystack.includes(piece));
  });
  return {
    matched,
    percent: qa.terms.length ? Math.round((matched.length / qa.terms.length) * 100) : 0,
  };
}

function renderBenchmarkResults(summary) {
  const best = [...summary.methods].sort((left, right) => right.confidence - left.confidence)[0];
  $("benchmarkBoard").classList.remove("is-hidden");
  $("benchmarkBoard").innerHTML = `
    <div class="benchmark-summary">
      <span><b>${summary.questionCount}</b><small>Gold QA</small></span>
      <span><b>${escapeHtml(best.label || best.method)}</b><small>Best method</small></span>
      <span><b>${best.confidence}%</b><small>Confidence</small></span>
    </div>
    <div class="benchmark-cards">
      ${summary.methods.map(renderBenchmarkCard).join("")}
    </div>
    <div class="qa-matrix">
      ${summary.runs.map(renderQaRow).join("")}
    </div>
  `;
}

function renderBenchmarkCard(method) {
  return `
    <article class="benchmark-card benchmark-card--${method.method}">
      <div class="benchmark-card-head">
        <span class="method-icon method-icon--${method.method}">${methodIcon(method.method)}</span>
        <div>
          <strong>${escapeHtml(method.label || method.method)}</strong>
          <small>${method.wins} wins / avg rank ${method.avgRank.toFixed(1)}</small>
        </div>
      </div>
      <div class="benchmark-score">
        <strong>${Math.round(method.confidence)}%</strong>
        <span>Benchmark</span>
      </div>
      <div class="bar-list">
        ${metricBar("Accuracy", method.accuracy)}
        ${metricBar("Score", method.avgScore)}
        ${metricBar("Evidence", Math.min(100, (method.avgEvidence / 4) * 100))}
      </div>
      <div class="benchmark-stats">
        <span><b>${method.avgLatency.toFixed(1)}</b><small>ms</small></span>
        <span><b>${method.avgEvidence.toFixed(1)}</b><small>evidence</small></span>
        <span><b>${Math.round(method.accuracy)}%</b><small>coverage</small></span>
      </div>
      <p>${escapeHtml(compactText(method.samples[0]?.answer || "", 180))}</p>
    </article>
  `;
}

function metricBar(label, value) {
  const width = Math.max(2, Math.min(100, value));
  return `<div><span>${label}</span><i><b style="width:${width}%"></b></i><em>${Math.round(value)}%</em></div>`;
}

function renderQaRow(run, index) {
  const best = run.response.results[0];
  return `
    <article class="qa-row">
      <div>
        <strong>Q${index + 1}</strong>
        <span>${escapeHtml(run.qa.type)}</span>
      </div>
      <p>${escapeHtml(run.qa.question)}</p>
      <small>${escapeHtml(run.qa.expected)}</small>
      <b>${escapeHtml(best.label)}</b>
    </article>
  `;
}

async function loadSample(slug = state.activeDemoSlug) {
  setBusy(true);
  setStatus("Loading demo dataset");
  try {
    const demo = state.demos.find((item) => item.slug === slug);
    if (API_BASE && demo?.dataset) {
      state.activeDemoSlug = demo.slug;
      renderDataset(demo.dataset);
      renderQuestionBank();
      renderBenchmarkSetup();
      const firstQuestion = activeQuestions()[0];
      if (firstQuestion) $("question").value = firstQuestion;
      resetResults();
      setStatus("Demo selected");
      return;
    }
    const data = await api("/api/dataset/sample", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    renderDataset(data.dataset);
    renderQuestionBank();
    renderBenchmarkSetup();
    const firstQuestion = activeQuestions()[0];
    if (firstQuestion) $("question").value = firstQuestion;
    resetResults();
    setStatus("Demo indexed");
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

function resetResults() {
  state.response = null;
  $("recommendationBand").classList.add("is-hidden");
  $("comparisonStrip").classList.add("is-hidden");
  $("resultLayout").classList.add("is-hidden");
  $("emptyState").classList.remove("is-hidden");
}

async function addMemory() {
  setBusy(true);
  setStatus("Saving memory");
  try {
    const data = await api("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: SESSION_ID, text: $("memoryText").value }),
    });
    renderMemory(data.memories);
    setStatus("Memory saved");
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeForMatch(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function compactText(value, limit) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length <= limit ? text : `${text.slice(0, limit - 1).trim()}...`;
}

document.addEventListener("DOMContentLoaded", async () => {
  configureRuntimeMode();
  renderQuestionBank();
  $("runQuery").addEventListener("click", runQuery);
  $("loadSample").addEventListener("click", () => loadSample());
  $("runBenchmark").addEventListener("click", runBenchmark);
  $("addMemory").addEventListener("click", addMemory);
  await refreshDemos();
  await refreshDataset();
  renderQuestionBank();
  await refreshMemory();
});
