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

const defaultQuestions = [
  "Which RAG method is safest for a mixed query about Vercel and Supabase deployment?",
  "How does Hybrid RAG combine keyword and vector retrieval?",
  "Which method is best for exact terms like pgvector and BM25?",
  "What connects Vercel, Supabase, pgvector, and GraphRAG?",
  "Based on my preferences, which architecture should be selected?",
];

const state = {
  activeDemoSlug: "",
  datasetId: "",
  demos: [],
  response: null,
  selectedMethod: "",
};

const $ = (id) => document.getElementById(id);

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
    state.demos = data.demos?.length ? data.demos : hostedDemos;
  } catch {
    state.demos = hostedDemos;
  }
  if (!state.activeDemoSlug && state.demos.length) {
    state.activeDemoSlug = state.demos[0].slug;
  }
  renderDemos();
  renderQuestionBank();
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

async function loadSample(slug = state.activeDemoSlug) {
  setBusy(true);
  setStatus("Loading demo dataset");
  try {
    const demo = state.demos.find((item) => item.slug === slug);
    if (API_BASE && demo?.dataset) {
      state.activeDemoSlug = demo.slug;
      renderDataset(demo.dataset);
      renderQuestionBank();
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
  $("resultLayout").classList.add("is-hidden");
  $("emptyState").classList.remove("is-hidden");
}

async function indexText(text, source = "browser text input") {
  setBusy(true);
  setStatus("Indexing dataset");
  try {
    const data = await api("/api/dataset/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: source, text }),
    });
    renderDataset(data.dataset);
    state.activeDemoSlug = "custom";
    renderDemos();
    setStatus("Dataset indexed");
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
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

document.addEventListener("DOMContentLoaded", async () => {
  renderQuestionBank();
  $("runQuery").addEventListener("click", runQuery);
  $("loadSample").addEventListener("click", () => loadSample());
  $("indexText").addEventListener("click", () => indexText($("datasetText").value, "Custom Browser Dataset"));
  $("uploadButton").addEventListener("click", () => $("fileInput").click());
  $("fileInput").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await indexText(text, file.name);
    event.target.value = "";
  });
  $("addMemory").addEventListener("click", addMemory);
  await refreshDemos();
  await refreshDataset();
  renderQuestionBank();
  await refreshMemory();
});
