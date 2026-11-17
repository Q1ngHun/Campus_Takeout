/**
 * 把 axios 的浏览器 UMD 构建同步到小程序 vendor 目录。
 * 小程序没有 Node 内置模块，不能直接使用 axios 的 npm 入口（Node 版本），
 * 因此统一使用 dist/axios.min.js，并由 axios-miniprogram-adapter 接管请求。
 *
 * 用法：node tools/sync-axios.js
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const sourceDir = path.join(root, 'miniprogram', 'node_modules', 'axios', 'dist')
const targetDir = path.join(root, 'miniprogram', 'vendor')

const files = ['axios.min.js', 'axios.min.map']

if (!fs.existsSync(sourceDir)) {
  console.error('未找到 axios，请先在 miniprogram 目录执行 npm install')
  process.exit(1)
}

fs.mkdirSync(targetDir, { recursive: true })

files.forEach((name) => {
  const from = path.join(sourceDir, name)
  if (!fs.existsSync(from)) return
  fs.copyFileSync(from, path.join(targetDir, name))
  console.log('copied', name)
})

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'miniprogram', 'node_modules', 'axios', 'package.json'), 'utf8'))
console.log('axios version:', pkg.version)
