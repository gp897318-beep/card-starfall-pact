// serve.ts — tiny static server for local playtesting of game/.
// Usage: node serve.ts [port]  (default 8933)
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const port = parseInt(process.argv[2] || '8933', 10);
const root = join(new URL('.', import.meta.url).pathname, 'game');
const types: Record<string, string> = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
};
createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url || '/', 'http://x').pathname);
  const file = join(root, path === '/' ? 'index.html' : path);
  if (!existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(port, '127.0.0.1', () => console.log('serving game/ at http://127.0.0.1:' + port));
