# 校园宿达 · Campus Suda

校内外卖演示项目，包含 **微信小程序**、**H5 演示端** 与 **Spring Boot 后端**。

本次更新的两个重点：

1. **Vant Weapp 组件化**：安装并构建 `@vant/weapp`，并在各页面用 Vant 组件替换原生弹窗、Toast、输入框、步进器、标签、开关、步骤条、提交栏等。
2. **前后端联调（axios + Pinia）**：
   - 小程序端：`axios`（`axios-miniprogram-adapter` 适配 `wx.request`）+ Pinia 同构 store，全部页面数据来自 Spring Boot API，失败自动回退本地示例数据。
   - H5 端：官方 `pinia` + `axios`，与同一套 Spring Boot 接口联调。

## 目录结构

```
Ai_WeiXin/
├─ miniprogram/                微信小程序（Vant Weapp + axios + Pinia 同构 store）
│  ├─ api/                     axios 实例与接口封装
│  ├─ config/                  接口地址、远程开关等配置（含本地持久化）
│  ├─ store/                   Pinia 同构 store（defineStore / state / getters / actions）
│  ├─ vendor/axios.min.js      axios 浏览器 UMD 构建（小程序端使用）
│  ├─ utils/                   ui（Vant Toast/Dialog）、购物车、收藏、storage、tabBar 显隐
│  ├─ pages/                   12 个业务页面
│  └─ miniprogram_npm/         微信开发者工具「构建 npm」产物
├─ server/                     Spring Boot 3.5 REST API（默认 8080）
├─ web/                        Vue 3 + Pinia + axios 的 H5 演示端（默认 5173）
├─ tools/                      构建与校验脚本
├─ screenshots/                各页面运行截图（mp-*.png / web-api-*.png）
├─ start-backend.bat           启动后端
├─ start-web.bat               启动 H5 演示端
└─ run-demo.bat                一键启动后端 + H5
```

## 快速开始

### 1. 启动后端

双击 `start-backend.bat`，或手动执行：

```bash
cd server
mvn spring-boot:run
```

健康检查：<http://localhost:8080/api/health>

### 2. 运行小程序

1. 用微信开发者工具打开 `miniprogram/` 目录。
2. 首次打开后执行 **工具 → 构建 npm**（`miniprogram_npm/` 已随仓库生成，可直接运行）。
3. 在 **详情 → 本地设置** 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」。
4. 编译运行。首页顶部会显示通知条，列表底部会显示 `API 已连接 · Spring Boot API`。

> 后端未启动时会自动使用 `miniprogram/data/mock.js` 的本地示例数据，页面功能不受影响。
> 在 **我的 → 设置 → 后端联调** 可以开关远程数据、修改接口地址、测试连接与查看最近同步时间。

### 3. 运行 H5 演示端

双击 `start-web.bat`，或：

```bash
cd web
npm install
npm run dev
```

打开 <http://localhost:5173>，页面顶部会显示 `AXIOS · PINIA · API` 状态。

## 前后端联调设计

### axios（小程序端）

`miniprogram/api/http.js`：

```js
const axios = require('../vendor/axios.min')
const mpAdapter = require('axios-miniprogram-adapter')

const http = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 8000,
  adapter: mpAdapter
})

http.interceptors.request.use((config) => {
  config.headers['X-Client'] = 'weapp'
  return config
})
```

- 小程序没有 `XMLHttpRequest`，通过 `axios-miniprogram-adapter` 把请求转交给 `wx.request`，同时保留 axios 的拦截器、超时、错误处理能力。
- axios 的 npm 入口是 Node 版本（依赖 `http` / `util` 等内置模块），无法被小程序编译；因此使用官方 `dist/axios.min.js`（UMD 构建），已放入 `miniprogram/vendor/`，可用 `npm run sync:axios` 重新同步。
- 所有请求统一在 `miniprogram/api/campus.js` 封装，页面不直接拼 URL。

### Pinia（小程序端）

官方 Pinia 依赖 Vue 3 响应式运行时，无法直接跑在微信小程序中。项目在 `miniprogram/store/pinia.js` 实现了 **与 Pinia API 对齐的同构 store**：

```js
const useCampusStore = defineStore('campus', {
  state: () => ({ cart: [], merchants: [], apiOnline: false }),
  getters: { cartCount: (state) => state.cart.length },
  actions: { addToCart(dish, shop) { /* ... */ } }
})
```

支持 `state / getters / actions / $patch / $reset / $subscribe / $bind`，页面写法与 Pinia 完全一致：

```js
this.store = useCampusStore()
this.unsubscribe = this.store.$bind(this, (state, store) => ({
  cartCount: store.cartCount,
  apiOnline: state.apiOnline
}))
this.store.bootstrap()   // axios 拉取 /home /orders /coupons /addresses ...
```

H5 端（`web/src/stores/campus.js`）使用官方 `pinia`，接口与数据字段保持一致，可以直接对照阅读。

### 数据流

```
Page  ──▶  store action  ──▶  api/campus.js  ──▶  axios  ──▶  wx.request  ──▶  Spring Boot
  ▲            │                                                                    │
  └── setData ──┴────────────  store.$subscribe / $bind  ◀──────── JSON ────────────┘
                              （失败时自动回退 data/mock.js）
```

## Vant Weapp 使用情况

| 页面 | 使用的 Vant 组件 | 替换的原生/自研实现 |
| --- | --- | --- |
| 首页 | `van-notice-bar`、`van-action-sheet`、`van-dialog`、`van-toast` | `wx.showActionSheet`、`wx.showToast`、自绘通知条 |
| 搜索 | `van-search`、`van-loading`、`van-dialog`、`van-toast` | 原生 `input`、`wx.showModal` |
| 店铺 | `van-popup`、`van-stepper`、`van-toast`、`van-dialog`、`van-loading` | 原生步进器、`wx.showModal` |
| 购物车 | `van-stepper`、`van-submit-bar`、`van-action-sheet`、`van-dialog`、`van-toast` | 自绘底部结算栏、`wx.showActionSheet`、`wx.showModal` |
| 结算 | `van-field`、`van-submit-bar`、`van-action-sheet`、`van-dialog`、`van-toast` | 原生 `input`、自绘提交栏、4 处 `wx.showActionSheet` |
| 订单 | `van-popup`、`van-rate`、`van-field`、`van-dialog`、`van-toast` | 原生 `textarea`、`wx.showModal`、`wx.showToast` |
| 订单详情 | `van-steps`、`van-dialog`、`van-toast` | 自绘物流时间轴、`wx.showModal` |
| 优惠券 | `van-tag`、`van-dialog`、`van-toast` | 自绘券类型标签、`wx.showModal` |
| 地址 | `van-popup`、`van-field`、`van-tag`、`van-dialog`、`van-toast` | 自绘默认标签、`wx.showModal` |
| 我的 | `van-tag`、`van-action-sheet`、`van-dialog`、`van-toast` | PRO 徽标、`wx.showActionSheet`、`wx.showModal` |
| 设置 | `van-switch`、`van-tag`、`van-button`、`van-popup`、`van-field`、`van-dialog`、`van-toast` | 原生开关、`wx.showModal` |

## 后端接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查（设置页「测试连接」使用） |
| GET | `/api/home` | 首页聚合数据（分类、商家、用户、可用券、进行中订单） |
| GET | `/api/merchants` | 商家列表 |
| GET | `/api/merchants/{id}` | 商家详情（店铺页） |
| GET | `/api/search?q=` | 搜索店铺与单品 |
| GET | `/api/orders` | 订单列表（订单页） |
| GET | `/api/orders/{id}` | 订单详情 |
| POST | `/api/orders` | 创建订单（结算页提交） |
| GET | `/api/coupons` | 优惠券列表 |
| GET | `/api/addresses` | 地址列表 |
| POST | `/api/addresses` | 新增地址 |
| PUT | `/api/addresses/{id}/default` | 设为默认地址 |
| GET | `/api/user` | 用户信息 |
| GET | `/api/notifications` | 消息通知 |
| GET | `/api/hot-searches` | 校园热搜 |

CORS 已在 `server/.../config/WebConfig.java` 放开 `/api/**`。

## 常用脚本

```bash
# 同步 axios 浏览器构建到 miniprogram/vendor（npm install 后自动执行）
cd miniprogram && npm run sync:axios

# 校验小程序 JS / JSON / WXML / WXSS / 静态资源引用
node tools/check-js.js
python tools/check-wxml.py

# H5 构建
cd web && npm run build
```

## 截图

`screenshots/` 下的 `mp-*.png` 为本次更新后的真机模拟器截图，包括首页、搜索、订单、购物车、结算、优惠券、地址、收藏、设置、订单详情等页面。

## 备注

- 小程序端「地址编辑/删除」「收藏」「评价」属于本地增强能力，后端仅提供新增地址、设置默认地址接口，阅读时请注意区分。
- 后端数据存放在内存中，重启服务后恢复 `server/src/main/resources/mock-data.json` 的初始数据。
- 本地演示接口为 `http://localhost:8080/api`，真机预览请改为电脑局域网 IP，并确保手机与电脑同一网络。
