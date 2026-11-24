# Banco de dados

PostgreSQL no Supabase. O esquema completo está em `supabase/migrations/20261124000000_init.sql`.

## Tabelas

**profiles**: um perfil por usuário, criado automaticamente no cadastro (gatilho `on_auth_user_created`).

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid | Igual a `auth.users.id` |
| `name` | text | Nome exibido |

**deals**: negócios.

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | text | Chave primária (gerada no app) |
| `owner_id` | uuid | Dono; preenchido com `auth.uid()` |
| `titulo` | text | Obrigatório |
| `etapa` | text | `prosp`, `qual`, `prop`, `neg`, `ganho` ou `perdido` |
| `motivo_perda` | text | Obrigatório quando `etapa = 'perdido'` |
| `valor` | numeric(14,2) | Maior ou igual a zero |
| `prob` | smallint | De 0 a 100 |
| `fechamento`, `atv_data` | date | Previsão de fechamento e data da próxima atividade |
| demais | text | Empresa, CNPJ, contato, cargo, e-mail, telefone, cidade, origem, responsável, atividade |

**deal_logs**: histórico de cada negócio (somente inclusão). Removido em cascata com o negócio.

## Segurança (Row Level Security)

Todas as tabelas têm RLS ativado. Cada usuário autenticado só lê, cria, altera e exclui as próprias linhas (`owner_id = auth.uid()`). Visitantes sem login não têm acesso. O histórico só aceita registros de negócios do próprio usuário.

Por isso a chave `anon` pode ficar no navegador: mesmo usada fora do app, ela não dá acesso a dados de outras pessoas.

## Como aplicar

1. Crie um projeto em supabase.com.
2. No **SQL Editor**, execute o arquivo da migração. Alternativa com a CLI: `supabase link --project-ref SEU_REF` e `supabase db push`.
3. Em **Authentication > URL Configuration**, defina o *Site URL* e os *Redirect URLs* (inclua `http://localhost:5173` para desenvolvimento).

## Evolução

Mudanças no esquema entram como novos arquivos em `supabase/migrations/`, com data no nome. Nunca edite uma migração já aplicada.
