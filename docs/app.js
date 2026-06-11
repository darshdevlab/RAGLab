const SESSION_ID = "demo";
const HOSTED_API_BASE = "https://peluzzqoihjvkdtedsiz.supabase.co/functions/v1/raglab";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const API_BASE = LOCAL_HOSTS.has(window.location.hostname) ? "" : HOSTED_API_BASE;

const questions = [
  "Which RAG method is safest for a mixed query about Vercel and Supabase deployment?",
  "How does Hybrid RAG combine keyword and vector retrieval?",
  "Which method is best for exact terms like pgvector and BM25?",
  "What connects Vercel, Supabase, pgvector, and GraphRAG?",
  "Based on my preferences, which architecture should be selected?",
];

const state = {
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
  $("statChunks").textContent = dataset.chunks;
  $("statEntities").textContent = dataset.entities;
  $("statRelations").textContent = dataset.relations;
  $("statTokens").textContent = dataset.avg_chunk_tokens;
  $("datasetTitle").textContent = dataset.title;
  $("datasetSource").textContent = dataset.source;
}

function renderMemory(memories) {
  $("memoryCount").textContent = memories.length;
  $("memoryList").innerHTML = memories
    .slice(0, 3)
    .map((memory) => `<p>${escapeHtml(memory.text)}</p>`)
    .join("");
}

function renderQuestionBank() {
  $("questionBank").innerHTML = questions
    .map((question) => `<button type="button" data-question="${escapeHtml(question)}">${escapeHtml(question)}</button>`)
    .join("");
  $("questionBank").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      $("question").value = button.dataset.question;
      runQuery();
    });
  });
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
      body: JSON.stringify({ question: $("question").value, session_id: SESSION_ID }),
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

async function loadSample() {
  setBusy(true);
  setStatus("Loading sample dataset");
  try {
    const data = await api("/api/dataset/sample", { method: "POST" });
    renderDataset(data.dataset);
    state.response = null;
    $("recommendationBand").classList.add("is-hidden");
    $("resultLayout").classList.add("is-hidden");
    $("emptyState").classList.remove("is-hidden");
    setStatus("Sample indexed");
  } catch (error) {
    setStatus(error.message);
  } finally {
    setBusy(false);
  }
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
  $("loadSample").addEventListener("click", loadSample);
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
  await refreshDataset();
  await refreshMemory();
});
