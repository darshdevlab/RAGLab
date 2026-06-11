# RAGLab

RAGLab is a full-stack portfolio prototype for comparing RAG strategies on the same dataset.

It runs real local retrieval engines:

- BM25 / keyword RAG
- Vector RAG with local TF-IDF cosine vectors
- Hybrid RAG with normalized BM25 + vector scores
- Memory RAG with SQLite-backed session memory
- GraphRAG with entity and relation traversal

Built-in demo datasets:

- RAGLab Architecture: deployment, pgvector, hybrid retrieval, and graph relationships.
- CardioMap Trial Protocol: clinical abbreviations, safety thresholds, and routing.
- Northwind Incident Runbook: SEV terms, service dependencies, and recovery playbooks.
- AtlasDesk Support KB: refund, retention, plan, and memory-biased support policies.

The local version avoids npm, pip, and external LLM APIs so the product behavior can be verified first. The hosted version uses Supabase for documents, chunks, pgvector embeddings, keyword search, memory, entities, relations, run logs, and evidence.

## Live Architecture

- Frontend: static browser UI, publishable on GitHub Pages or Vercel.
- Backend: Supabase Edge Function `raglab`.
- Database: Supabase Postgres tables prefixed with `raglab_`.
- Vector search: Supabase pgvector on `raglab_chunks.embedding`.
- Keyword search: Postgres full-text search RPC.
- File storage: private Supabase bucket `raglab_documents`.
- Demo site bucket: `raglab_site` exists, but Supabase serves HTML as text, so GitHub Pages/Vercel is the correct frontend host.

## Run Locally

One command:

```bash
cd /Volumes/LocalDrive1/ProductPorfolio/Projects/RAGLab
python3 backend/server.py --port 8787
```

Open:

```text
http://127.0.0.1:8787
```

## API

```text
GET  /api/health
GET  /api/demos
GET  /api/dataset
POST /api/dataset/sample
POST /api/dataset/text
POST /api/query
GET  /api/memory/{session_id}
POST /api/memory
```

## Hosted API

The hosted API base is:

```text
https://peluzzqoihjvkdtedsiz.supabase.co/functions/v1/raglab
```

Live demo:

```text
https://darshdevlab.github.io/RAGLab/
```

GitHub repo:

```text
https://github.com/darshdevlab/RAGLab
```

The frontend automatically uses the hosted API outside localhost and keeps relative `/api` calls when run through the local Python server.

## Deployment Direction

Use GitHub Pages or Vercel for the frontend. Use Supabase for hosted persistence:

- Supabase Storage: uploaded files
- Postgres: documents, chunks, metadata, runs
- pgvector: vector search
- Postgres full-text search: BM25/keyword retrieval
- Tables: memory, entities, relations

The product compares RAG methods, not vector database vendors. Qdrant, Pinecone, Weaviate, or Neo4j can be added later as adapters if the project becomes a database benchmark.
