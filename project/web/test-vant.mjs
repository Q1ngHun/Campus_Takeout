import automator from 'miniprogram-automator'
import fs from 'node:fs'

const out = 'D:/Ai_WeiXin/tools'
fs.mkdirSync(out, { recursive: true })
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const miniProgram = await automator.connect({ wsEndpoint: 'ws://localhost:9420' })
console.log('CONNECTED')
const exceptions = []
miniProgram.on('exception', (error) => exceptions.push(error.message || String(error)))

async function shot(name) {
  await miniProgram.screenshot({ path: `${out}/${name}.png` })
  const page = await miniProgram.currentPage()
  console.log('SHOT', name, page?.path)
}

await miniProgram.callWxMethod('switchTab', { url: '/pages/home/home' })
await sleep(600)
await miniProgram.callWxMethod('navigateTo', { url: '/pages/search/search' })
await sleep(800)
await shot('vant-search')

await miniProgram.callWxMethod('navigateBack')
await sleep(400)
await miniProgram.callWxMethod('navigateTo', { url: '/pages/settings/settings' })
await sleep(800)
await shot('vant-settings')

await miniProgram.callWxMethod('navigateBack')
await sleep(400)
await miniProgram.callWxMethod('navigateTo', { url: '/pages/addresses/addresses' })
await sleep(800)
let page = await miniProgram.currentPage()
await page.callMethod('openAdd')
await sleep(700)
await shot('vant-address-sheet')

await miniProgram.callWxMethod('navigateBack')
await sleep(400)
await miniProgram.callWxMethod('navigateTo', { url: '/pages/shop/shop?id=m1' })
await sleep(700)
page = await miniProgram.currentPage()
await page.callMethod('addDish', { currentTarget: { dataset: { id: 'd101' } } })
await page.callMethod('addDish', { currentTarget: { dataset: { id: 'd102' } } })
await sleep(700)
await page.callMethod('toggleCartPanel')
await sleep(700)
await shot('vant-shop-cart')

await miniProgram.callWxMethod('navigateBack')
await sleep(400)
await miniProgram.callWxMethod('switchTab', { url: '/pages/orders/orders' })
await sleep(700)
page = await miniProgram.currentPage()
await page.callMethod('openReview', { currentTarget: { dataset: { id: 'SD202611100018' } } })
await sleep(700)
await shot('vant-review-sheet')

console.log('EXCEPTIONS', JSON.stringify(exceptions))
await miniProgram.disconnect()
setTimeout(() => process.exit(0), 30000)
