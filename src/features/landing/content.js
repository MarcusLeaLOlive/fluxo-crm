/* Textos da página de apresentação, separados da marcação. */

export const NAV_ITEMS = [
  { id: "recursos", label: "Recursos" },
  { id: "interface", label: "Interface" },
  { id: "tecnologia", label: "Tecnologia" },
  { id: "sobre", label: "Sobre" },
];

export const FEATURES = [
  { icon: "board", title: "Funil arrastável", text: "Mova negócios entre etapas com o mouse ou pelo teclado, com opção de desfazer." },
  { icon: "pie", title: "Previsão de receita", text: "Valor em aberto, previsão ponderada pela probabilidade e taxa de conversão em tempo real." },
  { icon: "bell", title: "Atividades e alertas", text: "Cada negócio tem uma próxima atividade. Atrasos e pendências ficam destacados." },
  { icon: "form", title: "Formulários validados", text: "Máscaras de CNPJ e telefone, validação por campo e aviso antes de descartar alterações." },
  { icon: "chart", title: "Painel e relatórios", text: "Gráficos de previsão por mês, origem dos leads e desempenho da equipe, com exportação em CSV." },
  { icon: "shield", title: "Acessível e personalizável", text: "Tema claro ou escuro salvo no navegador, navegação por teclado, leitores de tela e respeito a movimento reduzido." },
];

export const PRACTICES = [
  "Componentes pequenos e reutilizáveis, separados por funcionalidade",
  "Hooks próprios para dados, formulário, atalhos e foco",
  "Banco PostgreSQL (Supabase) com login real e Row Level Security",
  "Regras de negócio em funções puras, cobertas por testes (Vitest)",
  "Design tokens em CSS custom properties, com tema claro e escuro",
  "Layout responsivo do celular ao desktop",
];

export const STACK = ["React 18", "Vite", "Supabase", "PostgreSQL", "JavaScript ES2022", "CSS moderno", "Motion", "Vitest", "WAI-ARIA"];
