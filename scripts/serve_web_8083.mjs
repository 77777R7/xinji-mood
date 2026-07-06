#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createReadStream, existsSync } from 'node:fs';
import { readFile, rm, stat, writeFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outDirRelative = path.join('tmp', 'web-8083');
const outDir = path.join(projectRoot, outDirRelative);
const expoBin = path.join(projectRoot, 'node_modules', '.bin', 'expo');
const port = Number(process.env.PORT || 8083);
const exportTimeoutMs = Number(process.env.WEB_8083_EXPORT_TIMEOUT_MS || 600_000);
const shouldClearMetroCache = process.env.WEB_8083_CLEAR === '1';

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

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      detached: true,
      shell: false,
      ...options,
    });
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {}
      reject(
        new Error(
          `${command} ${args.join(' ')} timed out after ${Math.round(
            exportTimeoutMs / 1000,
          )}s. Restart npm run web:8083 to force a fresh export.`,
        ),
      );
    }, exportTimeoutMs);

    child.on('error', (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    child.on('exit', (code) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

function assertPortAvailable(targetPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        reject(
          new Error(
            `Port ${targetPort} is already in use. Stop the old 8083 server first so you do not view a stale bundle.`,
          ),
        );
        return;
      }

      reject(error);
    });

    server.once('listening', () => {
      server.close(resolve);
    });

    server.listen(targetPort, '::');
  });
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
    if (fileStat.isFile()) {
      return filePath;
    }
  } catch {
    return null;
  }

  return null;
}

async function writeBuildInfo() {
  const indexPath = path.join(outDir, 'index.html');
  const indexHtml = existsSync(indexPath) ? await readFile(indexPath, 'utf8') : '';
  const bundleMatch = indexHtml.match(/\/_expo\/static\/js\/web\/[^"]+\.js/);
  const payload = {
    builtAt: new Date().toISOString(),
    command: 'npm run web:8083',
    bundle: bundleMatch?.[0] || null,
  };

  await writeFile(path.join(outDir, 'BUILD_INFO.json'), JSON.stringify(payload, null, 2));

  return payload;
}

async function main() {
  await assertPortAvailable(port);
  await rm(outDir, { recursive: true, force: true });
  const exportArgs = [
    'export',
    '--platform',
    'web',
    '--no-minify',
    '--max-workers',
    '4',
    '--output-dir',
    outDirRelative,
  ];

  if (shouldClearMetroCache) {
    exportArgs.splice(3, 0, '--clear');
  }

  await run(expoBin, exportArgs, {
    env: { ...process.env, EXPO_NO_TELEMETRY: '1' },
  });

  const buildInfo = await writeBuildInfo();
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

  server.listen(port, () => {
    console.log(`Rora Mood fresh web build served at http://localhost:${port}/`);
    console.log(`Build: ${buildInfo.builtAt}`);
    console.log(`Bundle: ${buildInfo.bundle || 'unknown'}`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
