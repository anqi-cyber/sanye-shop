import { spawn } from 'node:child_process';
import { existsSync, watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

let backend = null;
let frontend = null;
let shuttingDown = false;
let restartingBackend = false;
let restartTimer = null;
const watchers = [];

function startBackend() {
  if (shuttingDown) return;
  restartingBackend = false;
  backend = spawn(process.execPath, ['server/index.js'], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  });

  backend.on('error', (error) => {
    console.error('[dev] 后端启动失败：', error.message);
  });

  backend.on('exit', (code) => {
    backend = null;
    if (shuttingDown || restartingBackend) return;
    console.error(`[dev] 后端已退出（code ${code ?? 0}），修改 server/ 文件后会自动重启。`);
  });
}

function scheduleBackendRestart(relativePath) {
  if (shuttingDown) return;
  if (!restartTimer) {
    console.log(`\n[dev] ${relativePath} 已变化，正在重启后端...`);
  }
  restartingBackend = true;
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restartTimer = null;
    const oldBackend = backend;
    backend = null;

    let started = false;
    const start = () => {
      if (started || shuttingDown) return;
      started = true;
      startBackend();
    };

    if (oldBackend) {
      oldBackend.once('exit', () => setTimeout(start, 100));
      oldBackend.kill();
      setTimeout(start, 900);
    } else {
      start();
    }
  }, 300);
}

function startFrontend() {
  frontend = spawn(
    process.execPath,
    [viteBin, '--configLoader', 'native', '--host', '127.0.0.1'],
    {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
      windowsHide: true,
    },
  );

  frontend.on('error', (error) => {
    console.error('[dev] 前端启动失败：', error.message);
    shutdown(1);
  });

  frontend.on('exit', (code) => {
    frontend = null;
    if (!shuttingDown) {
      console.error(`[dev] 前端已退出（code ${code ?? 0}）。`);
      shutdown(code || 1);
    }
  });
}

function watchBackendFiles() {
  for (const folder of ['server', 'shared']) {
    const target = path.join(root, folder);
    if (!existsSync(target)) continue;

    const watcher = watch(target, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      const relative = path
        .relative(root, path.join(target, String(filename)))
        .split(path.sep)
        .join('/');

      // 数据库写入会频繁触发事件，必须忽略，否则会无限重启。
      if (relative.startsWith('server/data/')) return;
      if (!/\.(js|json)$/.test(relative)) return;

      scheduleBackendRestart(relative);
    });
    watchers.push(watcher);
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  clearTimeout(restartTimer);
  for (const watcher of watchers) watcher.close();

  if (backend) backend.kill();
  if (frontend) frontend.kill();

  setTimeout(() => process.exit(code), 400).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

if (!existsSync(viteBin)) {
  console.error('[dev] 找不到 Vite，请先在项目目录执行 npm install。');
  process.exit(1);
}

console.log('\n  山野商店 · 开发模式');
console.log('  前端  http://127.0.0.1:5173');
console.log('  后端  http://127.0.0.1:3000/api/health');
console.log('  按 Ctrl+C 停止\n');

startBackend();
startFrontend();
watchBackendFiles();
