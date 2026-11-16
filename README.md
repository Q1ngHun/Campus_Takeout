# 校园宿达 · SUDA CAMPUS

> 把好吃的，送到宿舍楼下。

一套面向校园场景的外卖用户端作品，参考美团外卖的信息架构，重新设计了「校园宿达」品牌视觉与交互。包含 **微信小程序前台**、**Vue 3 响应式交互预览** 与 **Spring Boot 本地数据 API**。

![首页预览](screenshots/desktop-home.png)

## 设计概念

- **品牌色**：荧光青柠 `#D7FF5E` + 深松林绿 `#14251B` + 燕麦米白 `#F4F2EC`
- **关键词**：极简、留白、高对比、校园感、编辑部式排版
- **视觉语言**：大字号标题、悬浮胶囊导航、圆角卡片、手写感贴纸、动态配送轨迹
- **响应式**：桌面端以「品牌展示 + 手机真机预览」呈现；移动端自动切换为全屏小程序体验

## 功能清单

### 三大主页面
- **首页**：问候语、搜索、品牌 Hero、分类筛选、开学季优惠、今日热卖横向卡片、附近商家 Feed、快捷加购、悬浮购物车。
- **订单**：订单状态筛选、进行中订单配送 Card、预计送达时间、配送轨迹、骑手信息、历史订单、再来一单、评价弹层。
- **用户中心**：会员身份、余额 / 优惠券 / 积分、SUDA PRO 省额进度、地址 / 优惠券 / 收藏 / 客服入口、本月消费图表、偏好与设置。

### 其余功能页面
- 搜索：历史、热搜、实时结果、相关单品、随机推荐
- 店铺详情：菜单分类、菜品加减、店铺公告、优惠券、购物车弹层
- 购物车：数量调整、优惠券、配送方式、费用明细
- 确认订单：地址、送达时间、备注、餐具、支付方式、下单
- 订单详情：进度条、配送动态、骑手、商品、账单、订单信息
- 地址管理：新增 / 编辑 / 删除 / 默认地址
- 优惠券：可用 / 已使用 / 已过期
- 我的收藏、设置

全部业务数据保存在本地（小程序 Storage / 浏览器 localStorage），无需联网即可完整体验。

## 目录结构

```
Ai_WeiXin/
├─ miniprogram/                 # 微信原生小程序（主交付）
│  ├─ pages/                    # 首页、订单、我的、店铺、购物车、结算等 12 页
│  ├─ components/               # 商家卡片、空状态
│  ├─ custom-tab-bar/           # 自定义悬浮 TabBar
│  ├─ data/mock.js              # 本地数据
│  ├─ utils/                    # 购物车、收藏
│  └─ assets/                   # 本地图片与图标
├─ web/                         # Vue 3 + Vite 响应式交互预览
│  ├─ src/views/                # 对应小程序的全部页面
│  ├─ src/store.js              # 本地状态 & 持久化
│  └─ public/                   # 图片与 SVG 图标
├─ server/                      # Spring Boot API
│  ├─ src/main/java/            # Controller / Service / Config
│  └─ src/main/resources/mock-data.json
├─ screenshots/                 # 桌面端与移动端效果图
├─ tools/                       # 便携 Node、Maven 与启动脚本
├─ start-backend.bat
├─ start-web.bat
└─ run-demo.bat
```

## 快速开始

### 方式一：一键演示（Web 预览）

双击运行：

```bat
run-demo.bat
```

脚本会启动 Spring Boot API（8080）与 Vue 开发服务器（5173），并自动打开浏览器。手机预览会自动适配为全屏布局。

### 方式二：微信开发者工具

1. 打开微信开发者工具，选择「导入项目」。
2. 目录选择 `D:\Ai_WeiXin\miniprogram`。
3. AppID 可使用测试号（项目内为 `touristappid`）。
4. 编译即可体验，所有数据均为本地数据。

> 小程序使用自定义导航栏与自定义 TabBar，建议使用较新的基础库（项目配置为 3.5.7）。

### 方式三：分别启动

**Vue 3 前端**

```bat
tools\npm-run.bat run dev
```

或标准环境：

```bash
cd web
npm install
npm run dev
```

生产构建：

```bat
tools\npm-run.bat run build
```

**Spring Boot 后端**

```bat
tools\mvn-run.bat spring-boot:run
```

或直接运行已构建的 JAR：

```bat
java -jar server\target\campus-suda-1.0.0.jar
```

健康检查：`GET http://localhost:8080/api/health`

## 后端 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/home` | 首页聚合（分类、商家、优惠券、进行中订单） |
| GET | `/api/merchants` | 商家列表 |
| GET | `/api/merchants/{id}` | 商家详情 |
| GET | `/api/search?q=拌饭` | 搜索商家与菜品 |
| GET | `/api/orders` | 订单列表 |
| POST | `/api/orders` | 创建订单 |
| GET | `/api/orders/{id}` | 订单详情 |
| GET | `/api/coupons` | 优惠券 |
| GET | `/api/addresses` | 地址列表 |
| POST | `/api/addresses` | 新增地址 |
| PUT | `/api/addresses/{id}/default` | 设置为默认地址 |
| GET | `/api/user` | 用户信息 |

小程序与 Vue 预览默认使用本地数据，不依赖后端即可完整运行；后端使用 `server/src/main/resources/mock-data.json` 提供同一套校园业务数据，便于后续接入真实前端。

## 数据与状态

- 小程序本地数据：`miniprogram/data/mock.js`
- 小程序购物车：`suda_cart_v1`
- 小程序订单：`suda_orders_v1`
- Web 本地数据：`web/src/data.json`
- Web 状态：`web/src/store.js`，使用 localStorage 持久化
- 后端数据：`server/src/main/resources/mock-data.json`

清除浏览器 localStorage 即可重置演示数据。

## 校验情况

- Vue 3 生产构建通过（Vite 6）
- Spring Boot 打包通过（Maven 3.9.9 / Java 17 target）
- 小程序 19 个 JS 文件语法检查通过
- 18 个 JSON 配置解析通过
- WXML 标签闭合、WXSS 语法、静态资源引用检查通过
- Web 端完整链路已自动化走通：店铺 → 加购 → 购物车 → 结算 → 下单 → 订单详情
- 已通过微信开发者工具（touristappid）编译加载，并截图验证首页、搜索、店铺、订单、我的、优惠券、地址、订单详情
- 无浏览器控制台运行时错误

## 小程序真机编译预览

| 首页 | 店铺 | 订单 |
| --- | --- | --- |
| ![](screenshots/mini-home.png) | ![](screenshots/mini-shop.png) | ![](screenshots/mini-orders.png) |

| 我的 | 优惠券 | 地址 | 订单详情 |
| --- | --- | --- | --- |
| ![](screenshots/mini-profile.png) | ![](screenshots/mini-coupons.png) | ![](screenshots/mini-addresses.png) | ![](screenshots/mini-order-detail.png) |

## Vue 3 响应式预览

| 首页 | 订单 | 用户中心 |
| --- | --- | --- |
| ![](screenshots/mobile-home.png) | ![](screenshots/mobile-orders.png) | ![](screenshots/mobile-profile.png) |

| 店铺详情 | 购物车 | 确认订单 | 订单详情 |
| --- | --- | --- | --- |
| ![](screenshots/mobile-shop.png) | ![](screenshots/mobile-cart.png) | ![](screenshots/mobile-checkout.png) | ![](screenshots/mobile-order-detail.png) |

桌面端展示：

![订单页](screenshots/desktop-orders.png)

## 说明

- 示例菜品图片来自 Unsplash，仅用于作品演示。
- 所有商家、用户、订单、地址、优惠均为虚构数据。
- 小程序端与 Web 端共享同一套品牌视觉与本地业务数据，二者可独立运行。
