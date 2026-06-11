revoke all on public.raglab_datasets from anon, authenticated;
revoke all on public.raglab_documents from anon, authenticated;
revoke all on public.raglab_chunks from anon, authenticated;
revoke all on public.raglab_entities from anon, authenticated;
revoke all on public.raglab_relations from anon, authenticated;
revoke all on public.raglab_memories from anon, authenticated;
revoke all on public.raglab_runs from anon, authenticated;
revoke all on public.raglab_run_results from anon, authenticated;
revoke all on public.raglab_run_evidence from anon, authenticated;

update storage.buckets
set public = false
where id in ('raglab_documents', 'raglab_site');
