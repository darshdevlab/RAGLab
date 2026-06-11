create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.raglab_datasets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  source text not null,
  content_hash text,
  is_sample boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.raglab_documents (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.raglab_datasets(id) on delete cascade,
  title text not null,
  source text not null,
  storage_path text,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.raglab_chunks (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.raglab_datasets(id) on delete cascade,
  document_id uuid not null references public.raglab_documents(id) on delete cascade,
  position integer not null,
  text text not null,
  token_count integer not null,
  tokens text[] not null default '{}',
  entities text[] not null default '{}',
  embedding extensions.vector(64),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, position)
);

create table if not exists public.raglab_entities (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.raglab_datasets(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  entity_type text not null default 'term',
  embedding extensions.vector(64),
  created_at timestamptz not null default now(),
  unique (dataset_id, normalized_name)
);

create table if not exists public.raglab_relations (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.raglab_datasets(id) on delete cascade,
  source_entity_id uuid not null references public.raglab_entities(id) on delete cascade,
  target_entity_id uuid not null references public.raglab_entities(id) on delete cascade,
  evidence_chunk_id uuid references public.raglab_chunks(id) on delete set null,
  relation_type text not null,
  weight real not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.raglab_memories (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  text text not null,
  embedding extensions.vector(64),
  created_at timestamptz not null default now()
);

create table if not exists public.raglab_runs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  dataset_id uuid references public.raglab_datasets(id) on delete set null,
  question text not null,
  query_type text not null,
  recommended_method text,
  recommended_label text,
  recommended_score real,
  created_at timestamptz not null default now()
);

create table if not exists public.raglab_run_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.raglab_runs(id) on delete cascade,
  method text not null,
  label text not null,
  score real not null,
  latency_ms real not null,
  answer text not null,
  diagnostics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.raglab_run_evidence (
  id uuid primary key default gen_random_uuid(),
  run_result_id uuid not null references public.raglab_run_results(id) on delete cascade,
  chunk_id uuid references public.raglab_chunks(id) on delete set null,
  rank integer not null,
  score real not null,
  reason text not null,
  snippet text not null,
  created_at timestamptz not null default now()
);

create index if not exists raglab_documents_dataset_idx on public.raglab_documents(dataset_id);
create index if not exists raglab_chunks_dataset_idx on public.raglab_chunks(dataset_id);
create index if not exists raglab_chunks_document_idx on public.raglab_chunks(document_id);
create index if not exists raglab_chunks_text_gin on public.raglab_chunks using gin (to_tsvector('english', text));
create index if not exists raglab_chunks_embedding_hnsw on public.raglab_chunks using hnsw (embedding extensions.vector_cosine_ops);
create index if not exists raglab_entities_dataset_idx on public.raglab_entities(dataset_id);
create index if not exists raglab_entities_embedding_hnsw on public.raglab_entities using hnsw (embedding extensions.vector_cosine_ops);
create index if not exists raglab_relations_dataset_idx on public.raglab_relations(dataset_id);
create index if not exists raglab_relations_source_entity_idx on public.raglab_relations(source_entity_id);
create index if not exists raglab_relations_target_entity_idx on public.raglab_relations(target_entity_id);
create index if not exists raglab_relations_evidence_chunk_idx on public.raglab_relations(evidence_chunk_id);
create index if not exists raglab_memories_session_idx on public.raglab_memories(session_id);
create index if not exists raglab_memories_embedding_hnsw on public.raglab_memories using hnsw (embedding extensions.vector_cosine_ops);
create index if not exists raglab_runs_session_idx on public.raglab_runs(session_id);
create index if not exists raglab_runs_dataset_idx on public.raglab_runs(dataset_id);
create index if not exists raglab_run_results_run_idx on public.raglab_run_results(run_id);
create index if not exists raglab_run_evidence_result_idx on public.raglab_run_evidence(run_result_id);
create index if not exists raglab_run_evidence_chunk_idx on public.raglab_run_evidence(chunk_id);

create or replace function public.raglab_match_vector(
  p_dataset_id uuid,
  p_query_embedding extensions.vector(64),
  p_match_count integer default 5
)
returns table (
  chunk_id uuid,
  document_id uuid,
  dataset_id uuid,
  chunk_position integer,
  content text,
  entity_names text[],
  similarity double precision
)
language sql
stable
set search_path = public, extensions, pg_temp
as $$
  select
    c.id,
    c.document_id,
    c.dataset_id,
    c.position,
    c.text,
    c.entities,
    1 - (c.embedding <=> p_query_embedding) as similarity
  from public.raglab_chunks c
  where c.dataset_id = p_dataset_id
    and c.embedding is not null
  order by c.embedding <=> p_query_embedding
  limit greatest(1, p_match_count);
$$;

create or replace function public.raglab_match_keyword(
  p_dataset_id uuid,
  p_query text,
  p_match_count integer default 5
)
returns table (
  chunk_id uuid,
  document_id uuid,
  dataset_id uuid,
  chunk_position integer,
  content text,
  entity_names text[],
  keyword_rank real
)
language sql
stable
set search_path = public, extensions, pg_temp
as $$
  with query as (
    select websearch_to_tsquery('english', coalesce(nullif(trim(p_query), ''), 'rag')) as tsq
  )
  select
    c.id,
    c.document_id,
    c.dataset_id,
    c.position,
    c.text,
    c.entities,
    ts_rank(to_tsvector('english', c.text), query.tsq) as keyword_rank
  from public.raglab_chunks c, query
  where c.dataset_id = p_dataset_id
    and to_tsvector('english', c.text) @@ query.tsq
  order by keyword_rank desc
  limit greatest(1, p_match_count);
$$;

alter table public.raglab_datasets enable row level security;
alter table public.raglab_documents enable row level security;
alter table public.raglab_chunks enable row level security;
alter table public.raglab_entities enable row level security;
alter table public.raglab_relations enable row level security;
alter table public.raglab_memories enable row level security;
alter table public.raglab_runs enable row level security;
alter table public.raglab_run_results enable row level security;
alter table public.raglab_run_evidence enable row level security;

revoke all on public.raglab_datasets from anon, authenticated;
revoke all on public.raglab_documents from anon, authenticated;
revoke all on public.raglab_chunks from anon, authenticated;
revoke all on public.raglab_entities from anon, authenticated;
revoke all on public.raglab_relations from anon, authenticated;
revoke all on public.raglab_memories from anon, authenticated;
revoke all on public.raglab_runs from anon, authenticated;
revoke all on public.raglab_run_results from anon, authenticated;
revoke all on public.raglab_run_evidence from anon, authenticated;

grant all on public.raglab_datasets to service_role;
grant all on public.raglab_documents to service_role;
grant all on public.raglab_chunks to service_role;
grant all on public.raglab_entities to service_role;
grant all on public.raglab_relations to service_role;
grant all on public.raglab_memories to service_role;
grant all on public.raglab_runs to service_role;
grant all on public.raglab_run_results to service_role;
grant all on public.raglab_run_evidence to service_role;

insert into storage.buckets (id, name, public, file_size_limit)
values ('raglab_documents', 'raglab_documents', false, 2097152)
on conflict (id) do nothing;
