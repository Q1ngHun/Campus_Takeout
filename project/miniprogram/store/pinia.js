/**
 * 小程序版 Pinia（与官方 Pinia 的 API 对齐）
 *
 * 官方 Pinia 依赖 Vue 3 的响应式运行时，无法直接在微信小程序里使用；
 * 这里实现了一个同构版本，保留 defineStore / state / getters / actions /
 * $patch / $reset / $subscribe 等核心能力，并额外提供 $bind 方便把 store
 * 状态同步到 Page.setData，业务代码写法与 Pinia 完全一致。
 *
 * 用法：
 *   const { defineStore } = require('./pinia')
 *   const useCounterStore = defineStore('counter', {
 *     state: () => ({ count: 0 }),
 *     getters: { double: (state) => state.count * 2 },
 *     actions: { add() { this.count += 1 } }
 *   })
 *   const store = useCounterStore()
 */
const storage = require('../utils/storage')

const registry = {}

function clone(value) {
  if (value === undefined) return undefined
  return JSON.parse(JSON.stringify(value))
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function defineStore(id, options) {
  function useStore() {
    if (!registry[id]) registry[id] = createStore(id, options)
    return registry[id]
  }
  useStore.$id = id
  return useStore
}

function createStore(id, options) {
  const config = typeof options === 'function' ? options() : Object.assign({}, options || {})
  const state = config.state ? config.state() : {}
  const persist = config.persist || null
  const subscribers = []
  let pending = null

  if (persist) {
    const saved = storage.get(persist.key || id, null)
    if (isPlainObject(saved)) {
      Object.keys(saved).forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(state, key)) state[key] = saved[key]
      })
    }
  }

  const store = {}

  function snapshot() {
    const result = {}
    Object.keys(state).forEach(function (key) {
      result[key] = clone(state[key])
    })
    return result
  }

  function flush() {
    pending = null
    const payload = snapshot()
    if (persist) storage.set(persist.key || id, payload)
    subscribers.slice().forEach(function (handler) {
      handler(payload, store)
    })
  }

  function notify() {
    if (pending) return
    pending = setTimeout(flush, 0)
  }

  function defineStateAccessors() {
    Object.keys(state).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(store, key)) return
      Object.defineProperty(store, key, {
        enumerable: true,
        configurable: true,
        get: function () {
          return state[key]
        },
        set: function (value) {
          state[key] = value
          notify()
        }
      })
    })
  }

  Object.defineProperty(store, '$id', { value: id, enumerable: true })
  store.$state = state
  defineStateAccessors()

  const getters = config.getters || {}
  Object.keys(getters).forEach(function (key) {
    if (Object.prototype.hasOwnProperty.call(store, key)) return
    Object.defineProperty(store, key, {
      enumerable: true,
      configurable: true,
      get: function () {
        return getters[key].call(store, state)
      }
    })
  })

  const actions = config.actions || {}
  Object.keys(actions).forEach(function (key) {
    store[key] = function () {
      const result = actions[key].apply(store, arguments)
      if (result && typeof result.then === 'function') {
        return result.then(function (value) {
          notify()
          return value
        }, function (error) {
          notify()
          throw error
        })
      }
      notify()
      return result
    }
  })

  store.$patch = function (partial) {
    if (typeof partial === 'function') {
      partial(state)
    } else if (isPlainObject(partial)) {
      Object.keys(partial).forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(state, key)) state[key] = partial[key]
      })
    }
    notify()
  }

  store.$reset = function () {
    const fresh = config.state ? config.state() : {}
    Object.keys(state).forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(fresh, key)) state[key] = clone(fresh[key])
    })
    if (persist) storage.remove(persist.key || id)
    notify()
  }

  store.$snapshot = snapshot

  store.$subscribe = function (handler, subscribeOptions) {
    subscribers.push(handler)
    if (subscribeOptions && subscribeOptions.immediate) handler(snapshot(), store)
    return function unsubscribe() {
      const index = subscribers.indexOf(handler)
      if (index > -1) subscribers.splice(index, 1)
    }
  }

  /**
   * 把 store 同步到页面：mapper 返回需要 setData 的字段
   */
  store.$bind = function (page, mapper) {
    return store.$subscribe(function (snapshot, instance) {
      if (!page || page.__storeDetached) return
      const patch = mapper ? mapper(snapshot, instance) : snapshot
      if (patch) page.setData(patch)
    }, { immediate: true })
  }

  store.$flush = function () {
    if (pending) {
      clearTimeout(pending)
      pending = null
    }
    flush()
  }

  return store
}

module.exports = {
  defineStore: defineStore
}
