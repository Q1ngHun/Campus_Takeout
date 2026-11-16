Component({
  properties: {
    merchant: {
      type: Object,
      value: {}
    },
    index: {
      type: Number,
      value: 0
    }
  },
  methods: {
    goDetail() {
      wx.navigateTo({ url: '/pages/shop/shop?id=' + this.data.merchant.id })
    },
    quickAdd() {
      this.triggerEvent('add', { merchant: this.data.merchant })
    }
  }
})
