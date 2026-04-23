#!/usr/bin/env node
// Concatenates the JSX source files into a self-contained index.html
const fs = require('fs');
const path = require('path');

const ORDER = [
  'proto-tokens.jsx',
  'proto-locations.jsx',
  'proto-store.jsx',
  'proto-audio.jsx',
  'proto-ui.jsx',
  'proto-music.jsx',
  'proto-screens.jsx',
  'proto-app.jsx',
];

const bundle = ORDER.map(f => {
  const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
  return `\n// ${'═'.repeat(55)}\n// ${f}\n// ${'═'.repeat(55)}\n${src}`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Dope Wars — Interactive Prototype</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=VT323&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@500;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; padding: 0; overflow: hidden; background: #0a0118; font-family: 'Space Grotesk', system-ui, sans-serif; }
  * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
  button { font-family: inherit; }
  ::-webkit-scrollbar { width: 0; height: 0; }
</style>
</head>
<body>
<div id="proto-root"></div>

<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js"></script>

<script type="text/babel">
${bundle}
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log(`Built index.html (${(html.length / 1024).toFixed(1)} KB)`);
