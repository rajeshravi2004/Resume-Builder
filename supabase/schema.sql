-- Run this once in the Supabase SQL editor.
create table if not exists public.workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"profiles":[],"resumes":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

drop policy if exists "Users can read their own workspace" on public.workspaces;
create policy "Users can read their own workspace"
  on public.workspaces for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own workspace" on public.workspaces;
create policy "Users can create their own workspace"
  on public.workspaces for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own workspace" on public.workspaces;
create policy "Users can update their own workspace"
  on public.workspaces for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_workspace_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_workspace_updated_at();

-- Server-controlled administrator allowlist. There are intentionally no table
-- policies, so browsers cannot enumerate or modify administrator emails.
create table if not exists public.admin_allowlist (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.admin_allowlist enable row level security;

insert into public.admin_allowlist (email)
values ('ravirajesh988@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_allowlist
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
