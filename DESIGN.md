# DESIGN.md

Sistema visual do Fluxo. Os valores de referência ficam em `src/styles/tokens.css`; este documento explica as decisões.

## Princípios

1. **Clareza antes de efeito.** A interface serve para decidir rápido o próximo passo de uma venda.
2. **Poucas técnicas, aplicadas com consistência**: bento grid, glassmorphism leve, gradient mesh, hover lift, scroll reveal e tipografia fluida. Nada além disso sem motivo.
3. **A cor carrega significado.** O verde-petróleo indica avanço no funil; vermelho e âmbar são reservados para alertas.
4. **Acessível por padrão**: contraste AA, foco visível, teclado e movimento reduzido.

## Cor

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--paper` | `#F7F8FA` | `#070C11` | Fundo da página |
| `--surface` | `#FFFFFF` | `#0E151C` | Cards, painéis, campos |
| `--ink` | `#0F1B26` | `#EDF2F6` | Texto principal |
| `--ink-2` | `#475467` | `#A7B3BF` | Texto secundário |
| `--ink-3` | `#5F6E7D` | `#8794A2` | Legendas e rótulos |
| `--line` | `#E6EAEE` | `#19232D` | Bordas e divisores |
| `--accent` | `#0E6B66` | `#5FB8AF` | Ação principal, foco |
| `--accent-2` | `#1D5D8C` | `#5D9BD0` | Segundo tom dos gradientes |
| `--won` / `--lost` / `--warn` | `#2F8A57` / `#B0444D` / `#C98A2B` | variações claras | Status: ganho, perdido/atraso, sem atividade |

**Etapas do funil** usam uma escala sequencial do mesmo tom (`--stage-1` a `--stage-4`), do mais claro (prospecção) ao mais escuro (negociação). Ganho e perdido usam as cores de status.

**Gráficos** usam duas séries validadas para contraste e daltonismo: `--series-1` (`#00897B` / `#1FA394`) e `--series-2` (`#3F7BD6` / `#5E8FE6`).

O tema escuro tem tokens próprios (não é uma inversão automática) e é aplicado pela classe `theme-dark` no `<html>`; a escolha fica salva em `localStorage` (`fluxo-theme`).

## Tipografia

- Família única: **Geist** (fallback `system-ui`), com números tabulares.
- Escala fluida com `clamp()`: `--fs-xs` (11,5 a 12,5 px) até `--fs-display` (36 a 58 px).
- Títulos com `letter-spacing` negativo (-0,02 a -0,045em) e `text-wrap: balance`.
- Linhas de texto com no máximo cerca de 60 caracteres.

## Espaçamento, raio e sombra

- Espaçamento em escala de 4: `--space-1` (4 px) a `--space-9` (112 px).
- Raios: 6 (`sm`), 10 (padrão), 14 (`lg`), 20 px (`xl`). Cards grandes usam `lg` ou `xl`.
- Sombras em camadas, sempre suaves: `--shadow-xs` a `--shadow-lg`.

## Componentes

| Componente | Notas |
|---|---|
| Botão | Variantes `primary` (gradiente), `ghost`, `danger`, `light`, `text`; tamanhos `sm`, `md`, `lg`; estado `loading` com indicador |
| Campo | Rótulo sempre visível, mensagem de erro abaixo, estados válido/inválido, máscaras para CNPJ e telefone |
| Card | Superfície com borda de 1 px e sombra leve; levemente translúcido sobre a malha de gradientes |
| Cartão de negócio | Título, empresa, valor, responsável (avatar) e próxima atividade com indicador de status |
| Gráficos | Feitos à mão; tooltip ao passar o mouse e tabela de dados acessível em cada gráfico |
| Avisos (toast) | Tipos `success`, `error` e `info`, com ação opcional ("Desfazer") |
| Janelas | Painel lateral (negócio) e modal (conta), com foco preso e Esc para fechar |

Ícones: SVG próprios em `src/components/ui/Icon.jsx`, traço de 1,6 px, herdam a cor do texto. **Não use emojis.**

## Movimento

- Duas famílias: **entrada/scroll reveal** (opacidade + deslocamento curto) e **hover lift** (elevação de 2 a 6 px, só com mouse).
- Durações de 200 a 800 ms; curva padrão `cubic-bezier(.16, 1, .3, 1)`.
- Motion (biblioteca) apenas para o que o CSS não faz bem: cartão que muda de coluna, barras dos gráficos, entrada e saída de janelas e avisos.
- Com `prefers-reduced-motion`, todas as animações são desligadas.

## Layout

- Contêiner com largura máxima de 1240 px e margem lateral fluida (`--gutter`).
- Pontos de quebra principais: 1080, 980, 760, 560 e 480 px.
- No celular, as colunas do funil rolam na horizontal com encaixe, e o cabeçalho do CRM passa o seletor de visão para uma linha própria.
