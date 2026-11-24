# PRODUCT.md

## Visão

Fluxo é um CRM de funil de vendas para pequenas equipes comerciais: mostra em que etapa cada negócio está, qual é o próximo passo e quanto deve entrar de receita. É também um projeto de portfólio que demonstra desenvolvimento front-end completo, de interface a banco de dados.

## Público

- **Vendedores e donos de pequenas empresas** que hoje controlam vendas em planilha ou no WhatsApp.
- **Recrutadores e avaliadores técnicos**, que usam a demonstração para conhecer o trabalho do autor.

## Problemas que resolve

1. Negócios esquecidos: falta de uma próxima atividade definida.
2. Previsão de receita no "achismo".
3. Informação espalhada entre planilhas, conversas e anotações.

## Funcionalidades

| Área | O que faz |
|---|---|
| Funil | Seis etapas (Prospecção, Qualificação, Proposta, Negociação, Ganho, Perdido); arrastar com o mouse ou mover pelo teclado; desfazer |
| Negócios | Cadastro com empresa, CNPJ, contato, valor, probabilidade, origem, responsável e previsão de fechamento; motivo obrigatório para perdas |
| Atividades | Próxima atividade com data; alertas de atraso e de negócio sem atividade; histórico automático |
| Indicadores | Valor em aberto, previsão ponderada, total ganho e taxa de conversão |
| Painel | Gráficos de previsão por mês, valor por etapa, origem dos leads e desempenho por responsável |
| Busca e filtros | Busca em tempo real com destaque; filtros por responsável, origem e atividade com contagem |
| Exportação | CSV pronto para Excel |
| Conta | Cadastro, login, confirmação de e-mail e recuperação de senha (Supabase); modo demonstração sem conta |
| Preferências | Tema claro ou escuro salvo; atalhos de teclado |

## Fora do escopo (por enquanto)

- Equipes compartilhando o mesmo funil (hoje cada usuário vê só os próprios negócios).
- Integrações com e-mail, WhatsApp ou calendário.
- Aplicativo móvel nativo (o site funciona no celular e pode ser instalado como app pelo navegador).

## Próximos passos

1. Equipes e permissões: tabela `teams` e políticas RLS por equipe.
2. Lembretes de atividades por e-mail.
3. Importação de negócios por CSV.
4. Testes de ponta a ponta automatizados no CI (Playwright).

## Indicadores de qualidade

- Testes unitários passando (`npm test`).
- Zero violações no axe-core nos temas claro e escuro.
- `npm run seo:check` sem falhas no endereço publicado.
- Página de apresentação legível sem JavaScript (pré-renderizada).
