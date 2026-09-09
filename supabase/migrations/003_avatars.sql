-- =========================================================
-- MIGRACIÓN 003 — AVATARES DE PERFIL
-- Ejecutar en Supabase: SQL Editor > New query, DESPUÉS de 002.
-- =========================================================

-- La columna profiles.avatar_url ya existía desde el schema inicial,
-- pero faltaba el bucket de storage donde guardar las fotos.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatares son públicos para lectura"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Usuario sube su propio avatar"
  on storage.objects for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuario reemplaza su propio avatar"
  on storage.objects for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Usuario elimina su propio avatar"
  on storage.objects for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
