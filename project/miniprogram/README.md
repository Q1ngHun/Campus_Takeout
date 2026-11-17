# 校园宿达 · 微信小程序

技术栈：**微信小程序原生框架 + Vant Weapp + axios（小程序适配）+ Pinia 同构 store**。

## 目录说明

```
miniprogram/
├─ api/
│  ├─ http.js          axios 实例、适配器、拦截器、错误信息
│  └─ campus.js        后端接口清单（home / merchants / orders / ...）
├─ config/index.js     接口地址、超时、远程开关（持久化到本地缓存）
├─ store/
│  ├─ pinia.js         Pinia 同构实现：defineStore / getters / actions / $patch / $subscribe / $bind
│  └─ campus.js        全局业务 store：数据拉取、购物车、地址、收藏、订单、连接状态
├─ vendor/
│  └─ axios.min.js     axios 官方浏览器构建（UMD），由 tools/sync-axios.js 同步
├─ utils/
│  ├─ ui.js            Vant Toast / Dialog 封装（替代 wx.showToast / wx.showModal）
│  ├─ tabbar.js        弹层打开时隐藏自定义 tabBar，避免遮挡底部操作
│  ├─ cart.js          购物车兼容层（内部调用 store）
│  ├─ favorite.js      收藏兼容层（内部调用 store）
│  └─ storage.js       wx storage 封装
├─ pages/              12 个页面
├─ components/         merchant-card、empty-state
├─ custom-tab-bar/     自定义 tabBar
└─ miniprogram_npm/    「构建 npm」产物（@vant/weapp、axios-miniprogram-adapter）
```

## 安装与构建

```bash
cd miniprogram
npm install          # 安装 @vant/weapp、axios-miniprogram-adapter（axios 由 postinstall 同步到 vendor）
```

微信开发者工具中：

1. 打开 `miniprogram/` 目录（`project.config.json` 已配置 `miniprogramRoot: "./"`）。
2. **工具 → 构建 npm**。
3. **详情 → 本地设置 → 勾选「不校验合法域名…」**（本地调试 `http://localhost:8080` 必需）。

## axios 接入要点

- 小程序没有 `XMLHttpRequest`，使用 `axios-miniprogram-adapter` 将 axios 请求交给 `wx.request`：
  ```js
  const axios = require('../vendor/axios.min')
  const mpAdapter = require('axios-miniprogram-adapter')
  const http = axios.create({ baseURL, timeout: 8000, adapter: mpAdapter })
  ```
- axios npm 入口是 Node 版本，依赖 `http` / `util` 等内置模块，不能被小程序编译。因此使用官方 `dist/axios.min.js`（浏览器 UMD 构建），放在 `vendor/` 中。
- 更新 axios 版本后执行 `npm run sync:axios`（或重新 `npm install`，`postinstall` 会自动同步）。
- 请求与响应拦截器统一处理 `X-Client` 标识、耗时统计和 `friendlyMessage` 错误文案。

## Pinia 同构 store

官方 Pinia 依赖 Vue 3 响应式运行时，无法在小程序里直接运行；`store/pinia.js` 提供同构实现：

```js
const { defineStore } = require('../store/pinia')

const useCampusStore = defineStore('campus', {
  state: () => ({ cart: [] }),
  getters: { cartCount: (state) => state.cart.length },
  actions: { addToCart(dish, shop) { this.cart = this.cart.concat([{ ...dish, shopId: shop.id }]) } }
})
```

页面通过 `$bind` 自动同步到 `setData`：

```js
this.store = useCampusStore()
this.unsubscribe = this.store.$bind(this, (state, store) => ({
  cartCount: store.cartCount,
  apiOnline: state.apiOnline
}))
this.store.bootstrap()
```

`store/campus.js` 中的 `bootstrap()` 会并发请求 `/home`、`/orders`、`/coupons`、`/addresses`、`/user`、`/notifications`、`/hot-searches`，任一请求成功即视为在线；全部失败则自动回退 `data/mock.js`，并在页面上显示数据来源。

## 设置页的联调能力

「我的 → 设置 → 后端联调」提供：

- **远程接口开关**：关闭后只使用本地示例数据。
- **接口地址**：默认 `http://localhost:8080/api`，可改为局域网 IP，保存后立即用 axios 重连。
- **连接状态**：`ONLINE / OFFLINE` 标签、最近同步时间、错误信息。
- **测试连接**：调用 `/api/health` 并显示延迟。
- **重新同步**：重新执行 `bootstrap({ force: true })`。

## 联调自测清单

1. 启动后端，打开首页：通知条出现，列表底部显示 `API 已连接 · Spring Boot API`。
2. 进入店铺：菜单来自 `/api/merchants/{id}`，加入购物车后底部结算栏出现。
3. 结算页提交订单：后端 `/api/orders` 新增记录，跳转订单详情，订单列表变为 `API` 数据。
4. 地址页新增地址：调用 `/api/addresses`；设为默认调用 `PUT /api/addresses/{id}/default`。
5. 关闭后端后重新编译：页面自动回退本地数据，操作不中断。
