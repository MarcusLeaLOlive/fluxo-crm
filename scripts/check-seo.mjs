#!/usr/bin/env node
/**
 * Valida o SEO técnico de um site JÁ PUBLICADO, buscando os arquivos como um
 * robô de busca faria (HTML bruto, sem executar JavaScript).
 *
 *   npm run seo:check -- https://seu-dominio.com.br
 *
 * Verifica robots.txt, sitemap.xml, llms.txt, canonical, title, description,
 * robots/noindex, hierarquia de títulos, JSON-LD e âncoras internas.
 * Sai com código 1 se algo falhar.
 */

const base = (process.argv[2] || "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Uso: npm run seo:check -- https://seu-dominio.com.br");
  process.exit(2);
}

const results = [];
const pass = (msg) => results.push(["OK   ", msg]);
const fail = (msg) => results.push(["FALHA", msg]);
const warn = (msg) => results.push(["AVISO", msg]);
const check = (ok, msg, detail = "") => (ok ? pass(msg) : fail(detail ? `${msg} (${detail})` : msg));

async function get(url) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "FluxoSEOCheck/1.0 (+robots)" } });
    return { url, status: res.status, type: res.headers.get("content-type") || "", robotsHeader: res.headers.get("x-robots-tag") || "", body: await res.text() };
  } catch (error) {
    return { url, status: 0, type: "", robotsHeader: "", body: "", error: error.message };
  }
}

const attr = (tag, name) => tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"))?.[1];
const metaContent = (html, name) => {
  const tag = html.match(new RegExp(`<meta[^>]+(?:name|property)\\s*=\\s*"${name}"[^>]*>`, "i"))?.[0];
  return tag ? attr(tag, "content") : undefined;
};
const stripTags = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/* ---------- 0. Endereço ---------- */
if (/seu-dominio|example\.|localhost|127\.0\.0\.1/.test(base)) warn(`Endereço ${base} parece provisório ou local; publique com o domínio definitivo.`);

/* ---------- 1. robots.txt ---------- */
const robots = await get(`${base}/robots.txt`);
check(robots.status === 200, "robots.txt responde 200", `status ${robots.status}`);
check(/text\/plain/i.test(robots.type), "robots.txt é text/plain", robots.type || "sem content-type");
check(/^user-agent:\s*\*/im.test(robots.body), "robots.txt tem regra para todos os robôs (User-agent: *)");
check(!/^disallow:\s*\/\s*$/im.test(robots.body), "robots.txt não bloqueia o site inteiro");
const sitemapUrl = robots.body.match(/^sitemap:\s*(\S+)/im)?.[1];
check(Boolean(sitemapUrl), "robots.txt aponta para o sitemap");
if (sitemapUrl) check(sitemapUrl === `${base}/sitemap.xml`, "Sitemap no robots.txt usa o domínio publicado", sitemapUrl);

/* ---------- 2. sitemap.xml ---------- */
const sitemap = await get(sitemapUrl || `${base}/sitemap.xml`);
check(sitemap.status === 200, "sitemap.xml responde 200", `status ${sitemap.status}`);
check(/xml/i.test(sitemap.type), "sitemap.xml é XML", sitemap.type || "sem content-type");
check(/<urlset[^>]+sitemaps\.org\/schemas\/sitemap\/0\.9/.test(sitemap.body), "sitemap.xml usa o padrão sitemaps.org");
const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1].trim()));
check(locs.length > 0, `sitemap.xml lista ${locs.length} URL(s)`);
for (const loc of locs) check(loc.startsWith(`${base}/`), `URL do sitemap no domínio publicado: ${loc}`);

/* ---------- 3. Páginas do sitemap ---------- */
const pages = new Map();
for (const loc of locs) {
  const page = await get(loc);
  pages.set(loc, page);
  const label = new URL(loc).pathname;
  const html = page.body;
  check(page.status === 200, `${label}: responde 200`, `status ${page.status}`);
  check(/text\/html/i.test(page.type), `${label}: é text/html`, page.type);
  check(/<html[^>]+lang="pt-BR"/i.test(html), `${label}: <html lang="pt-BR">`);
  check(/<meta[^>]+charset="?utf-8/i.test(html), `${label}: charset UTF-8`);
  check(/<meta[^>]+name="viewport"/i.test(html), `${label}: meta viewport`);

  const title = decode(stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ""));
  check(title.length >= 30 && title.length <= 65, `${label}: title com 30–65 caracteres`, `${title.length}: "${title}"`);
  const description = decode(metaContent(html, "description") || "");
  check(description.length >= 70 && description.length <= 160, `${label}: meta description com 70–160 caracteres`, `${description.length}`);

  const canonicals = [...html.matchAll(/<link[^>]+rel="canonical"[^>]*>/gi)].map((m) => attr(m[0], "href"));
  check(canonicals.length === 1, `${label}: exatamente um canonical`, `${canonicals.length}`);
  check(canonicals[0] === loc, `${label}: canonical aponta para a própria URL`, canonicals[0]);
  check(metaContent(html, "og:url") === loc, `${label}: og:url igual ao canonical`);

  const robotsMeta = metaContent(html, "robots") || "";
  check(!/noindex/i.test(robotsMeta) && !/noindex/i.test(page.robotsHeader), `${label}: indexável (sem noindex)`);

  // Conteúdo no HTML bruto: o que robôs sem JavaScript enxergam.
  const body = html.split(/<body[^>]*>/i)[1] || "";
  const levels = [...body.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const h1s = levels.filter((l) => l === 1).length;
  check(h1s === 1, `${label}: exatamente um H1 no HTML servido (sem JavaScript)`, `${h1s}`);
  const skip = levels.findIndex((l, i) => i > 0 && l > levels[i - 1] + 1);
  check(skip === -1, `${label}: títulos sem pular nível (H1 → H2 → H3)`, skip >= 0 ? `H${levels[skip - 1]} → H${levels[skip]}` : "");
  check(/<main\b/i.test(body), `${label}: elemento <main> presente`);
  const textLength = stripTags(body.replace(/<script[\s\S]*?<\/script>/gi, "")).length;
  check(textLength > 500, `${label}: conteúdo textual no HTML servido`, `${textLength} caracteres`);
  const imgsWithoutAlt = [...body.matchAll(/<img\b[^>]*>/gi)].filter((m) => !/\balt=/.test(m[0])).length;
  check(imgsWithoutAlt === 0, `${label}: imagens com alt`, `${imgsWithoutAlt} sem alt`);

  // Dados estruturados.
  const blocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  check(blocks.length > 0, `${label}: JSON-LD presente`);
  for (const raw of blocks) {
    try {
      const data = JSON.parse(raw);
      const nodes = data["@graph"] || [data];
      check(/schema\.org/.test(data["@context"]), `${label}: JSON-LD válido (${nodes.map((n) => n["@type"]).join(", ")})`);
      for (const node of nodes) {
        for (const key of ["url", "@id"]) {
          if (node[key] && !String(node[key]).startsWith(base)) fail(`${label}: JSON-LD ${node["@type"]}.${key} fora do domínio (${node[key]})`);
        }
      }
    } catch (error) {
      fail(`${label}: JSON-LD não é um JSON válido (${error.message})`);
    }
  }

  // Âncoras internas (#id) precisam existir no HTML; #app é a rota da demonstração.
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const anchors = [...new Set([...body.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))].filter((a) => a !== "app");
  const missing = anchors.filter((a) => !ids.has(a));
  check(missing.length === 0, `${label}: âncoras internas existem (${anchors.length})`, missing.join(", "));
}

/* ---------- 4. llms.txt ---------- */
const llms = await get(`${base}/llms.txt`);
check(llms.status === 200, "llms.txt responde 200", `status ${llms.status}`);
check(/text\/(plain|markdown)/i.test(llms.type), "llms.txt é texto", llms.type || "sem content-type");
check(/^# \S/.test(llms.body), "llms.txt começa com o título (# Nome)");
check(/^> \S/m.test(llms.body), "llms.txt tem resumo em citação (> ...)");
const links = [...llms.body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
check(links.length > 0, `llms.txt lista ${links.length} link(s)`);
const checked = new Map();
for (const link of links) {
  const [url, hash] = link.split("#");
  if (!checked.has(url)) checked.set(url, pages.get(url) || (await get(url)));
  const target = checked.get(url);
  check(target.status === 200, `llms.txt → ${link} responde 200`, `status ${target.status}`);
  if (hash && hash !== "app" && target.status === 200) check(new RegExp(`\\sid="${hash}"`).test(target.body), `llms.txt → #${hash} existe na página`);
}

/* ---------- Relatório ---------- */
const failures = results.filter(([s]) => s === "FALHA").length;
const warnings = results.filter(([s]) => s === "AVISO").length;
console.log(`\nValidação de SEO: ${base}\n`);
for (const [symbol, message] of results) console.log(`  ${symbol} ${message}`);
console.log(`\n${results.length - failures - warnings} ok, ${failures} falha(s), ${warnings} aviso(s)\n`);
process.exit(failures ? 1 : 0);
