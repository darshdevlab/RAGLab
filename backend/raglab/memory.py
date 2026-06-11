from __future__ import annotations

import sqlite3
import time
from dataclasses import dataclass
from pathlib import Path

from .text import cosine_similarity, tokenize


@dataclass(frozen=True)
class MemoryItem:
    id: int
    session_id: str
    text: str
    created_at: str
    score: float = 0.0


class MemoryStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS memories (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  session_id TEXT NOT NULL,
                  text TEXT NOT NULL,
                  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS query_history (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  session_id TEXT NOT NULL,
                  question TEXT NOT NULL,
                  recommended_method TEXT NOT NULL,
                  score REAL NOT NULL,
                  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )

    def seed_demo_memory(self, session_id: str = "demo") -> None:
        if self.list_memories(session_id):
            return
        self.add_memory(session_id, "Prefer RAG methods that show citations, low hallucination risk, and readable evidence.")
        self.add_memory(session_id, "For portfolio demos, favor methods that work online without expensive managed infrastructure.")

    def add_memory(self, session_id: str, text: str) -> MemoryItem:
        clean = " ".join(text.split())
        with self._connect() as conn:
            cursor = conn.execute(
                "INSERT INTO memories(session_id, text) VALUES (?, ?)",
                (session_id, clean),
            )
            row = conn.execute("SELECT * FROM memories WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return self._row_to_item(row)

    def list_memories(self, session_id: str) -> list[MemoryItem]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM memories WHERE session_id = ? ORDER BY id DESC",
                (session_id,),
            ).fetchall()
        return [self._row_to_item(row) for row in rows]

    def search(self, session_id: str, question: str, limit: int = 3) -> tuple[list[MemoryItem], float]:
        start = time.perf_counter()
        query_vector = self._vector(tokenize(question))
        scored: list[MemoryItem] = []
        for item in self.list_memories(session_id):
            score = cosine_similarity(query_vector, self._vector(tokenize(item.text)))
            if score > 0:
                scored.append(MemoryItem(id=item.id, session_id=item.session_id, text=item.text, created_at=item.created_at, score=score))
        scored.sort(key=lambda item: item.score, reverse=True)
        return scored[:limit], (time.perf_counter() - start) * 1000

    def record_query(self, session_id: str, question: str, recommended_method: str, score: float) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO query_history(session_id, question, recommended_method, score) VALUES (?, ?, ?, ?)",
                (session_id, question, recommended_method, score),
            )

    def _vector(self, tokens: list[str]) -> dict[str, float]:
        total = max(1, len(tokens))
        vector: dict[str, float] = {}
        for token in tokens:
            vector[token] = vector.get(token, 0.0) + (1.0 / total)
        return vector

    def _row_to_item(self, row: sqlite3.Row) -> MemoryItem:
        return MemoryItem(id=int(row["id"]), session_id=row["session_id"], text=row["text"], created_at=row["created_at"])

