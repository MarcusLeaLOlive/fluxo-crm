/**
 * Plugin do Vite que centraliza o SEO a partir de src/config/site.js:
 * - substitui %SITE_URL%, %SITE_TITLE% e %SITE_DESCRIPTION% no index.html;
 * - gera robots.txt, sitemap.xml e llms.txt no build.
 * O endereço pode ser sobrescrito com a variável de ambiente SITE_URL.
 */
import { SITE } from "../src/config/site.js";
import { FEATURES } from "../src/features/landing/content.js";

/** Páginas indexáveis. O site é uma página única; a demonstração (#app) é a mesma URL. */
const PAGES = [{ path: "/", changefreq: "monthly", priority: "1.0" }];

const xmlEscape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function seoPlugin() {
  const baseUrl = (process.env.SITE_URL || SITE.url).replace(/\/+$/, "");
  const today = new Date().toISOString().slice(0, 10);
  const tokens = {
    "%SITE_URL%": baseUrl,
    "%SITE_TITLE%": SITE.title,
    "%SITE_DESCRIPTION%": SITE.description,
    "%SITE_AUTHOR%": SITE.author,
  };

  const robots = [
    "# Fluxo: todas as páginas públicas podem ser rastreadas.",
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n");

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...PAGES.map(
      (p) =>
        `  <url>\n    <loc>${xmlEscape(baseUrl + p.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
    ),
    "</urlset>",
    "",
  ].join("\n");

  const repo = SITE.links.repository;
  const llms = [
    `# ${SITE.product}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.product} é um ${SITE.role.toLowerCase()} de ${SITE.author}. É uma aplicação de página única: a apresentação fica em ${baseUrl}/ e a demonstração interativa do CRM abre no mesmo endereço, em ${baseUrl}/#app (os dados de exemplo ficam só no navegador de quem usa).`,
    "",
    "## Páginas",
    "",
    `- [Apresentação](${baseUrl}/): o que é o Fluxo, recursos, técnicas de interface, tecnologias e autor.`,
    `- [Demonstração do CRM](${baseUrl}/#app): funil de vendas, lista, painel com gráficos e cadastro de negócios, com dados de exemplo.`,
    "",
    "## Seções da apresentação",
    "",
    `- [Recursos](${baseUrl}/#recursos): funcionalidades do CRM.`,
    `- [Interface](${baseUrl}/#interface): bento grid, glassmorphism leve, gradient mesh, hover lift, scroll reveal e tipografia fluida.`,
    `- [Tecnologia](${baseUrl}/#tecnologia): como o projeto foi construído.`,
    `- [Sobre](${baseUrl}/#sobre): autor do projeto.`,
    "",
    "## Recursos do produto",
    "",
    ...FEATURES.map((f) => `- ${f.title}: ${f.text}`),
    "",
    "## Tecnologias",
    "",
    "- React 18, Vite, JavaScript (ES2022), CSS com custom properties, Motion (animações), Vitest e axe-core.",
    "",
    "## Opcional",
    "",
    `- [Sitemap](${baseUrl}/sitemap.xml)`,
    ...(repo ? [`- [Código-fonte](${repo})`] : []),
    "",
  ].join("\n");

  return {
    name: "fluxo-seo",
    // "pre": substitui os marcadores antes de o Vite processar os atributos do HTML.
    transformIndexHtml: {
      order: "pre",
      handler: (html) => Object.entries(tokens).reduce((out, [token, value]) => out.replaceAll(token, value), html),
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      this.emitFile({ type: "asset", fileName: "llms.txt", source: llms });
    },
  };
}
