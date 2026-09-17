-- Yearly reading goal per user (one row per user per year)

create table public.reading_goals (
  user_id       uuid        not null references auth.users (id) on delete cascade,
  year          smallint    not null check (year between 2000 and 2100),
  target_books  integer     not null check (target_books between 1 and 1000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, year)
);

create trigger reading_goals_set_updated_at
  before update on public.reading_goals
  for each row execute function public.set_updated_at();

alter table public.reading_goals enable row level security;

create policy "Users can read their own reading goals"
  on public.reading_goals for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own reading goals"
  on public.reading_goals for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own reading goals"
  on public.reading_goals for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own reading goals"
  on public.reading_goals for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.reading_goals to authenticated;
