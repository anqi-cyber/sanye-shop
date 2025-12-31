# 山野商店 · SAN YE

一个完整、可直接运行的全栈购物网站，用来把 **HTML / CSS / JavaScript / Node.js / Vue 3** 串成一个真实项目。

前端是 Vue 3 + Vite 的单页应用，后端是 Node.js + Express 的 REST API。商品、库存和订单保存在本地 JSON 数据库中，不依赖外部数据库或图片服务，断网也能完整展示。

> 8 张商品图片全部是本地手绘 SVG，不需要配置图床。

---

## 功能一览

- **商品浏览**：8 件示例商品、5 个分类、关键词搜索、价格排序
- **商品详情**：商品故事、规格、库存状态、数量选择、立即购买
- **购物车**：侧边抽屉、数量增减、删除、包邮进度、刷新后保留（localStorage）
- **结算**：收货信息校验、配送方式、支付方式、订单金额实时计算
- **下单**：服务端复核商品价格与库存，扣减库存，库存不足返回 409
- **订单**：订单结果页、订单详情、当前浏览器的历史订单、订单号查询
- **体验**：响应式布局、加载骨架屏、空状态、错误提示、Toast、页面过渡
- **工程化**：VSCode 调试配置、接口测试、生产构建、前后端共用业务常量

> 支付是模拟的，不会产生真实扣款；项目也没有登录与后台管理，适合作为学习项目继续扩展。

---

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Vue 3（Composition API / `<script setup>`）、Vue Router、Vite |
| 后端 | Node.js、Express 5 |
| 数据 | JSON 文件持久化，临时文件 + rename 原子写入 |
| 测试 | Node.js 内置 `node:test` + `fetch` |
| 样式 | 原生 CSS、CSS Variables、Scoped CSS；无 UI 框架 |
| 图片 | 本地 SVG 插画 |

---

## 快速开始

### 1. 环境要求

- Node.js **20.19+**（推荐 22 / 24）
- npm 10+
- VSCode（推荐，但不是必需）

检查版本：

```bash
node -v
npm -v
```

### 2. 在 VSCode 中打开

1. 打开 VSCode。
2. `文件 → 打开文件夹`，选择本项目目录 `sanye-shop`。
3. 如果 VSCode 提示安装推荐扩展，选择安装（主要是 **Vue - Official**）。
4. 打开终端：`终端 → 新建终端`。
5. 执行：

```bash
npm install
npm run dev
```

看到类似输出即启动成功：

```text
API  http://127.0.0.1:3000/api/health
WEB  http://127.0.0.1:5173
```

浏览器打开 **http://127.0.0.1:5173**。

> `npm run dev` 会同时启动 Express（3000）和 Vite（5173）。Vite 会把 `/api` 请求代理到后端，因此前端代码里直接写 `/api/...` 即可。

### 3. 生产模式

```bash
npm run build
npm start
```

打开 **http://127.0.0.1:3000**。Express 会直接托管 `dist/` 里的前端静态文件，前后端同源。

---

## 在 VSCode 里调试

项目已包含 `.vscode/` 配置：

- **Chrome / Edge 调试前端**：先在终端运行 `npm run dev`，然后按 `F5`，选择「Chrome: 调试前端」或「Edge: 调试前端」。
- **Node 调试后端**：先停掉 `npm run dev`（否则 3000 端口被占用），按 `F5`，选择「Node: 启动后端」。
- **任务**：`终端 → 运行任务` 里可以直接运行 `dev`、`build`、`test`。

推荐扩展：

- Vue - Official（Vue 语言支持）
- Prettier - Code formatter
- Auto Rename Tag

---

## 项目结构

```text
sanye-shop/
├─ public/
│  ├─ favicon.svg
│  └─ images/products/          # 8 张本地商品插画
├─ shared/
│  └─ shop.js                   # 前后端共用：分类、运费、支付方式
├─ server/
│  ├─ app.js                    # Express 应用与 API 路由
│  ├─ index.js                  # 启动入口，生产环境托管 dist
│  ├─ store.js                  # JSON 数据库、库存与订单事务
│  ├─ seed.js                   # 首次启动写入的示例商品
│  ├─ validation.js             # 下单参数校验
│  ├─ app.test.js               # 接口端到端测试
│  └─ data/                     # 运行时生成 db.json
├─ src/
│  ├─ components/               # 页头、页脚、商品卡、购物车、图标等
│  ├─ composables/useToast.js   # 全局轻提示
│  ├─ stores/cart.js            # 购物车状态 + localStorage
│  ├─ utils/                    # 金额/日期格式化、本地订单号
│  ├─ views/                    # 首页、商品、结算、订单、404
│  ├─ api.js                    # fetch 封装
│  ├─ router.js                 # 路由
│  ├─ App.vue
│  ├─ main.js
│  └─ styles/main.css           # 设计变量与全局样式
├─ scripts/
│  └─ dev.js                    # 开发启动器（前后端 + 后端热重启）
├─ .vscode/
├─ index.html
├─ vite.config.js
└─ package.json
```

---

## 一次完整的购物流程

1. 首页选择分类或搜索商品。
2. 点击商品卡进入详情页，选择数量，加入购物车。
3. 页头购物车出现数量角标；打开抽屉可以增减、删除商品。
4. 点击「去结算」，填写收货信息，选择配送和支付方式。
5. 提交订单：
   - 前端先做表单校验；
   - 后端再次校验字段、商品是否存在、库存是否足够；
   - 后端用数据库中的价格重新计算金额，不信任前端传来的价格；
   - 扣减库存并写入订单；
   - 返回订单号，跳转到订单详情页。
6. 在「我的订单」里查看当前浏览器下过的订单，或用订单号查询。

---

## API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/products` | 商品列表，支持 `?category=fragrance&q=香` |
| `GET` | `/api/products/:id` | 商品详情 |
| `POST` | `/api/orders` | 创建订单、校验并扣减库存 |
| `GET` | `/api/orders/:id` | 按订单号查询订单 |

创建订单请求示例：

```json
{
  "customer": {
    "name": "林小满",
    "phone": "13800138000",
    "province": "浙江省",
    "city": "杭州市",
    "district": "西湖区",
    "address": "青芝坞 18 号",
    "note": "请放在门口"
  },
  "items": [
    { "productId": "mist-mug", "quantity": 2 },
    { "productId": "citrus-soap", "quantity": 1 }
  ],
  "shipping": "standard",
  "payment": "online"
}
```

成功返回 `201`：

```json
{
  "order": {
    "id": "SY20261031D4BCBC",
    "status": "pending",
    "subtotal": 300,
    "shipping": { "method": "standard", "name": "标准配送", "fee": 0 },
    "total": 300,
    "items": []
  }
}
```

常见错误：

- `400`：字段缺失、手机号格式错误、数量不合法
- `404`：商品或订单不存在
- `409`：库存不足，返回具体商品和剩余数量

---

## 数据与重置

首次启动时会自动生成 `server/data/db.json`，内容来自 `server/seed.js`。

想恢复初始商品和库存：

1. 停止正在运行的服务；
2. 删除 `server/data/db.json`；
3. 重新执行 `npm run dev`。

数据库写入使用「临时文件 + rename」，避免写到一半留下损坏的 JSON。

购物车和「当前浏览器的订单记录」保存在 localStorage：

- `sanye-cart-v1`：购物车
- `sanye-my-orders`：本地订单号列表

清除浏览器站点数据会同时清空这两项，但订单仍然可以用订单号从服务端查询。

---

## 运行测试

```bash
npm test
```

测试会使用临时数据库，不会改动 `server/data/db.json`，覆盖：

- 健康检查与商品列表
- 商品详情、分类筛选、404
- 下单参数校验
- 创建订单与库存扣减
- 库存不足 409
- 订单查询
- 数据重启后仍然存在

---

## 可以继续练习的方向

- 加入用户注册 / 登录（JWT 或 Session）
- 商品后台：新增、编辑、上下架、库存管理
- 订单后台：发货、取消、状态流转
- 用 SQLite / PostgreSQL 替换 JSON 文件
- 接入真实支付、优惠券、地址簿
- 商品图片上传、SKU、多规格
- 单元测试与组件测试（Vitest + Vue Test Utils）

---

## 常见问题

### 浏览器打不开页面

先确认终端里的 `npm run dev` 还在运行，并看到：

```text
VITE v8.x  ready
➜  Local:   http://127.0.0.1:5173/
```

然后直接访问 **http://127.0.0.1:5173**（不要用 `https://`）。

如果仍然打不开：

1. 检查 3000 / 5173 端口是否被其他程序占用：
   ```powershell
   Get-NetTCPConnection -LocalPort 3000,5173 -State Listen
   ```
2. 关掉占用端口的程序，或修改 `vite.config.js` 里的前端端口。
3. 生产模式请先 `npm run build`，再 `npm start`，访问 **http://127.0.0.1:3000**。
4. 如果浏览器使用了代理 / VPN，尝试暂时关闭，或把 `127.0.0.1` 加入代理例外。

> 项目的 `npm run dev` 使用的是自带启动器 `scripts/dev.js`，它通过继承终端输出启动前后端，兼容 Windows 上容易触发 `spawn EPERM` 的环境；后端文件变化时也会自动重启。

### `npm run dev` 报 `spawn EPERM`

本项目已经避免使用 `concurrently` 和 `node --watch`。如果你手动改成了这些命令，请恢复：

```json
"dev": "node scripts/dev.js"
```

---

## 自定义入口

| 想改什么 | 去哪里 |
| --- | --- |
| 商品名称、价格、库存、描述 | `server/seed.js`（改完删除 db.json） |
| 分类、包邮门槛、运费、支付方式 | `shared/shop.js` |
| 颜色、字体、圆角等设计变量 | `src/styles/main.css` 的 `:root` |
| 商品插画 | `public/images/products/*.svg` |
| 首页文案与布局 | `src/views/HomeView.vue` |
| 下单校验规则 | `server/validation.js` |
| API 路由 | `server/app.js` |

---

## 说明

这是一个教学 / 作品集性质的全栈项目：

- 不包含真实支付、短信、物流对接；
- 订单查询仅凭订单号，没有身份校验，**不要直接部署到生产环境**；
- 如果要在公网部署，请补充鉴权、限流、HTTPS、数据库备份与日志。
