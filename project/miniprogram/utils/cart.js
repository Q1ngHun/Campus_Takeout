const CART_KEY = 'suda_cart_v1'

function getCart() {
  try {
    const value = wx.getStorageSync(CART_KEY)
    return Array.isArray(value) ? value : []
  } catch (e) {
    return []
  }
}

function saveCart(cart) {
  try {
    wx.setStorageSync(CART_KEY, cart)
  } catch (e) {}
}

function addItem(dish, shop, qty) {
  const count = qty || 1
  let cart = getCart()
  let cleared = false

  if (cart.length && cart[0].shopId !== shop.id) {
    cart = []
    cleared = true
  }

  const index = cart.findIndex(function (item) { return item.dishId === dish.id })
  if (index > -1) {
    cart[index].qty += count
  } else {
    cart.push({
      dishId: dish.id,
      shopId: shop.id,
      shopName: shop.name,
      name: dish.name,
      spec: dish.category + ' · 默认规格',
      price: dish.price,
      image: dish.image,
      qty: count
    })
  }
  saveCart(cart)
  return { cart: cart, cleared: cleared }
}

function changeQty(dishId, delta) {
  let cart = getCart()
  const index = cart.findIndex(function (item) { return item.dishId === dishId })
  if (index > -1) {
    cart[index].qty += delta
    if (cart[index].qty <= 0) {
      cart.splice(index, 1)
    }
  }
  saveCart(cart)
  return cart
}

function removeItem(dishId) {
  const cart = getCart().filter(function (item) { return item.dishId !== dishId })
  saveCart(cart)
  return cart
}

function clearCart() {
  saveCart([])
}

function summary(cart) {
  const list = cart || getCart()
  const count = list.reduce(function (total, item) { return total + item.qty }, 0)
  const subtotal = list.reduce(function (total, item) { return total + item.price * item.qty }, 0)
  const shopId = list.length ? list[0].shopId : ''
  const shopName = list.length ? list[0].shopName : ''
  return {
    count: count,
    subtotal: Math.round(subtotal * 100) / 100,
    shopId: shopId,
    shopName: shopName,
    delivery: list.length ? 1.5 : 0
  }
}

module.exports = {
  CART_KEY,
  getCart,
  saveCart,
  addItem,
  changeQty,
  removeItem,
  clearCart,
  summary
}
