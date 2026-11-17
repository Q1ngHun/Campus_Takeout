Component({
  data: {
    selected: 0,
    hidden: false,
    list: [
      { pagePath: '/pages/home/home', text: '首页', icon: '/assets/icons/home.svg' },
      { pagePath: '/pages/orders/orders', text: '订单', icon: '/assets/icons/order.svg' },
      { pagePath: '/pages/profile/profile', text: '我的', icon: '/assets/icons/user.svg' }
    ]
  },
  methods: {
    switchTab(e) {
      const index = Number(e.currentTarget.dataset.index)
      const url = this.data.list[index].pagePath
      if (index === this.data.selected) return
      this.setData({ selected: index })
      wx.switchTab({ url: url })
    }
  }
})
