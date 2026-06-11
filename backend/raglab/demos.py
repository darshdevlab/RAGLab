from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class DemoDataset:
    slug: str
    title: str
    source: str
    description: str
    questions: list[str]
    text: str

    def metadata(self) -> dict[str, object]:
        payload = asdict(self)
        payload.pop("text")
        return payload


RAGLAB_TEXT = """# RAGLab Demo Dataset

RAGLab is a product prototype for comparing retrieval augmented generation strategies on the same dataset. The platform helps a visitor choose prepared demo corpora, ask natural language questions, inspect retrieved evidence, and see which RAG strategy works best for that dataset and query type.

Vector RAG uses hosted pgvector similarity search to find chunks with similar meaning signals. In this hosted prototype the embedding is a deterministic hashed token vector so the app works without a paid model API. Later it can be swapped for an open-source embedding endpoint. Vector RAG is useful for concept questions, but it can fail when the query requires an exact term, identifier, or quoted phrase.

BM25 and keyword RAG use Postgres full-text search. BM25 is strong when the user searches for exact terms such as pgvector, Supabase, GraphRAG, latency, citations, or a named product. BM25 is fast, explainable, and cheap. It can miss paraphrases when the document uses different wording from the question.

Hybrid RAG combines keyword scores with vector similarity scores. Hybrid RAG is often the safest default because it keeps exact-term precision while recovering semantic matches. A good hybrid system normalizes BM25 and vector scores before combining them. It should show score components so the user can understand why a chunk was selected.

Memory RAG adds session context. It stores user preferences, prior questions, accepted facts, and rejected facts. Memory RAG is useful when the user says things like remember that I prefer low cost deployment and later asks which architecture should be selected. Memory must include approve, delete, and inspect controls because uncontrolled memory can make retrieval biased or stale.

GraphRAG builds an entity and relationship layer over the document collection. Entities can include RAGLab, Supabase, pgvector, Vercel, BM25, Hybrid RAG, Memory RAG, GraphRAG, and citations. Relationships connect methods to strengths, limitations, storage choices, and deployment decisions. GraphRAG is useful for questions about how concepts connect, which methods depend on embeddings, or which architecture links Vercel with Supabase.

For the online version, Vercel can host the interactive frontend, but this live prototype is served from a Supabase Edge Function. Supabase stores documents, chunks, metadata, vector embeddings through pgvector, keyword search indexes, memory rows, entities, and relations. This means the first online version does not need separate Pinecone, Qdrant, Weaviate, or Neo4j deployments. Those adapters can be added later if the product becomes a database benchmark.

RAGLab should not pretend every RAG method is correct. The dashboard should show retrieved chunks, citations, latency, method strengths, method limitations, and a recommendation score. A recommendation is only trustworthy when evidence is visible. The strongest portfolio version is a full working end-to-end prototype: data ingestion, chunking, indexing, query execution, retrieval comparison, scoring, ranking, and interactive UI."""


CLINICAL_TEXT = """# CardioMap Trial Protocol

CardioMap is a synthetic clinical trial protocol for a remote blood pressure monitoring study. The protocol compares usual care with a digital coaching arm called DCA-42. Participants wear the PulseBand PB-7 cuff, answer symptom surveys, and receive medication adherence nudges. The primary endpoint is change in systolic blood pressure at week 12.

Eligibility requires adults aged 35 to 75 with two clinic systolic readings above 140 mmHg or one home seven-day average above 135 mmHg. Exclusion criteria include pregnancy, dialysis, active myocarditis, recent stroke within 90 days, and current use of investigational drug INV-908. Patients with atrial fibrillation may enroll only if their resting heart rate is below 110 bpm.

The safety workflow routes red alerts to Nurse Triage, amber alerts to the coaching queue, and device-quality alerts to Biomedical Operations. A red alert is generated when systolic pressure exceeds 180 mmHg, diastolic pressure exceeds 120 mmHg, or the patient reports chest pain with shortness of breath. Amber alerts cover missed readings for three days, dizziness, or mild edema.

The protocol glossary defines SBP as systolic blood pressure, DBP as diastolic blood pressure, eGFR as estimated glomerular filtration rate, and AE as adverse event. Keyword retrieval should be strong for exact abbreviations such as eGFR, AE, PB-7, DCA-42, and INV-908. Semantic retrieval should help when a user asks about kidney function, safety routing, or high blood pressure without using the exact terms.

CardioMap has a monitoring graph that connects PulseBand PB-7 to Biomedical Operations, Nurse Triage to red alerts, and DCA-42 to adherence nudges. The graph also links chest pain to red alert escalation and dialysis to exclusion. A relationship query about which teams handle device problems should traverse from device-quality alerts to Biomedical Operations."""


INCIDENT_TEXT = """# Northwind Incident Response Runbook

Northwind Cloud runs a synthetic checkout platform with API Gateway, Cart Service, Payment Service, Inventory Service, Fraud Scoring, PostgreSQL Orders, and Redis Session Cache. The customer-facing service level objective is 99.9 percent monthly availability and p95 checkout latency below 450 ms.

Incident SEV-1 is declared when checkout success rate falls below 94 percent for five minutes, payment authorization errors exceed 6 percent, or API Gateway returns more than 2 percent 5xx responses. SEV-2 is declared when p95 latency exceeds 900 ms for ten minutes or one region has elevated queue depth. The escalation channel is #incident-checkout and the incident commander owns status updates every fifteen minutes.

The dependency map is important. API Gateway calls Cart Service, Cart Service calls Inventory Service and Redis Session Cache, Payment Service calls Fraud Scoring, and PostgreSQL Orders stores completed orders. If Redis Session Cache is unavailable, Cart Service can serve stale carts for ten minutes. If Fraud Scoring is unavailable, Payment Service must switch to rules-only mode after approval from Risk Operations.

Recovery playbooks include rollback of the latest Gateway routing rule, scaling Payment Service workers, disabling nonessential recommendation calls, and enabling queue drain mode. Rollback is preferred when the latest deployment changed routing, headers, or request signing. Queue drain mode is preferred when the database is healthy but workers are behind.

GraphRAG should perform well on questions about service dependencies and escalation paths. BM25 should perform well for exact strings such as SEV-1, p95, #incident-checkout, Redis Session Cache, and rules-only mode. Hybrid retrieval should do well when a query mixes exact incident codes with broad language about checkout failure."""


SUPPORT_TEXT = """# AtlasDesk Customer Support Knowledge Base

AtlasDesk is a synthetic B2B support product with three plans: Starter, Growth, and Enterprise. Starter includes email support with a 24 hour target, Growth includes chat support with a four hour target, and Enterprise includes a named customer success manager with a one hour urgent target.

Refund policy RFD-14 says a customer can receive a full refund within 14 days if fewer than 500 tickets were processed and no custom onboarding was delivered. After 14 days, billing credits require Finance Approval. Enterprise customers with annual contracts use addendum ENT-A9, which allows service credits for missed urgent response targets.

Data retention policy DRP-30 keeps closed tickets for 30 months on Growth and Enterprise, but only 12 months on Starter. Audit exports are available on Enterprise and must be requested by an account owner. A deletion request removes attachments first, then ticket messages, then analytics aggregates during the next nightly privacy job.

The support graph connects Enterprise to customer success manager, urgent target, audit exports, and ENT-A9. It connects refund requests to RFD-14, Finance Approval, and billing credits. It connects deletion requests to attachments, ticket messages, analytics aggregates, and privacy job. Relationship queries should explain the chain rather than only return a single policy paragraph.

Memory RAG is useful for AtlasDesk when the user says they prefer low-cost plans, short response times, or strict retention. If the user remembers that they are evaluating Enterprise compliance, retrieval should bias toward audit exports, retention, account owner controls, and service credits."""


DEMOS = [
    DemoDataset(
        slug="raglab-architecture",
        title="RAGLab Architecture",
        source="demo:raglab-architecture",
        description="Portfolio architecture corpus for RAG method comparison.",
        questions=[
            "Which RAG method is safest for a mixed query about Vercel and Supabase deployment?",
            "How does Hybrid RAG combine keyword and vector retrieval?",
            "Which method is best for exact terms like pgvector and BM25?",
            "What connects Vercel, Supabase, pgvector, and GraphRAG?",
        ],
        text=RAGLAB_TEXT,
    ),
    DemoDataset(
        slug="clinical-trial",
        title="CardioMap Trial Protocol",
        source="demo:clinical-trial",
        description="Clinical protocol with abbreviations, safety thresholds, and routing relationships.",
        questions=[
            "Which exact exclusions mention INV-908, dialysis, or eGFR?",
            "What should happen when a patient has chest pain and shortness of breath?",
            "Which team handles device-quality alerts from PulseBand PB-7?",
            "Explain the relationship between DCA-42, adherence nudges, and week 12 blood pressure.",
        ],
        text=CLINICAL_TEXT,
    ),
    DemoDataset(
        slug="incident-runbook",
        title="Northwind Incident Runbook",
        source="demo:incident-runbook",
        description="Production incident runbook with exact SEV terms and service dependency graph.",
        questions=[
            "What exact conditions declare SEV-1 for checkout?",
            "How are API Gateway, Cart Service, Redis cache, and Payment Service connected?",
            "When should Payment Service switch to rules-only mode?",
            "Which recovery action fits a routing or request-signing deployment issue?",
        ],
        text=INCIDENT_TEXT,
    ),
    DemoDataset(
        slug="support-kb",
        title="AtlasDesk Support KB",
        source="demo:support-kb",
        description="Support policy corpus for refund, retention, plan, and memory-biased queries.",
        questions=[
            "What are the exact requirements in refund policy RFD-14?",
            "Which plan has audit exports and a named customer success manager?",
            "How does a deletion request move through attachments, messages, and analytics?",
            "Based on my preference for strict retention, which plan should I inspect?",
        ],
        text=SUPPORT_TEXT,
    ),
]

DEFAULT_DEMO_SLUG = DEMOS[0].slug
_DEMOS_BY_SLUG = {demo.slug: demo for demo in DEMOS}


def list_demo_metadata() -> list[dict[str, object]]:
    return [demo.metadata() for demo in DEMOS]


def get_demo(slug: str | None) -> DemoDataset:
    if not slug:
        return _DEMOS_BY_SLUG[DEFAULT_DEMO_SLUG]
    try:
        return _DEMOS_BY_SLUG[slug]
    except KeyError as exc:
        raise ValueError(f"Unknown demo dataset: {slug}") from exc
