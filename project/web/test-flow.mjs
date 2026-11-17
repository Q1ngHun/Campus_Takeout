import puppeteer from 'puppeteer-core'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars']
})
const page = await browser.newPage()
const consoleErrors = []
const apiRequests = []
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text())
})
page.on('pageerror', (error) => consoleErrors.push(error.message))
page.on('response', async (response) => {
  const url = response.url()
  if (url.includes('/api/')) apiRequests.push({ url, status: response.status() })
})

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await sleep(1200)
console.log('API BADGE', await page.$eval('.api-pill', (el) => el.textContent))
console.log('HOME MERCHANTS', await page.$$eval('.merchant-card', (els) => els.length))
console.log('API REQS', JSON.stringify(apiRequests.slice(0, 8)))

await page.click('.merchant-card')
await page.waitForFunction(() => location.pathname.startsWith('/shop/'))
await sleep(500)
await page.click('.dish-card .add-dish')
await page.click('.dish-card .add-dish')
await sleep(400)
console.log('CART STORAGE', await page.evaluate(() => localStorage.getItem('suda_cart_web_v1')))
await page.click('.shop-cart .checkout-btn')
await page.waitForFunction(() => location.pathname === '/cart')
await sleep(600)
console.log('CART PAGE', await page.$eval('.cart-page', (el) => el.innerText.includes('已选好味')))
await page.click('.checkout-bar > button')
await page.waitForFunction(() => location.pathname === '/checkout')
await sleep(500)
await page.click('.submit-bar > button')
await page.waitForFunction(() => location.pathname.startsWith('/order/'), { timeout: 8000 })
await sleep(1000)
console.log('ORDER URL', page.url())
console.log('SUCCESS BANNER', await page.$eval('.success-banner', (el) => el.innerText))
console.log('API POSTS', JSON.stringify(apiRequests.filter((item) => item.url.includes('/orders'))))
await page.screenshot({ path: 'D:/Ai_WeiXin/tools/web-api-order.png' })

await page.goto('http://localhost:5173/search', { waitUntil: 'networkidle0' })
await sleep(500)
await page.type('.search-box input', '拌饭')
await sleep(1000)
console.log('SEARCH RESULTS', await page.$$eval('.merchant-card', (els) => els.length))
console.log('SEARCH API', JSON.stringify(apiRequests.filter((item) => item.url.includes('/search'))))
await page.screenshot({ path: 'D:/Ai_WeiXin/tools/web-api-search.png' })

console.log('ERRORS', JSON.stringify(consoleErrors))
await browser.close()
