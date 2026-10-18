-- Run once in the Supabase SQL Editor, after the original tables and RLS setup.
-- No existing projects, images, or policies are deleted or replaced.
begin;

create or replace function public.save_artwork_project(
  p_id uuid,
  p_expected_updated_at timestamptz,
  p_project jsonb,
  p_images jsonb
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_version timestamptz;
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid()) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  select updated_at into current_version from public.projects where id = p_id for update;
  if not found then
    raise exception 'Project not found' using errcode = 'P0002';
  end if;
  if current_version is distinct from p_expected_updated_at then
    raise exception 'Project changed. Reload before saving.' using errcode = '40001';
  end if;
  if jsonb_typeof(p_images) is distinct from 'array' then
    raise exception 'Images must be an array' using errcode = '22023';
  end if;
  if jsonb_array_length(p_images) > 24 then
    raise exception 'Maximum 24 images per project' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_images) item
    where item->>'storage_path' is null
       or item->>'storage_path' !~ ('^' || p_id::text || '/[A-Za-z0-9_-]+[.](jpg|jpeg|png|webp)$')
       or not exists (
         select 1 from storage.objects o
         where o.bucket_id = 'artworks' and o.name = item->>'storage_path'
       )
  ) then
    raise exception 'An image is missing or belongs to another project' using errcode = '22023';
  end if;

  -- Defer both the unique image-order constraint and the published-image guard.
  -- Removing, replacing, and reordering images becomes one atomic transaction.
  set constraints all deferred;

  update public.projects set
    title = nullif(btrim(p_project->>'title'), ''),
    slug = p_project->>'slug',
    project_type = p_project->>'project_type',
    categories = array(select jsonb_array_elements_text(p_project->'categories')),
    sort_order = (p_project->>'sort_order')::integer,
    is_published = (p_project->>'is_published')::boolean
  where id = p_id;

  delete from public.project_images where project_id = p_id;
  insert into public.project_images (id, project_id, storage_path, alt_text, width, height, sort_order)
  select (item->>'id')::uuid, p_id, item->>'storage_path', btrim(item->>'alt_text'),
         (item->>'width')::integer, (item->>'height')::integer, (position - 1)::integer
  from jsonb_array_elements(p_images) with ordinality as images(item, position);

  return p_id;
end;
$$;

revoke all on function public.save_artwork_project(uuid, timestamptz, jsonb, jsonb) from public, anon;
grant execute on function public.save_artwork_project(uuid, timestamptz, jsonb, jsonb) to authenticated;
commit;
