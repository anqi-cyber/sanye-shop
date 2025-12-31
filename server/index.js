import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createStore } from './store.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;
const staticDir = path.resolve(currentDir, '../dist');
const hasBuild = existsSync(path.join(staticDir, 'index.html'));

const store = createStore();
const app = createApp({ store, staticDir });
const server = app.listen(port, () => {
  console.log(`\n  山野商店 API  http://127.0.0.1:${port}/api/health`);
  if (hasBuild) {
    console.log(`  商城页面      http://127.0.0.1:${port}\n`);
  } else {
    console.log(`  前端开发地址  http://127.0.0.1:5173`);
    console.log('  提示：npm start 前请先执行 npm run build\n');
  }
});

function shutdown(signal) {
  console.log(`\n收到 ${signal}，正在关闭服务...`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
