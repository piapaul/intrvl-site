#!/usr/bin/env node
// intrvl build script.
//
// Source of truth:   src/shared/styles.css   - the CSS every page shares
//                    src/shared/core.js      - the JavaScript every page shares
//                    src/pages/*.html        - what is different on each page
//
// Output:            blocks/*.html           - pasted/loaded by the Squarespace pages (self-contained)
//                    app/*.html + app/sw.js  - the installable, offline-capable copy (GitHub Pages)
//
// Run:  node build.mjs          (writes the output)
//       node build.mjs --check  (fails if the output is out of date; writes nothing)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const CHECK = process.argv.includes('--check');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

const css = read('src', 'shared', 'styles.css');
const js = read('src', 'shared', 'core.js');
const appCss = fs.existsSync(path.join(SRC, 'app', 'app.css')) ? read('src', 'app', 'app.css') : '';
const pages = fs.readdirSync(path.join(SRC, 'pages')).filter(f => f.endsWith('.html')).sort();

const outputs = new Map();   // relative path -> contents

function expand(template) {
  return template
    .replace('<!--@shared-css-->', () => '<style>\n' + css + '</style>')
    .replace('<!--@shared-js-->', () => '<script>\n' + js + '</script>');
}

// ---- 1. Squarespace blocks (unchanged way of loading) ------------------------------------------
for (const f of pages) {
  outputs.set('blocks/' + f, expand(read('src', 'pages', f)));   // no extra header: these are loaded straight into Squarespace
}

// ---- 2. Installable app -------------------------------------------------------------------------
const appCfgPath = path.join(SRC, 'app', 'app.json');
if (fs.existsSync(appCfgPath)) {
  const cfg = JSON.parse(read('src', 'app', 'app.json'));
  const pageIcon = (name) => cfg.pageIcons[name] || 'home';
  const appPages = [];

  for (const f of pages) {
    const name = f.replace(/\.html$/, '');                      // intrvl, intrvl-intervals, ...
    const outName = name === 'intrvl' ? 'index.html' : f;
    const icon = pageIcon(name);
    const head =
      '<!doctype html>\n<html lang="en-GB">\n<head>\n' +
      '<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<meta name="theme-color" content="' + cfg.themeColor + '">\n' +
      '<meta name="apple-mobile-web-app-capable" content="yes">\n' +
      '<meta name="mobile-web-app-capable" content="yes">\n' +
      '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n' +
      '<link rel="manifest" href="manifest.webmanifest">\n' +
      '<link rel="apple-touch-icon" sizes="180x180" href="../icons/' + icon + '-180.png">\n' +
      '<link rel="icon" type="image/png" href="../icons/' + icon + '-180.png">\n' +
      '<title>intrvl</title>\n' +
      '<link rel="stylesheet" href="fonts/fonts.css">\n' +
      '<style>\n' + appCss + '</style>\n' +
      '</head>\n<body>\n' +
      '<script>window.INTRVL_STANDALONE = true;</script>\n<main>\n';
    const tail = '\n</main>\n<script>if ("serviceWorker" in navigator) addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });</script>\n</body>\n</html>\n';
    // The Google Fonts @import in the shared CSS is replaced by the self-hosted fonts in the app.
    let body = expand(read('src', 'pages', f)).replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']*'\);\n?/g, '');
    outputs.set('app/' + outName, head + body + tail);
    appPages.push(outName);
  }

  outputs.set('app/manifest.webmanifest', JSON.stringify({
    name: cfg.name, short_name: cfg.shortName, description: cfg.description,
    start_url: './index.html', scope: './', id: './index.html',
    display: 'standalone', orientation: 'portrait',
    background_color: cfg.backgroundColor, theme_color: cfg.themeColor, lang: 'en-GB',
    icons: [
      { src: '../icons/home-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '../icons/home-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '../icons/home-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2) + '\n');

  // Service worker: the cache name changes whenever any app file changes, so updates always arrive.
  const staticFiles = ['fonts/fonts.css', ...fs.readdirSync(path.join(ROOT, 'app', 'fonts')).filter(x => x.endsWith('.woff2')).map(x => 'fonts/' + x)];
  const iconFiles = Object.values(cfg.pageIcons).concat(['home']).filter((v, i, a) => a.indexOf(v) === i)
    .flatMap(k => ['../icons/' + k + '-180.png']).concat(['../icons/home-192.png', '../icons/home-512.png', '../icons/home-maskable-512.png']);
  const precache = ['./', 'manifest.webmanifest', ...appPages, ...staticFiles, ...iconFiles];
  const hash = crypto.createHash('sha256');
  for (const [k, v] of [...outputs.entries()].filter(([k]) => k.startsWith('app/')).sort()) hash.update(k + '\0' + v);
  for (const f of staticFiles) hash.update(fs.readFileSync(path.join(ROOT, 'app', f)));
  const swTemplate = read('src', 'app', 'sw.js');
  outputs.set('app/sw.js', swTemplate
    .replace('__VERSION__', hash.digest('hex').slice(0, 12))
    .replace('__PRECACHE__', JSON.stringify(precache, null, 2)));
}

// ---- write / check ------------------------------------------------------------------------------
let stale = 0;
for (const [rel, text] of outputs) {
  const file = path.join(ROOT, rel);
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (existing === text) continue;
  stale++;
  if (CHECK) { console.error('out of date: ' + rel); continue; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log('wrote ' + rel);
}
if (CHECK && stale) { console.error('\nRun "node build.mjs" to update.'); process.exit(1); }
console.log(stale ? '' : 'Everything is up to date.');
