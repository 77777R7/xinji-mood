#!/usr/bin/env node
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'tmp', 'web-8083');
const port = Number(process.env.PORT || 8083);

const mimeByExtension = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!existsSync(path.join(outDir, 'index.html'))) {
  console.error('Missing tmp/web-8083/index.html. Run npm run web:8083 once first.');
  process.exit(1);
}

async function resolveStaticFile(requestUrl) {
  const parsedUrl = new URL(requestUrl || '/', `http://localhost:${port}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(outDir, safePath);

  if (!filePath.startsWith(outDir)) {
    return null;
  }

  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile() ? filePath : null;
  } catch {
    return null;
  }
}

const server = http.createServer(async (request, response) => {
  const filePath = await resolveStaticFile(request.url);

  if (!filePath) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, {
    'cache-control': 'no-store, max-age=0',
    'content-type': mimeByExtension[extension] || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, '::', () => {
  console.log(`Rora Mood existing web build served at http://localhost:${port}/`);
});

