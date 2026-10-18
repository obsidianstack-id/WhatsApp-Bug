-- Run in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  group_link text not null default '',
  category text not null check (category in (
    'Spam atau penipuan',
    'Ancaman atau pelecehan',
    'Konten berbahaya',
    'Penyamaran atau pelanggaran identitas',
    'Lainnya'
  )),
  description text not null check (char_length(description) between 10 and 3000),
  status text not null default 'Catatan disimpan — belum dikirim ke WhatsApp',
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;
-- The server uses the Supabase service-role key, which must remain secret
-- and only be set as a Vercel environment variable. Never expose it to the browser.
-- This starter intentionally does not create public client policies.
