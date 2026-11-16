const mock = require('../../data/mock')

const ADDRESS_KEY = 'suda_addresses_v1'
const SELECTED_KEY = 'suda_selected_address_v1'

Page({
  data: {
    statusBarHeight: 20,
    addresses: [],
    selectMode: false,
    sheetVisible: false,
    editingIndex: -1,
    labels: ['宿舍', '教学楼', '其他'],
    draft: {
      name: '',
      phone: '',
      label: '宿舍',
      detail: '',
      note: ''
    }
  },

  onLoad(options) {
    this.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      selectMode: options.select === '1'
    })
    this.loadAddresses()
  },

  loadAddresses() {
    let list = []
    try {
      list = wx.getStorageSync(ADDRESS_KEY) || []
    } catch (e) {}
    if (!list.length) {
      list = mock.addresses.slice()
      try { wx.setStorageSync(ADDRESS_KEY, list) } catch (e) {}
    }
    this.setData({ addresses: list })
  },

  saveAddresses(list) {
    try { wx.setStorageSync(ADDRESS_KEY, list) } catch (e) {}
    this.setData({ addresses: list })
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/profile/profile' })
      }
    })
  },

  selectAddress(e) {
    const id = e.currentTarget.dataset.id
    const list = this.data.addresses.map(function (item) {
      return Object.assign({}, item, { default: item.id === id })
    })
    this.saveAddresses(list)
    const selected = list.find(function (item) { return item.id === id })
    try { wx.setStorageSync(SELECTED_KEY, selected) } catch (e) {}

    if (this.data.selectMode) {
      wx.showToast({ title: '已选择收货地址', icon: 'none' })
      setTimeout(function () { wx.navigateBack() }, 350)
    } else {
      wx.showToast({ title: '已设为默认地址', icon: 'none' })
    }
  },

  setDefault(e) {
    e.stopPropagation && e.stopPropagation()
    this.selectAddress(e)
  },

  openAdd() {
    this.setData({
      sheetVisible: true,
      editingIndex: -1,
      draft: { name: '林小满', phone: '138 6621 0928', label: '宿舍', detail: '', note: '' }
    })
  },

  openEdit(e) {
    const index = Number(e.currentTarget.dataset.index)
    const item = this.data.addresses[index]
    this.setData({
      sheetVisible: true,
      editingIndex: index,
      draft: {
        name: item.name,
        phone: item.phone,
        label: item.label,
        detail: item.detail,
        note: item.note || ''
      }
    })
  },

  closeSheet() {
    this.setData({ sheetVisible: false })
  },

  noop() {},

  onField(e) {
    const field = e.currentTarget.dataset.field
    const draft = Object.assign({}, this.data.draft)
    draft[field] = e.detail.value
    this.setData({ draft: draft })
  },

  chooseLabel(e) {
    const draft = Object.assign({}, this.data.draft, { label: e.currentTarget.dataset.label })
    this.setData({ draft: draft })
  },

  saveAddress() {
    const draft = this.data.draft
    if (!draft.name.trim()) {
      wx.showToast({ title: '请填写收货人', icon: 'none' })
      return
    }
    if (!draft.phone.trim()) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' })
      return
    }
    if (!draft.detail.trim()) {
      wx.showToast({ title: '请填写详细地址', icon: 'none' })
      return
    }
    const list = this.data.addresses.slice()
    if (this.data.editingIndex > -1) {
      list[this.data.editingIndex] = Object.assign({}, list[this.data.editingIndex], draft)
    } else {
      list.unshift({
        id: 'a' + Date.now(),
        name: draft.name,
        phone: draft.phone,
        label: draft.label,
        detail: draft.detail,
        note: draft.note,
        default: list.length === 0
      })
    }
    this.saveAddresses(list)
    this.setData({ sheetVisible: false })
    wx.showToast({ title: '地址已保存', icon: 'none' })
  },

  deleteAddress(e) {
    const self = this
    const index = Number(e.currentTarget.dataset.index)
    const item = this.data.addresses[index]
    wx.showModal({
      title: '删除地址',
      content: '确定删除「' + item.detail + '」吗？',
      confirmColor: '#18211a',
      success: function (res) {
        if (!res.confirm) return
        const list = self.data.addresses.filter(function (_, i) { return i !== index })
        if (item.default && list.length) list[0].default = true
        self.saveAddresses(list)
      }
    })
  }
})
