# RAGLab Architecture Notes

RAGLab compares retrieval augmented generation strategies on the same dataset. The prototype is designed for a public portfolio visitor who wants to inspect data, understand retrieval tradeoffs, and see why one RAG method fits a query better than another.

Vector RAG uses pgvector similarity search to find chunks with similar meaning signals. In this demo, embeddings can be deterministic free vectors, then swapped later for an open-source embedding endpoint.

BM25 and keyword retrieval use lexical matching. BM25 is strong for exact terms such as pgvector, Supabase, GraphRAG, latency, citations, and named products. It is explainable and cheap, but it can miss paraphrases.

Hybrid RAG combines keyword scores with vector similarity. A good hybrid retriever normalizes both scores before ranking chunks. It should expose score components so a user can see why a chunk was selected.

Memory RAG adds session context such as preferences, accepted facts, rejected facts, or prior questions. It must include inspect and delete controls because uncontrolled memory can bias retrieval.

GraphRAG creates entities and relationships from the corpus. Entities can include Vercel, Supabase, pgvector, BM25, Hybrid RAG, Memory RAG, GraphRAG, and citations. Relationships connect methods to strengths, limits, storage choices, and deployment decisions.
