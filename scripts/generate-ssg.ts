import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Ensure all tools are registered in the registry
import { registry } from '../src/core/registry';
import '../src/tools/index';
import { TOOL_SEO_DATA } from '../src/core/seo-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

const SITE_URL = 'https://anubhav0712.github.io/tools';

function getApplicationCategory(cat: string): string {
  switch (cat) {
    case 'finance':
      return 'FinanceApplication';
    case 'developer':
      return 'DeveloperApplication';
    case 'crypto':
      return 'SecurityApplication';
    case 'visual':
      return 'MultimediaApplication';
    case 'converter':
    case 'text':
    case 'everyday':
    default:
      return 'UtilityApplication';
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function run() {
  console.log('🚀 Starting Static Site Pre-rendering (SSG) & SEO Engine...');

  if (!fs.existsSync(DIST_DIR)) {
    throw new Error(`dist directory not found at ${DIST_DIR}. Run vite build first.`);
  }

  const baseHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    throw new Error(`dist/index.html not found at ${baseHtmlPath}`);
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

  // Extract asset tags (JS bundle and CSS bundle)
  const scriptMatch = baseHtml.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
  const styleMatch = baseHtml.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);

  const scriptSrc = scriptMatch ? scriptMatch[1] : './assets/index.js';
  const styleHref = styleMatch ? styleMatch[1] : './assets/index.css';

  const allTools = registry.getAll();
  console.log(`Found ${allTools.length} registered tools to pre-render.`);

  const today = new Date().toISOString().split('T')[0];
  const sitemapUrls: string[] = [];

  // Add homepage
  sitemapUrls.push(`
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

  // Process each tool
  for (const tool of allTools) {
    const toolId = tool.metadata.id;
    const toolDir = path.join(DIST_DIR, toolId);
    if (!fs.existsSync(toolDir)) {
      fs.mkdirSync(toolDir, { recursive: true });
    }

    const seo = TOOL_SEO_DATA[toolId] || {
      metaTitle: `${tool.metadata.name} — 100% In-Browser & Free | Tools`,
      metaDescription: tool.metadata.description,
      howToUse: ['Enter your input values in the tool fields.', 'View instant, real-time calculations locally.', 'Export or copy your results with zero cloud upload.'],
      faqs: [
        {
          question: `Is ${tool.metadata.name} completely free and private?`,
          answer: `Yes, 100%. All processing occurs strictly inside your browser memory with zero network calls and zero data logging.`,
        },
      ],
      relatedToolIds: [],
    };

    const canonicalUrl = `${SITE_URL}/${toolId}/`;
    sitemapUrls.push(`
  <url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);

    // Schema.org WebApplication
    const schemaWebApp = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.metadata.name,
      url: canonicalUrl,
      description: seo.metaDescription,
      applicationCategory: getApplicationCategory(tool.metadata.category),
      operatingSystem: 'All modern web browsers',
      browserRequirements: 'Requires JavaScript',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        '100% In-Browser Privacy with Zero Cloud Storage',
        'Instant Client-Side Execution with Zero Latency',
        'Completely Free and Works Offline',
      ],
    };

    // Schema.org FAQPage
    const schemaFaq = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    };

    // Schema.org BreadcrumbList
    const schemaBreadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: tool.metadata.category.charAt(0).toUpperCase() + tool.metadata.category.slice(1),
          item: `${SITE_URL}/#category=${tool.metadata.category}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: tool.metadata.name,
          item: canonicalUrl,
        },
      ],
    };

    // Adjust relative asset paths (../assets/ instead of ./assets/)
    const relativeScript = scriptSrc.replace(/^\.\//, '../');
    const relativeStyle = styleHref.replace(/^\.\//, '../');

    // Crawlable pre-rendered HTML fallback inside root
    const preRenderedContent = `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <header class="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 py-3.5 px-4 sm:px-8">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <a href="../" class="flex items-center gap-2 text-slate-900 font-bold text-base hover:text-indigo-600 transition">
            <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">T</span>
            <span>Tools</span>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">100% In-Browser</span>
          </a>
          <nav class="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>🔒 Zero Server Egress</span>
          </nav>
        </div>
      </header>

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article class="flex flex-col gap-8 max-w-4xl mx-auto">
          <!-- Breadcrumb Navigation -->
          <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <a href="../" class="hover:text-indigo-600">Home</a>
            <span>/</span>
            <span class="capitalize">${escapeHtml(tool.metadata.category)}</span>
            <span>/</span>
            <span class="text-slate-800 font-semibold">${escapeHtml(tool.metadata.name)}</span>
          </nav>

          <!-- Tool Header -->
          <header class="flex flex-col gap-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-700 w-fit">
              <span>● Runs 100% Client-Side • Zero Cloud Uploads</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              ${escapeHtml(tool.metadata.name)}
            </h1>
            <p class="text-base sm:text-lg text-slate-600 leading-relaxed">
              ${escapeHtml(seo.metaDescription)}
            </p>
          </header>

          <!-- Interactive Container Placeholder -->
          <div id="tool-app-viewport" class="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center gap-3 min-h-[280px]">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg animate-pulse">
              ⚡
            </div>
            <h2 class="text-base font-semibold text-slate-900">Loading Interactive Application...</h2>
            <p class="text-xs text-slate-500 max-w-md">
              Initializing high-speed client-side execution sandbox in your browser. All computations run 100% locally on your device.
            </p>
            <noscript>
              <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium mt-3">
                JavaScript is required to use this interactive utility. Please enable JavaScript in your browser settings.
              </div>
            </noscript>
          </div>

          <!-- Editorial & How-to Guide Section -->
          <section class="mt-6 flex flex-col gap-6 pt-8 border-t border-slate-200">
            <h2 class="text-xl font-bold text-slate-900">How to Use ${escapeHtml(tool.metadata.name)}</h2>
            <ol class="grid grid-cols-1 sm:grid-cols-2 gap-3 list-decimal list-inside text-sm text-slate-700">
              ${seo.howToUse
                .map(
                  (step, idx) => `
                <li class="p-4 rounded-2xl bg-white border border-slate-200 leading-relaxed shadow-2xs">
                  <span class="font-semibold text-indigo-600 font-mono text-xs block mb-1">Step ${idx + 1}</span>
                  ${escapeHtml(step)}
                </li>`
                )
                .join('')}
            </ol>
          </section>

          <!-- Formulas & Standards (if applicable) -->
          ${
            tool.metadata.formulaCitations && tool.metadata.formulaCitations.length > 0
              ? `
          <section class="flex flex-col gap-4 pt-6 border-t border-slate-200">
            <h2 class="text-xl font-bold text-slate-900">Formulas & Regulatory Standards</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${tool.metadata.formulaCitations
                .map(
                  (f) => `
                <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2">
                  <h3 class="text-xs font-bold text-slate-900">${escapeHtml(f.name)}</h3>
                  <div class="p-2.5 rounded-lg bg-slate-50 font-mono text-xs text-indigo-900 border border-slate-200">${escapeHtml(f.formula)}</div>
                  <p class="text-xs text-slate-600">${escapeHtml(f.description)}</p>
                </div>`
                )
                .join('')}
            </div>
          </section>`
              : ''
          }

          <!-- FAQ Accordion -->
          <section class="flex flex-col gap-4 pt-6 border-t border-slate-200">
            <h2 class="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <div class="flex flex-col gap-3">
              ${seo.faqs
                .map(
                  (faq) => `
                <details class="group p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer" open>
                  <summary class="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition flex items-center justify-between">
                    <span>${escapeHtml(faq.question)}</span>
                    <span class="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p class="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    ${escapeHtml(faq.answer)}
                  </p>
                </details>`
                )
                .join('')}
            </div>
          </section>

          <!-- Related Tools (Topical Silo) -->
          ${
            seo.relatedToolIds && seo.relatedToolIds.length > 0
              ? `
          <section class="flex flex-col gap-4 pt-6 border-t border-slate-200">
            <h2 class="text-xl font-bold text-slate-900">Explore Related Utilities</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              ${seo.relatedToolIds
                .map((relId) => {
                  const relTool = registry.get(relId);
                  if (!relTool) return '';
                  return `
                  <a href="../${relId}/" class="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition flex flex-col justify-between gap-2 group">
                    <div>
                      <h3 class="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">${escapeHtml(relTool.metadata.name)}</h3>
                      <p class="text-[11px] text-slate-500 line-clamp-2 mt-1">${escapeHtml(relTool.metadata.description)}</p>
                    </div>
                    <span class="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">Open Tool →</span>
                  </a>`;
                })
                .join('')}
            </div>
          </section>`
              : ''
          }
        </article>
      </main>

      <footer class="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 font-mono mt-12">
        <p>100% In-Browser & Private Utilities • Zero Cloud Storage • Completely Free</p>
      </footer>
    </div>`;

    const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self';" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m18 15-6-6-6 6'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
    <title>${escapeHtml(seo.metaTitle)}</title>
    <meta name="description" content="${escapeHtml(seo.metaDescription)}" />
    <meta name="keywords" content="${escapeHtml(tool.metadata.keywords.join(', '))}" />
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(seo.metaTitle)}" />
    <meta property="og:description" content="${escapeHtml(seo.metaDescription)}" />
    <meta property="og:site_name" content="Tools" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${escapeHtml(seo.metaTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.metaDescription)}" />

    <!-- Schema.org JSON-LD Structured Data -->
    <script type="application/ld+json">
      ${JSON.stringify(schemaWebApp, null, 2)}
    </script>
    <script type="application/ld+json">
      ${JSON.stringify(schemaFaq, null, 2)}
    </script>
    <script type="application/ld+json">
      ${JSON.stringify(schemaBreadcrumbs, null, 2)}
    </script>

    <script type="module" crossorigin src="${relativeScript}"></script>
    <link rel="stylesheet" crossorigin href="${relativeStyle}">
  </head>
  <body class="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
    <div id="root">${preRenderedContent}</div>
  </body>
</html>`;

    fs.writeFileSync(path.join(toolDir, 'index.html'), htmlContent, 'utf-8');
  }

  // Generate sitemap.xml
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapContent, 'utf-8');
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapContent, 'utf-8');
  }
  console.log(`✅ Generated sitemap.xml with ${sitemapUrls.length} verified URLs.`);

  // Generate robots.txt
  const robotsContent = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsContent, 'utf-8');
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsContent, 'utf-8');
  }
  console.log(`✅ Generated robots.txt pointing to ${SITE_URL}/sitemap.xml.`);

  // Generate 404.html for GitHub Pages SPA routing fallback
  const fallback404 = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Tools — Redirecting</title>
    <script>
      // Single Page Apps for GitHub Pages
      // MIT License https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1;
      var l = window.location;
      var newUrl = l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash;
      l.replace(newUrl);
    </script>
  </head>
  <body>
    <p>Redirecting to requested tool...</p>
  </body>
</html>`;
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), fallback404, 'utf-8');
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.writeFileSync(path.join(PUBLIC_DIR, '404.html'), fallback404, 'utf-8');
  }
  console.log(`✅ Generated 404.html for SPA fallback.`);

  console.log(`🎉 Pre-rendering complete! Generated ${allTools.length} static tool pages.`);
}

run().catch((err) => {
  console.error('❌ SSG Generation failed:', err);
  process.exit(1);
});
