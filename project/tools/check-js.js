const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const root = 'D:/Ai_WeiXin/miniprogram'
const files = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.js')) files.push(full)
  }
}
walk(root)
let failed = 0
for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' })
  } catch (error) {
    failed += 1
    console.log('SYNTAX ERROR', file)
    console.log(error.stderr.toString())
  }
}
console.log(`checked ${files.length} js files, failed: ${failed}`)

const jsonFiles = []
function walkJson(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkJson(full)
    else if (entry.name.endsWith('.json')) jsonFiles.push(full)
  }
}
walkJson(root)
let jsonFailed = 0
for (const file of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    jsonFailed += 1
    console.log('JSON ERROR', file, error.message)
  }
}
console.log(`checked ${jsonFiles.length} json files, failed: ${jsonFailed}`)
