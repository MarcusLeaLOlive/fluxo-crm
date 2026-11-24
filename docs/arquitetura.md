# Arquitetura

## Visão geral

Aplicação React de página única, construída com Vite.

- `/` é a apresentação do portfólio, pré-renderizada no build (HTML completo para buscadores e agentes de IA) e hidratada no navegador.
- `/#app` é o CRM, carregado sob demanda (`React.lazy`) para manter a apresentação leve.

```
Navegador
  index.html (pré-renderizado)
    App
      ErrorBoundary
        Landing           (seções da apresentação)
        CrmApp  [lazy]    (funil, lista, painel, formulários)
          useAuth   ->  Supabase Auth  | contas de demonstração
          useDeals  ->  storage.js     -> Supabase (PostgreSQL) | navegador
```

## Camadas

| Camada | Arquivos | Responsabilidade |
|---|---|---|
| Configuração | `src/config/` | Etapas, origens, textos e URL do site |
| Domínio | `src/lib/deals.js`, `reports.js`, `validation.js` | Regras puras, sem React: métricas, filtros, validação, agregações. Cobertas por testes |
| Persistência | `src/lib/storage.js`, `dealMapper.js`, `supabase.js` | Duas implementações com a mesma interface (`start`, `save`, `remove`, `stop`) |
| Estado | `src/hooks/` | Liga domínio e persistência à interface |
| Interface | `src/components/`, `src/features/` | Componentes e telas |
| Estilo | `src/styles/` | Tokens e camadas de CSS |

## Fluxo de dados

1. `useAuth` informa se há usuário autenticado no Supabase.
2. `useDeals(userId)` escolhe o repositório: Supabase (com usuário) ou demonstração (sem usuário).
3. Ao salvar, o repositório atualiza a tela na hora (otimista) e envia ao banco; se o banco recusar, desfaz e devolve uma mensagem em português.
4. Alterações vindas de outros dispositivos chegam pelo Realtime do Supabase e recarregam a lista.

## Rotas

Roteamento por hash (`useHashRoute`): `#app` abre o CRM; qualquer outro hash (`#recursos`, `#sobre`) rola até a seção da apresentação. Isso funciona em qualquer hospedagem estática, sem regras de reescrita.

## Erros

- `ErrorBoundary` mostra uma tela de recuperação se uma tela quebrar.
- `src/lib/errors.js` captura erros e promessas não tratadas, registra no console e exibe um aviso discreto. É o ponto único para plugar um serviço de monitoramento.

## Build

`npm run build` executa, em ordem:

1. `vite build`: gera `dist/` e, pelo plugin `seo/seo-plugin.js`, os arquivos `robots.txt`, `sitemap.xml` e `llms.txt`.
2. `vite build --ssr src/entry-server.jsx`: gera a versão de servidor da apresentação.
3. `scripts/prerender.mjs`: injeta o HTML renderizado em `dist/index.html`.
