do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'raglab_datasets',
    'raglab_documents',
    'raglab_chunks',
    'raglab_entities',
    'raglab_relations',
    'raglab_memories',
    'raglab_runs',
    'raglab_run_results',
    'raglab_run_evidence'
  ]
  loop
    execute format('drop policy if exists raglab_public_deny_all on public.%I', table_name);
    execute format(
      'create policy raglab_public_deny_all on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',
      table_name
    );
  end loop;
end $$;
