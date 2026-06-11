# RAGLab Demo Dataset

RAGLab is a product prototype for comparing retrieval augmented generation strategies on the same dataset. The platform should help a user upload documents, ask natural language questions, inspect retrieved evidence, and see which RAG strategy works best for that dataset and query type.

Vector RAG uses semantic embeddings to find chunks with similar meaning even when the words are different. It is useful for concept questions such as why a product needs grounding, how semantic search differs from keyword search, or what a paragraph means in business language. Vector RAG can fail when the query requires an exact term, identifier, or quoted phrase.

BM25 and keyword RAG use lexical matching. BM25 is strong when the user searches for exact terms such as pgvector, Supabase, GraphRAG, latency, citations, or a named product. BM25 is fast, explainable, and cheap. It can miss paraphrases when the document uses different wording from the question.

Hybrid RAG combines keyword scores with vector similarity scores. Hybrid RAG is often the safest default because it keeps exact-term precision while recovering semantic matches. A good hybrid system normalizes BM25 and vector scores before combining them. It should show score components so the user can understand why a chunk was selected.

Memory RAG adds session context. It stores user preferences, prior questions, accepted facts, and rejected facts. Memory RAG is useful when the user says things like "remember that I prefer low cost deployment" and later asks which architecture should be selected. Memory must include approve, delete, and inspect controls because uncontrolled memory can make retrieval biased or stale.

GraphRAG builds an entity and relationship layer over the document collection. Entities can include RAGLab, Supabase, pgvector, Vercel, BM25, Hybrid RAG, Memory RAG, GraphRAG, and citations. Relationships connect methods to strengths, limitations, storage choices, and deployment decisions. GraphRAG is useful for questions about how concepts connect, which methods depend on embeddings, or which architecture links Vercel with Supabase.

For the online version, Vercel should host the interactive frontend and API orchestration. Supabase can store documents, chunks, metadata, vector embeddings through pgvector, keyword search indexes, memory rows, entities, and relations. This means the first online version does not need separate Pinecone, Qdrant, Weaviate, or Neo4j deployments. Those adapters can be added later if the product becomes a database benchmark.

RAGLab should not pretend every RAG method is correct. The dashboard should show retrieved chunks, citations, latency, method strengths, method limitations, and a recommendation score. A recommendation is only trustworthy when evidence is visible. The strongest portfolio version is a full working end-to-end prototype: data ingestion, chunking, indexing, query execution, retrieval comparison, scoring, ranking, and interactive UI.

