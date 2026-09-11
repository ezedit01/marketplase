-- =========================================================
-- MIGRACIÓN 004 — NOTIFICACIONES IN-APP
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 003.
-- =========================================================

create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null default 'info', -- 'alert_match' por ahora, otros tipos a futuro
  title text not null,
  body text,
  link text, -- ruta interna a la que navega al tocarla, ej: /buscar?categoria=motos
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx on notifications(user_id, read);
create index notifications_user_created_idx on notifications(user_id, created_at desc);

alter table notifications enable row level security;

-- Solo lectura/actualización propia. NO hay policy de insert para usuarios:
-- las notificaciones las crea únicamente el cron del Worker usando la
-- service_role key (que bypassea RLS), así nadie puede mandarle
-- notificaciones falsas a otro usuario.
create policy "Usuario ve sus propias notificaciones"
  on notifications for select using (auth.uid() = user_id);

create policy "Usuario marca sus notificaciones como leidas"
  on notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuario borra sus propias notificaciones"
  on notifications for delete using (auth.uid() = user_id);

-- El cron necesita saber, por cada alerta, desde cuándo ya revisó —
-- así en cada corrida solo mira publicaciones realmente nuevas.
alter table search_alerts add column if not exists last_checked_at timestamptz not null default now();
