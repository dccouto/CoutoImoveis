-- Couto Imóveis — link do Google Maps por imóvel
-- Se a tabela `imoveis` já existir em produção, cole este arquivo no SQL Editor do Supabase.
-- A chave anon/publishable do app NÃO altera o schema; só este SQL (ou a migration) cria a coluna.

alter table public.imoveis
  add column if not exists link_maps text not null default '';
