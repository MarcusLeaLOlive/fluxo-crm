# Fluxo: CRM de funil de vendas

Aplicação React para pequenas equipes comerciais organizarem negócios, contatos, atividades e previsão de receita.
Projeto de portfólio desenvolvido por **Marcus Leal**.

> Demonstração: abra o site e clique em **Abrir demonstração**, depois em **Carregar exemplos**.

## Funcionalidades

- **Funil kanban** com seis etapas: arraste com o mouse ou use `Shift + ← / →` pelo teclado. Toda movimentação pode ser desfeita.
- **Lista ordenável** por qualquer coluna, com busca e filtros por responsável, origem e situação da atividade.
- **Indicadores em tempo real**: valor em aberto, previsão ponderada (valor × probabilidade), total ganho e taxa de conversão.
- **Formulário validado**: máscaras de CNPJ e telefone, validação de CNPJ pelos dígitos verificadores, e-mail, campos dependentes (motivo da perda, data da atividade), mensagens por campo, estado de carregamento e aviso antes de descartar alterações.
- **Atividades e histórico**: próxima atividade com alerta de atraso, notas e registro automático de mudanças de etapa.
- **Painel com gráficos**: previsão de fechamento por mês, valor por etapa, negócios por origem e desempenho por responsável, com tooltip e tabela de dados em cada gráfico.
- **Exportação CSV** compatível com Excel (separador `;` e BOM UTF-8).
- **Login e cadastro**: com Supabase, contas reais (confirmação de e-mail e recuperação de senha); sem ele, contas de demonstração no navegador. Validação, força da senha e mostrar/ocultar senha.
- **Busca em tempo real** com destaque do termo e **filtros dinâmicos** com contagem por opção e etiquetas removíveis.
- **Acessibilidade**: HTML semântico, link "Pular para o conteúdo", hierarquia de títulos, navegação por teclado, foco preso nos diálogos, contraste AA e suporte a `prefers-reduced-motion`. Sem violações no axe-core.
- **Tema claro e escuro** com a escolha salva no navegador (sem "piscar" ao carregar) e layout responsivo do celular ao desktop.
- **Animações com Motion**: o cartão "voa" para a nova coluna ao mudar de etapa, gráficos crescem ao aparecer, janelas e avisos entram e saem com suavidade. Tudo respeita `prefers-reduced-motion`.

## Tecnologias

React 18 · Vite 5 · Supabase (PostgreSQL, Auth, Realtime) · Motion · JavaScript (ES2022) · CSS com custom properties · Vitest · axe-core

Sem bibliotecas de interface ou de gráficos: componentes, gráficos, hooks e estilos foram escritos à mão. A única dependência visual é o Motion, para animações.

## Estrutura

```
src/
├─ App.jsx                 Rotas por hash (#app abre o CRM)
├─ components/ui/          Button, Field, Dialog, Toast, Avatar, Icon, Brand, SkipLink
├─ features/
│  ├─ crm/                 CrmApp, Summary, Toolbar, Board, DealTable, DealPanel
│  └─ landing/             Landing, LandingNav, Section, SiteFooter, content.js
│     └─ sections/         Hero, Features, Interface, Tech, About, Cta
├─ hooks/                  useDeals, useDealForm, useFocusTrap,
│                          useKeyboardShortcuts, useHashRoute, useToday
├─ lib/                    Regras de negócio, validação, formatação, persistência, exemplos
│  └─ __tests__/           Testes unitários (Vitest)
├─ config/                 Etapas do funil e dados do portfólio (site.js)
├─ entry-server.jsx        Pré-renderização da apresentação no build
supabase/migrations/       Esquema do banco, índices e RLS (SQL)
└─ styles/                 tokens, base, componentes, crm, landing
```

### Decisões técnicas

- **Regras de negócio em funções puras** (`lib/deals.js`, `lib/validation.js`): fáceis de testar e independentes do React.
- **Persistência isolada** (`lib/storage.js`): os componentes usam apenas `useDeals()`. Hoje os dados ficam no `localStorage` (ou no banco da conta quando publicado no Claude); trocar por uma API exige mudar só esse arquivo.
- **Formulário como hook** (`useDealForm`): estado, validação e montagem do registro ficam fora da marcação.
- **Design tokens** em `styles/tokens.css`: cores, espaçamentos, raios e sombras centralizados, com tema escuro.

## Como rodar

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm test         # testes unitários
npm run build    # gera a pasta dist/ para publicação
```

A pasta `dist/` pode ser publicada em GitHub Pages, Netlify ou Vercel (os caminhos são relativos).

## Banco de dados (Supabase)

Com as chaves do Supabase configuradas, o Fluxo usa **PostgreSQL com login real**; sem elas, roda no **modo demonstração** (dados no navegador). As duas formas usam a mesma interface (`src/lib/storage.js`).

**O que o banco oferece**
- Contas reais: cadastro com confirmação de e-mail, login, recuperação de senha e sessão renovada automaticamente.
- Tabelas `profiles`, `deals` e `deal_logs` (histórico), com chaves estrangeiras, índices e regras de validação no próprio banco (ex.: negócio perdido exige motivo).
- **Row Level Security**: cada usuário só lê e altera os próprios dados, mesmo que alguém use a chave pública fora do app.
- Sincronização em tempo real entre abas e dispositivos.
- Interface otimista: a tela atualiza na hora e desfaz a mudança se o servidor recusar, com mensagem clara.
- Ao entrar pela primeira vez, o app oferece importar os negócios do modo demonstração para a conta.

**Configuração (uma vez)**
1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, cole e execute `supabase/migrations/20261124000000_init.sql` (ou use a CLI: `supabase link` e `supabase db push`).
3. Em **Authentication → URL Configuration**, defina o *Site URL* com o endereço publicado e adicione `http://localhost:5173` em *Redirect URLs* para desenvolver.
4. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (**Project Settings → API**).
5. Na hospedagem (Netlify, Vercel…), cadastre as mesmas duas variáveis e faça o build.

> Nunca use a chave `service_role` no front-end: ela ignora o RLS. Só a chave `anon` vai para o navegador.

## SEO

- **Endereço único de configuração**: `url` em `src/config/site.js` (ou a variável `SITE_URL` no build). Dele saem o canonical, o `og:url`, o JSON-LD, o `robots.txt`, o `sitemap.xml` e o `llms.txt`.
- **Pré-renderização**: o build gera o HTML completo da apresentação (`scripts/prerender.mjs`), então buscadores e agentes de IA leem títulos e textos sem executar JavaScript. No navegador, o React apenas hidrata essa marcação.
- **Arquivos gerados no build** (`seo/seo-plugin.js`): `robots.txt` (libera tudo e aponta o sitemap), `sitemap.xml` (padrão sitemaps.org, com `lastmod`) e `llms.txt` (resumo e links para agentes de IA, no formato llmstxt.org).
- **Dados estruturados**: JSON-LD com `WebSite`, `WebPage`, `WebApplication` e `Person`, ligados por `@id`.
- **Página única**: a demonstração (`/#app`) fica na mesma URL da apresentação; fragmentos (#) não são URLs separadas para buscadores, por isso o sitemap tem uma URL. A demonstração troca título e descrição ao abrir.

### Validar depois de publicar

```bash
npm run seo:check -- https://seu-dominio.com.br
```

O script busca os arquivos como um robô (HTML bruto, sem JavaScript) e confere robots.txt, sitemap, canonical, title, description, noindex, hierarquia de títulos, JSON-LD, âncoras e os links do llms.txt. Sai com erro se algo falhar.

## Personalização

Edite `src/config/site.js` com o endereço publicado (`url`), seu e-mail, WhatsApp e links (GitHub, LinkedIn, repositório). Links vazios não aparecem no site.

## Documentação

- [PRODUCT.md](PRODUCT.md): visão, público, funcionalidades e próximos passos.
- [DESIGN.md](DESIGN.md): cores, tipografia, componentes e movimento.
- [docs/arquitetura.md](docs/arquitetura.md): camadas, fluxo de dados e build.
- [docs/banco-de-dados.md](docs/banco-de-dados.md): tabelas e segurança no Supabase.
- [docs/deploy.md](docs/deploy.md): publicação na Vercel e variáveis de ambiente.
- [CLAUDE.md](CLAUDE.md): regras do repositório para agentes de IA.

## Licença

© Marcus Leal. Todos os direitos reservados.
