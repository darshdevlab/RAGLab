from __future__ import annotations

import statistics
import time
from dataclasses import asdict, dataclass
from pathlib import Path

from .chunking import DocumentChunk, chunk_plain_text
from .indexes import BM25Index, GraphIndex, HybridIndex, RetrievalHit, VectorIndex
from .memory import MemoryItem, MemoryStore
from .text import best_sentences, compact_text, tokenize


@dataclass(frozen=True)
class Evidence:
    chunk_id: str
    source: str
    title: str
    position: int
    text: str
    score: float
    reason: str
    entities: list[str]


@dataclass(frozen=True)
class MethodResult:
    method: str
    label: str
    answer: str
    score: float
    latency_ms: float
    strengths: list[str]
    limitations: list[str]
    evidence: list[Evidence]
    diagnostics: dict[str, object]


@dataclass(frozen=True)
class DatasetStats:
    title: str
    source: str
    documents: int
    chunks: int
    entities: int
    relations: int
    avg_chunk_tokens: float


class RagLabEngine:
    def __init__(self, artifact_dir: Path, sample_path: Path) -> None:
        self.artifact_dir = artifact_dir
        self.sample_path = sample_path
        self.memory = MemoryStore(artifact_dir / "raglab.sqlite")
        self.memory.seed_demo_memory("demo")
        self.title = "RAGLab Demo Dataset"
        self.source = str(sample_path.name)
        self.chunks: list[DocumentChunk] = []
        self.vector: VectorIndex | None = None
        self.bm25: BM25Index | None = None
        self.hybrid: HybridIndex | None = None
        self.graph: GraphIndex | None = None
        self.load_sample()

    def load_sample(self) -> DatasetStats:
        text = self.sample_path.read_text(encoding="utf-8")
        return self.index_text(title="RAGLab Demo Dataset", source=self.sample_path.name, text=text)

    def index_text(self, title: str, source: str, text: str) -> DatasetStats:
        clean = text.strip()
        if len(clean) < 80:
            raise ValueError("Dataset text is too short. Add at least a few paragraphs so retrieval can be compared.")

        self.title = title.strip() or "Untitled Dataset"
        self.source = source.strip() or "text input"
        self.chunks = chunk_plain_text(title=self.title, source=self.source, text=clean)
        self.vector = VectorIndex(self.chunks)
        self.bm25 = BM25Index(self.chunks)
        self.hybrid = HybridIndex(self.chunks, self.bm25, self.vector)
        self.graph = GraphIndex(self.chunks)
        return self.stats()

    def stats(self) -> DatasetStats:
        graph_stats = self.graph.stats() if self.graph else {"entities": 0, "relations": 0}
        token_counts = [len(chunk.tokens) for chunk in self.chunks]
        avg_chunk_tokens = statistics.mean(token_counts) if token_counts else 0.0
        return DatasetStats(
            title=self.title,
            source=self.source,
            documents=1,
            chunks=len(self.chunks),
            entities=graph_stats["entities"],
            relations=graph_stats["relations"],
            avg_chunk_tokens=round(avg_chunk_tokens, 1),
        )

    def compare(self, question: str, session_id: str = "demo", limit: int = 4) -> dict[str, object]:
        if not self.vector or not self.bm25 or not self.hybrid or not self.graph:
            raise RuntimeError("No dataset has been indexed yet.")

        question = question.strip()
        if not question:
            raise ValueError("Question is required.")

        memory_hits, memory_latency = self.memory.search(session_id=session_id, question=question)
        methods = [
            self._run_method("bm25", "BM25 / Keyword RAG", self.bm25.search(question, limit=limit), question),
            self._run_method("vector", "Vector RAG", self.vector.search(question, limit=limit), question),
            self._run_method("hybrid", "Hybrid RAG", self.hybrid.search(question, limit=limit), question),
            self._run_memory_method(question, memory_hits, memory_latency, limit),
            self._run_method("graph", "GraphRAG", self.graph.search(question, limit=limit), question),
        ]
        methods.sort(key=lambda result: result.score, reverse=True)
        recommended = methods[0]
        self.memory.record_query(session_id=session_id, question=question, recommended_method=recommended.method, score=recommended.score)

        return {
            "question": question,
            "session_id": session_id,
            "query_type": self._classify_query(question),
            "dataset": asdict(self.stats()),
            "recommended_method": recommended.method,
            "recommended_label": recommended.label,
            "recommended_reason": self._recommendation_reason(recommended),
            "memory_used": [asdict(item) for item in memory_hits],
            "results": [asdict(result) for result in methods],
        }

    def add_memory(self, session_id: str, text: str) -> MemoryItem:
        return self.memory.add_memory(session_id=session_id, text=text)

    def list_memories(self, session_id: str) -> list[MemoryItem]:
        return self.memory.list_memories(session_id=session_id)

    def _run_method(
        self,
        method: str,
        label: str,
        search_result: tuple[list[RetrievalHit], float],
        question: str,
    ) -> MethodResult:
        hits, latency = search_result
        evidence = [self._to_evidence(hit) for hit in hits]
        score = self._score_method(method, question, hits, latency)
        return MethodResult(
            method=method,
            label=label,
            answer=self._answer(question, hits),
            score=score,
            latency_ms=round(latency, 2),
            strengths=self._strengths(method),
            limitations=self._limitations(method),
            evidence=evidence,
            diagnostics={
                "retrieved_chunks": len(hits),
                "top_raw_score": round(hits[0].score, 4) if hits else 0,
                "score_basis": "relevance + support + method fit - latency penalty",
            },
        )

    def _run_memory_method(self, question: str, memory_hits: list[MemoryItem], memory_latency: float, limit: int) -> MethodResult:
        start = time.perf_counter()
        memory_text = " ".join(item.text for item in memory_hits)
        expanded_question = f"{question} {memory_text}".strip()
        hits, vector_latency = self.vector.search(expanded_question, limit=limit) if self.vector else ([], 0.0)
        latency = memory_latency + vector_latency + ((time.perf_counter() - start) * 1000)
        score = self._score_method("memory", question, hits, latency)
        if memory_hits:
            score = min(100.0, score + min(8.0, len(memory_hits) * 3.0))

        diagnostics = {
            "retrieved_chunks": len(hits),
            "memory_hits": len(memory_hits),
            "memory_latency_ms": round(memory_latency, 2),
            "top_memory": compact_text(memory_hits[0].text, 140) if memory_hits else "",
        }
        return MethodResult(
            method="memory",
            label="Memory RAG",
            answer=self._answer(question, hits, prefix=self._memory_prefix(memory_hits)),
            score=round(score, 1),
            latency_ms=round(latency, 2),
            strengths=self._strengths("memory"),
            limitations=self._limitations("memory"),
            evidence=[self._to_evidence(hit) for hit in hits],
            diagnostics=diagnostics,
        )

    def _to_evidence(self, hit: RetrievalHit) -> Evidence:
        return Evidence(
            chunk_id=hit.chunk.id,
            source=hit.chunk.source,
            title=hit.chunk.title,
            position=hit.chunk.position,
            text=compact_text(hit.chunk.text, 520),
            score=round(hit.score, 4),
            reason=hit.reason,
            entities=hit.chunk.entities[:8],
        )

    def _answer(self, question: str, hits: list[RetrievalHit], prefix: str = "") -> str:
        if not hits:
            base = "No strong evidence was retrieved. Try a more specific question or index a richer dataset."
            return f"{prefix} {base}".strip()
        sentences: list[str] = []
        for hit in hits[:2]:
            sentences.extend(best_sentences(question, hit.chunk.text, limit=1))
        answer = " ".join(sentences[:3])
        if not answer:
            answer = compact_text(hits[0].chunk.text, 240)
        return f"{prefix} {answer}".strip()

    def _memory_prefix(self, memory_hits: list[MemoryItem]) -> str:
        if not memory_hits:
            return "No relevant session memory was found."
        return f"Session memory used: {compact_text(memory_hits[0].text, 120)}"

    def _score_method(self, method: str, question: str, hits: list[RetrievalHit], latency_ms: float) -> float:
        if not hits:
            return 0.0
        top_score = hits[0].score
        avg_score = sum(hit.score for hit in hits) / len(hits)
        support = min(1.0, len(hits) / 4)
        fit = self._method_fit(method, question)
        relevance = min(1.0, (top_score * 0.75) + (avg_score * 0.25))
        latency_penalty = min(0.14, latency_ms / 1400)
        final = ((0.58 * relevance) + (0.24 * support) + (0.18 * fit) - latency_penalty) * 100
        return round(max(0.0, min(100.0, final)), 1)

    def _method_fit(self, method: str, question: str) -> float:
        query_type = self._classify_query(question)
        fits = {
            "exact": {"bm25": 1.0, "hybrid": 0.9, "vector": 0.55, "memory": 0.45, "graph": 0.5},
            "semantic": {"vector": 1.0, "hybrid": 0.9, "graph": 0.65, "memory": 0.6, "bm25": 0.45},
            "relationship": {"graph": 1.0, "hybrid": 0.8, "vector": 0.65, "bm25": 0.5, "memory": 0.55},
            "memory": {"memory": 1.0, "hybrid": 0.7, "vector": 0.6, "graph": 0.5, "bm25": 0.45},
            "mixed": {"hybrid": 1.0, "vector": 0.75, "bm25": 0.72, "graph": 0.65, "memory": 0.6},
        }
        return fits.get(query_type, fits["mixed"]).get(method, 0.5)

    def _classify_query(self, question: str) -> str:
        q = question.lower()
        if any(term in q for term in ["remember", "previous", "prefer", "session", "my requirement"]):
            return "memory"
        if any(term in q for term in ["connect", "relationship", "related", "between", "links", "depends", "influence"]):
            return "relationship"
        if any(term in q for term in ["exact", "term", "keyword", "named", "id", "quote"]):
            return "exact"
        if any(term in q for term in ["why", "how", "explain", "meaning", "similar", "concept"]):
            return "semantic"
        return "mixed"

    def _recommendation_reason(self, result: MethodResult) -> str:
        if result.method == "hybrid":
            return "Hybrid won because it balances keyword precision with semantic recall on this query."
        if result.method == "vector":
            return "Vector RAG won because semantic similarity produced the strongest evidence set."
        if result.method == "bm25":
            return "BM25 won because exact terms in the query matched the dataset strongly."
        if result.method == "memory":
            return "Memory RAG won because session preferences changed the retrieval context."
        return "GraphRAG won because entity and relationship traversal found the strongest support."

    def _strengths(self, method: str) -> list[str]:
        return {
            "bm25": ["Strong for exact terms", "Fast and explainable", "No embedding model required"],
            "vector": ["Finds semantic matches", "Good when wording differs", "Works well for concept questions"],
            "hybrid": ["Balances exact and semantic retrieval", "Usually robust for mixed queries", "Good default strategy"],
            "memory": ["Uses session preferences", "Improves multi-turn continuity", "Can personalize ranking"],
            "graph": ["Finds entity relationships", "Useful for connected facts", "Good for dependency questions"],
        }[method]

    def _limitations(self, method: str) -> list[str]:
        return {
            "bm25": ["Misses paraphrases", "Sensitive to vocabulary mismatch"],
            "vector": ["Can retrieve plausible but less exact chunks", "Needs embeddings in production"],
            "hybrid": ["Requires score calibration", "More moving parts than one retriever"],
            "memory": ["Only helps when useful memories exist", "Needs user controls in production"],
            "graph": ["Entity extraction is simple in V1", "Complex graph reasoning may need Neo4j later"],
        }[method]

