-- Couto Imóveis — exibir seção de vendidos na página inicial
-- Se a tabela `configuracoes` já existir em produção, cole este arquivo no SQL Editor do Supabase.
-- A chave anon/publishable do app NÃO altera o schema; só este SQL (ou a migration) cria a coluna.
-- Default true: a vitrine continua mostrando vendidos até o anunciante desligar no painel.

alter table public.configuracoes
  add column if not exists exibir_vendidos boolean not null default true;
