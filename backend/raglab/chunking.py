from __future__ import annotations

import hashlib
from dataclasses import dataclass

from .text import extract_entities, split_sentences, tokenize


@dataclass(frozen=True)
class DocumentChunk:
    id: str
    document_id: str
    source: str
    title: str
    text: str
    position: int
    tokens: list[str]
    entities: list[str]


def stable_id(*parts: object) -> str:
    raw = "::".join(str(part) for part in parts)
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16]


def chunk_document(
    document_id: str,
    title: str,
    source: str,
    text: str,
    max_tokens: int = 120,
    overlap_sentences: int = 1,
) -> list[DocumentChunk]:
    sentences = split_sentences(text)
    chunks: list[DocumentChunk] = []
    current: list[str] = []
    current_tokens = 0

    def flush() -> None:
        nonlocal current, current_tokens
        if not current:
            return
        chunk_text = " ".join(current).strip()
        tokens = tokenize(chunk_text)
        if tokens:
            position = len(chunks)
            chunks.append(
                DocumentChunk(
                    id=stable_id(document_id, position, chunk_text[:80]),
                    document_id=document_id,
                    source=source,
                    title=title,
                    text=chunk_text,
                    position=position,
                    tokens=tokens,
                    entities=extract_entities(chunk_text),
                )
            )
        current = current[-overlap_sentences:] if overlap_sentences else []
        current_tokens = sum(len(tokenize(sentence)) for sentence in current)

    for sentence in sentences:
        sentence_tokens = tokenize(sentence)
        if current and current_tokens + len(sentence_tokens) > max_tokens:
            flush()
        current.append(sentence)
        current_tokens += len(sentence_tokens)

    flush()
    return chunks


def chunk_plain_text(title: str, source: str, text: str) -> list[DocumentChunk]:
    document_id = stable_id(title, source, text[:120])
    return chunk_document(document_id=document_id, title=title, source=source, text=text)

