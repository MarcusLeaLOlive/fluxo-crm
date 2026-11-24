# CLAUDE.md

Instruções para agentes de IA (e pessoas) que trabalham neste repositório.

## Projeto

Fluxo é um CRM de funil de vendas feito em React, publicado como projeto de portfólio de Marcus Leal. Tem uma página de apresentação (`/`) e a demonstração do CRM (`/#app`). Detalhes do produto em `PRODUCT.md`; sistema visual em `DESIGN.md`; arquitetura, banco e deploy em `docs/`.

## Comandos

```bash
npm install          # dependências
npm run dev          # servidor local (http://localhost:5173)
npm test             # testes unitários (Vitest)
npm run build        # build de produção + pré-renderização + robots/sitemap/llms.txt
npm run preview      # serve o build localmente
npm run seo:check -- https://endereco-publicado   # valida o SEO no ar
```

Antes de concluir qualquer mudança: `npm test` e `npm run build` precisam passar.

## Regras do repositório

- **Idioma**: textos da interface, comentários, documentação e mensagens de commit em português do Brasil.
- **Sem emojis** em código, interface, documentação e commits. Use os ícones SVG de `src/components/ui/Icon.jsx`.
- **Commits** em nome do autor do repositório, sem linhas de coautoria (`Co-Authored-By`) de ferramentas de IA.
- **Sem bibliotecas de interface ou de gráficos.** Componentes, gráficos e estilos são escritos à mão. Dependências atuais: React, Motion (animações) e `@supabase/supabase-js`. Discuta antes de adicionar outra.
- **Acessibilidade é requisito**: HTML semântico, rótulos em todo controle, foco visível, navegação por teclado e respeito a `prefers-reduced-motion`. Contraste mínimo AA.
- **Segredos**: nunca versionar `.env`. Só a chave `anon` do Supabase vai para o navegador; a `service_role` nunca entra no front-end.

## Onde fica cada coisa

| Pasta | Conteúdo |
|---|---|
| `src/config/` | Etapas do funil, origens e dados do site (`site.js`: URL pública, título, descrição, links) |
| `src/lib/` | Regras de negócio em funções puras (`deals.js`, `reports.js`, `validation.js`), persistência (`storage.js`), cliente Supabase, erros globais |
| `src/hooks/` | `useDeals`, `useAuth`, `useDealForm`, `useTheme`, `useFocusTrap`, atalhos, rotas |
| `src/components/` | Componentes reutilizáveis (`ui/`, `charts/`) e `ErrorBoundary` |
| `src/features/` | Telas: `landing/` (apresentação), `crm/` (aplicação), `auth/` (login) |
| `src/styles/` | CSS em camadas: `tokens`, `base`, `components`, `crm`, `landing`, `motion`, `effects`, `features` |
| `seo/`, `scripts/` | Plugin de SEO do Vite, pré-renderização e validador |
| `supabase/migrations/` | Esquema do banco, índices e RLS |
| `public/` | Ícones, imagem de compartilhamento, manifest e `404.html` |

## Convenções de código

- Componentes React em `.jsx`, funções e hooks em `.js`. Nomes em inglês no código; textos para o usuário em português.
- Regra de negócio nova vai para `src/lib/` com teste em `src/lib/__tests__/`.
- Dados passam sempre por `useDeals()`; componentes não acessam `localStorage` nem o Supabase diretamente.
- Cores, espaçamentos, raios e sombras vêm dos tokens em `src/styles/tokens.css`. Não use valores soltos.
- Código que roda na pré-renderização (apresentação) não pode acessar `window` ou `document` durante a renderização; use `useEffect`.
- Animações: só `opacity` e `transform`/`translate`, entre 200 e 800 ms, desligadas com movimento reduzido.
