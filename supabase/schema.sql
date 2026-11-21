-- Monopoli Nusantara — skema Supabase opsional (leaderboard online)
create table if not exists public.game_results (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(player_name) between 1 and 24),
  avatar text,
  is_winner boolean not null default false,
  net_worth integer not null default 0,
  territories integer not null default 0,
  buildings integer not null default 0,
  quiz_correct integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.game_results enable row level security;

-- Pengunjung boleh menambah hasil & membaca, tidak boleh mengubah/menghapus.
create policy "insert hasil" on public.game_results for insert to anon, authenticated with check (true);
create policy "baca hasil" on public.game_results for select to anon, authenticated using (true);
-- Admin (pengguna login) boleh menghapus data uji coba.
create policy "admin hapus" on public.game_results for delete to authenticated using (true);

create or replace view public.leaderboard as
select
  lower(player_name) as key,
  max(player_name) as player_name,
  max(avatar) as avatar,
  count(*) filter (where is_winner) as wins,
  count(*) as games,
  max(net_worth) as best_wealth,
  max(territories) as most_territories,
  max(created_at) as last_played
from public.game_results
group by lower(player_name);

grant select on public.leaderboard to anon, authenticated;
