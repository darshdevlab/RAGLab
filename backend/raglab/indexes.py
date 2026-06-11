from __future__ import annotations

import math
import time
from collections import Counter, defaultdict
from dataclasses import dataclass

from .chunking import DocumentChunk
from .text import cosine_similarity, normalize_scores, relation_pairs, term_frequencies, tokenize


@dataclass(frozen=True)
class RetrievalHit:
    chunk: DocumentChunk
    score: float
    reason: str


class VectorIndex:
    def __init__(self, chunks: list[DocumentChunk]) -> None:
        self.chunks = chunks
        self.doc_freq: Counter[str] = Counter()
        for chunk in chunks:
            self.doc_freq.update(set(chunk.tokens))
        self.total_docs = max(1, len(chunks))
        self.vectors = {chunk.id: self._vectorize(chunk.tokens) for chunk in chunks}

    def _idf(self, term: str) -> float:
        return math.log((1 + self.total_docs) / (1 + self.doc_freq.get(term, 0))) + 1.0

    def _vectorize(self, tokens: list[str]) -> dict[str, float]:
        counts = term_frequencies(tokens)
        if not counts:
            return {}
        max_tf = max(counts.values()) or 1
        return {term: (0.5 + 0.5 * (count / max_tf)) * self._idf(term) for term, count in counts.items()}

    def search(self, question: str, limit: int = 5) -> tuple[list[RetrievalHit], float]:
        start = time.perf_counter()
        query_vector = self._vectorize(tokenize(question))
        hits = [
            RetrievalHit(chunk=chunk, score=cosine_similarity(query_vector, self.vectors[chunk.id]), reason="semantic TF-IDF cosine match")
            for chunk in self.chunks
        ]
        hits = [hit for hit in hits if hit.score > 0]
        hits.sort(key=lambda hit: hit.score, reverse=True)
        return hits[:limit], (time.perf_counter() - start) * 1000

    def raw_scores(self, question: str) -> dict[str, float]:
        query_vector = self._vectorize(tokenize(question))
        return {chunk.id: cosine_similarity(query_vector, self.vectors[chunk.id]) for chunk in self.chunks}


class BM25Index:
    def __init__(self, chunks: list[DocumentChunk], k1: float = 1.5, b: float = 0.75) -> None:
        self.chunks = chunks
        self.k1 = k1
        self.b = b
        self.doc_freq: Counter[str] = Counter()
        self.term_counts = {chunk.id: term_frequencies(chunk.tokens) for chunk in chunks}
        self.doc_lengths = {chunk.id: len(chunk.tokens) for chunk in chunks}
        self.avg_doc_length = sum(self.doc_lengths.values()) / max(1, len(chunks))
        for chunk in chunks:
            self.doc_freq.update(set(chunk.tokens))
        self.total_docs = max(1, len(chunks))

    def _idf(self, term: str) -> float:
        df = self.doc_freq.get(term, 0)
        return math.log(1 + ((self.total_docs - df + 0.5) / (df + 0.5)))

    def _score_chunk(self, chunk: DocumentChunk, query_terms: list[str]) -> float:
        counts = self.term_counts[chunk.id]
        doc_length = self.doc_lengths[chunk.id] or 1
        score = 0.0
        for term in query_terms:
            tf = counts.get(term, 0)
            if tf <= 0:
                continue
            denominator = tf + self.k1 * (1 - self.b + self.b * (doc_length / self.avg_doc_length))
            score += self._idf(term) * ((tf * (self.k1 + 1)) / denominator)
        return score

    def search(self, question: str, limit: int = 5) -> tuple[list[RetrievalHit], float]:
        start = time.perf_counter()
        query_terms = tokenize(question)
        hits = [
            RetrievalHit(chunk=chunk, score=self._score_chunk(chunk, query_terms), reason="BM25 lexical term match")
            for chunk in self.chunks
        ]
        hits = [hit for hit in hits if hit.score > 0]
        hits.sort(key=lambda hit: hit.score, reverse=True)
        return hits[:limit], (time.perf_counter() - start) * 1000

    def raw_scores(self, question: str) -> dict[str, float]:
        query_terms = tokenize(question)
        return {chunk.id: self._score_chunk(chunk, query_terms) for chunk in self.chunks}


class HybridIndex:
    def __init__(self, chunks: list[DocumentChunk], bm25: BM25Index, vector: VectorIndex) -> None:
        self.chunks = chunks
        self.bm25 = bm25
        self.vector = vector

    def search(self, question: str, limit: int = 5) -> tuple[list[RetrievalHit], float]:
        start = time.perf_counter()
        bm25_scores = normalize_scores(self.bm25.raw_scores(question))
        vector_scores = normalize_scores(self.vector.raw_scores(question))
        hits: list[RetrievalHit] = []
        for chunk in self.chunks:
            score = (0.52 * bm25_scores.get(chunk.id, 0.0)) + (0.48 * vector_scores.get(chunk.id, 0.0))
            if score > 0:
                hits.append(
                    RetrievalHit(
                        chunk=chunk,
                        score=score,
                        reason=f"hybrid score: BM25 {bm25_scores.get(chunk.id, 0.0):.2f} + vector {vector_scores.get(chunk.id, 0.0):.2f}",
                    )
                )
        hits.sort(key=lambda hit: hit.score, reverse=True)
        return hits[:limit], (time.perf_counter() - start) * 1000


class GraphIndex:
    def __init__(self, chunks: list[DocumentChunk]) -> None:
        self.chunks = chunks
        self.entity_to_chunks: dict[str, set[str]] = defaultdict(set)
        self.edges: Counter[tuple[str, str]] = Counter()
        self.chunk_by_id = {chunk.id: chunk for chunk in chunks}

        for chunk in chunks:
            normalized_entities = [" ".join(entity.lower().split()) for entity in chunk.entities]
            for entity in normalized_entities:
                self.entity_to_chunks[entity].add(chunk.id)
            for pair in relation_pairs(normalized_entities):
                self.edges[pair] += 1

    def _neighbors(self, entity: str) -> set[str]:
        neighbors: set[str] = set()
        for left, right in self.edges:
            if left == entity:
                neighbors.add(right)
            elif right == entity:
                neighbors.add(left)
        return neighbors

    def search(self, question: str, limit: int = 5) -> tuple[list[RetrievalHit], float]:
        start = time.perf_counter()
        query_entities = [" ".join(entity.lower().split()) for entity in tokenize(question)]
        query_entities.extend(entity for entity in self.entity_to_chunks if entity in question.lower())

        scores: Counter[str] = Counter()
        reasons: dict[str, list[str]] = defaultdict(list)
        for entity in sorted(set(query_entities)):
            direct_chunks = self.entity_to_chunks.get(entity, set())
            for chunk_id in direct_chunks:
                scores[chunk_id] += 1.0
                reasons[chunk_id].append(f"direct entity `{entity}`")
            for neighbor in self._neighbors(entity):
                for chunk_id in self.entity_to_chunks.get(neighbor, set()):
                    scores[chunk_id] += 0.35
                    reasons[chunk_id].append(f"neighbor `{neighbor}` from `{entity}`")

        hits = [
            RetrievalHit(
                chunk=self.chunk_by_id[chunk_id],
                score=float(score),
                reason=", ".join(reasons[chunk_id][:3]) or "entity graph traversal",
            )
            for chunk_id, score in scores.items()
            if score > 0
        ]
        hits.sort(key=lambda hit: hit.score, reverse=True)
        return hits[:limit], (time.perf_counter() - start) * 1000

    def stats(self) -> dict[str, int]:
        return {"entities": len(self.entity_to_chunks), "relations": len(self.edges)}

