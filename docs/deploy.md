# Deploy

O build gera um site estático em `dist/`, que funciona em qualquer hospedagem. A configuração pronta é para a Vercel (`vercel.json`).

## Vercel

1. Importe o repositório em vercel.com (*Add New > Project*). O `vercel.json` já define instalação, build e a pasta `dist`.
2. Em *Settings > Environment Variables*, cadastre:

| Variável | Valor | Obrigatória |
|---|---|---|
| `SITE_URL` | Endereço público, sem barra no final (ex.: `https://fluxo-crm.vercel.app`) | Sim, para o SEO |
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Não (sem ela, modo demonstração) |
| `VITE_SUPABASE_ANON_KEY` | Chave `anon` do Supabase | Não |

3. Faça o deploy. Depois de publicar, valide:

```bash
npm run seo:check -- https://fluxo-crm.vercel.app
```

4. No Supabase, ajuste *Authentication > URL Configuration* com o endereço publicado.
5. Cadastre o sitemap (`/sitemap.xml`) no Google Search Console.

## O que o vercel.json configura

- Cabeçalhos de segurança: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` e `Strict-Transport-Security`.
- Cache longo e imutável para `/assets/` (arquivos com hash no nome) e cache curto para `robots.txt`, `sitemap.xml`, `llms.txt` e manifest.
- Tipo de conteúdo correto para `llms.txt` e `site.webmanifest`.
- `public/404.html` é servido automaticamente para endereços inexistentes.

## Outras hospedagens

Netlify, GitHub Pages ou Cloudflare Pages: comando de build `npm run build`, pasta de publicação `dist`, mesmas variáveis de ambiente.
