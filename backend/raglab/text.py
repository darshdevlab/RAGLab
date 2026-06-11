from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass
from itertools import combinations


STOPWORDS = {
    "a",
    "about",
    "above",
    "after",
    "again",
    "against",
    "all",
    "am",
    "an",
    "and",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "below",
    "between",
    "both",
    "but",
    "by",
    "can",
    "did",
    "do",
    "does",
    "doing",
    "down",
    "during",
    "each",
    "few",
    "for",
    "from",
    "further",
    "had",
    "has",
    "have",
    "having",
    "he",
    "her",
    "here",
    "hers",
    "herself",
    "him",
    "himself",
    "his",
    "how",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "itself",
    "just",
    "me",
    "more",
    "most",
    "my",
    "myself",
    "no",
    "nor",
    "not",
    "now",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "our",
    "ours",
    "ourselves",
    "out",
    "over",
    "own",
    "same",
    "she",
    "should",
    "so",
    "some",
    "such",
    "than",
    "that",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "whom",
    "why",
    "will",
    "with",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
}


ENTITY_STOPWORDS = {
    "A",
    "An",
    "And",
    "As",
    "For",
    "If",
    "In",
    "It",
    "Of",
    "On",
    "Or",
    "The",
    "This",
    "To",
    "When",
    "Where",
    "Which",
    "Why",
}


TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9_\-]{1,}")
SENTENCE_RE = re.compile(r"(?<=[.!?])\s+|\n{2,}")
ENTITY_RE = re.compile(r"\b(?:[A-Z][a-zA-Z0-9]*(?:[- ][A-Z]?[a-zA-Z0-9]+){0,3}|[A-Z]{2,}(?:[- ][A-Z0-9]+)*)\b")


@dataclass(frozen=True)
class WeightedText:
    text: str
    weight: float


def tokenize(text: str, keep_stopwords: bool = False) -> list[str]:
    tokens = [match.group(0).lower() for match in TOKEN_RE.finditer(text)]
    if keep_stopwords:
        return tokens
    return [token for token in tokens if token not in STOPWORDS and len(token) > 1]


def split_sentences(text: str) -> list[str]:
    candidates = [item.strip() for item in SENTENCE_RE.split(text.replace("\r\n", "\n"))]
    return [item for item in candidates if item]


def term_frequencies(tokens: list[str]) -> Counter[str]:
    return Counter(tokens)


def cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0.0
    if len(left) > len(right):
        left, right = right, left
    dot = sum(value * right.get(term, 0.0) for term, value in left.items())
    if dot <= 0:
        return 0.0
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)


def normalize_scores(raw: dict[str, float]) -> dict[str, float]:
    if not raw:
        return {}
    max_score = max(raw.values()) or 1.0
    return {key: value / max_score for key, value in raw.items()}


def extract_entities(text: str, fallback_terms: int = 6) -> list[str]:
    seen: set[str] = set()
    entities: list[str] = []

    for match in ENTITY_RE.finditer(text):
        candidate = " ".join(match.group(0).replace("-", " ").split())
        if len(candidate) < 3 or candidate in ENTITY_STOPWORDS:
            continue
        normalized = candidate.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        entities.append(candidate)

    if len(entities) >= fallback_terms:
        return entities

    counts = term_frequencies(tokenize(text))
    for term, _ in counts.most_common(fallback_terms * 2):
        if term in seen or len(term) < 4:
            continue
        seen.add(term)
        entities.append(term)
        if len(entities) >= fallback_terms:
            break

    return entities


def relation_pairs(entities: list[str]) -> list[tuple[str, str]]:
    normalized = sorted({" ".join(entity.lower().split()) for entity in entities if entity.strip()})
    return list(combinations(normalized, 2))


def best_sentences(question: str, text: str, limit: int = 2) -> list[str]:
    query_terms = set(tokenize(question))
    sentences = split_sentences(text)
    ranked: list[WeightedText] = []
    for sentence in sentences:
        sentence_terms = set(tokenize(sentence))
        overlap = len(query_terms & sentence_terms)
        score = overlap + (0.1 * len(sentence_terms & query_terms))
        if score > 0:
            ranked.append(WeightedText(sentence, score))

    if not ranked:
        ranked = [WeightedText(sentence, 0.1) for sentence in sentences[:limit]]

    ranked.sort(key=lambda item: item.weight, reverse=True)
    return [item.text for item in ranked[:limit]]


def compact_text(text: str, max_chars: int = 260) -> str:
    clean = " ".join(text.split())
    if len(clean) <= max_chars:
        return clean
    return clean[: max_chars - 1].rstrip() + "..."

