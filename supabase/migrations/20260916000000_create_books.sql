-- Books table: every row belongs to exactly one user.
-- Book ids are generated on the client (e.g. "book-1726500000000", "dune-1"),
-- so the primary key is scoped per user. This lets every user copy the sample books.

create table public.books (
  user_id       uuid        not null references auth.users (id) on delete cascade,
  id            text        not null,
  title         text        not null,
  author        text        not null default '',
  cover_url     text,
  rating        numeric(2,1) not null default 0 check (rating between 0 and 5),
  genre         text,
  spine_color   text,
  spine_pattern text,
  pages         integer,
  year          text,
  read_date     text,
  status        text        not null default 'want_to_read'
                            check (status in ('read', 'reading', 'want_to_read')),
  favorite      boolean     not null default false,
  review        text        not null default '',
  quotes        text[]      not null default '{}',
  shelf_number  smallint,
  -- Higher values are shown first on the shelf
  sort_order    bigint      not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, id)
);

create index books_user_sort_order_idx on public.books (user_id, sort_order desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

-- Row Level Security: users can only see and change their own books
alter table public.books enable row level security;

create policy "Users can read their own books"
  on public.books for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own books"
  on public.books for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own books"
  on public.books for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own books"
  on public.books for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.books to authenticated;
