# Couto Imóveis

Site em português do Brasil para anunciar casas e apartamentos à venda. O front é uma SPA Vue 3 (Nuxt, `ssr: false`), com Pinia e Tailwind. Os dados e as fotos ficam no Supabase. O site estático é publicado no GitHub Pages.

Não há React neste projeto. Não há API Nitro obrigatória: o navegador fala direto com o Supabase usando a chave anon/publishable.

## Requisitos

- Node.js `^22.22.3`, `^24.15.0` ou superior (o Nuxt atual não roda no Node 22.14)
- npm
- Um projeto Supabase vazio

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra o **SQL Editor** e cole o arquivo `supabase/migrations/0001_imoveis.sql` **inteiro**, num projeto ainda vazio. Esse script cria as tabelas `imoveis`, `fotos_imovel` e `configuracoes`, o bucket público `imoveis` e as políticas de segurança (RLS).
3. Em **Authentication → Users**, crie o usuário administrador (e-mail e senha). É com ele que o painel entra. O site não tem senha própria.
4. Em **Project Settings → API**, copie a URL do projeto e a chave **anon / publishable**. Não use `service_role` em lugar nenhum.

## Variáveis

Crie `.env.local` na raiz (ele fica no `.gitignore`):

```bash
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_KEY=
NUXT_APP_BASE_URL=/
```

Os nomes vazios também estão em `.env.example`. A chave é a anon/publishable. Ela pode ir no front; a `service_role` não.

No GitHub, cadastre os mesmos nomes como secrets do repositório:

- `NUXT_PUBLIC_SUPABASE_URL`
- `NUXT_PUBLIC_SUPABASE_KEY`

Se essas variáveis faltarem, o site mostra “Configure o Supabase” em vez de quebrar.

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`.

Para gerar o site estático:

```bash
npm run generate
```

O resultado fica em `.output/public`, com `404.html` (fallback da SPA) e `.nojekyll`.

## GitHub Pages

O workflow `.github/workflows/pages.yml` gera o site e publica com as ações oficiais `configure-pages`, `upload-pages-artifact` e `deploy-pages`.

No repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

A Action define `NUXT_APP_BASE_URL` como `/<nome-do-repo>/`, que é o caminho de um site de projeto no GitHub Pages. No seu computador o padrão é `/`.

## O que o público vê

- Catálogo só com imóveis **ativos**, filtro todos / casas / apartamentos.
- Seção discreta **Vendidos**.
- **Rascunho** não aparece para quem não está logado.
- Página do imóvel com galeria, descrição e preço em reais.
- **Falar no WhatsApp** abre `https://wa.me/<número>?text=` com a mensagem daquele imóvel. O número vem de `configuracoes.numero_whatsapp`. Se estiver vazio, o botão explica que o contato será ativado quando o anunciante salvar o WhatsApp. Se o número não começar com 55, o site acrescenta o código do Brasil.
- **Compartilhar no WhatsApp** está na página do imóvel e no painel.

## Compartilhar no WhatsApp

No celular, se `navigator.canShare` aceitar a foto, o site chama:

```ts
await navigator.share({
  files: [fotoDaCapa],
  title,
  text: legendaFormatada,
})
```

A foto de capa é baixada do Storage como arquivo. A legenda vai em português, com negrito por asteriscos, preço, bairro, cidade, cômodos e o link da página. O usuário escolhe Status ou um grupo na folha do WhatsApp e confirma. O site não publica sozinho, não usa API não oficial e não automatiza o WhatsApp Web.

No computador, quando o navegador não compartilha arquivo:

- a legenda é copiada
- a foto de capa é baixada
- abre `https://wa.me/?text=` só com o texto
- um aviso pede para anexar a foto baixada

O link `wa.me` não envia foto. A foto só entra em `navigator.share({ files })`.

## Painel

Em `/admin/login`, entre com o e-mail e a senha do Supabase Auth. Dá para criar, editar, marcar como rascunho, ativo ou vendido, definir a capa, reordenar fotos e excluir com confirmação. Em `/admin/configuracoes` fica o número de WhatsApp e o nome exibido (padrão “Couto Imóveis”).
