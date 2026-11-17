const { useCampusStore } = require('../../store/campus')
const ui = require('../../utils/ui')

Page({
  data: {
    statusBarHeight: 20,
    addresses: [],
    selectMode: false,
    sheetVisible: false,
    saving: false,
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
    this.store = useCampusStore()
    this.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      selectMode: options.select === '1'
    })

    this.unsubscribe = this.store.$bind(this, function (state) {
      return { addresses: state.addresses || [] }
    })
    this.store.bootstrap()
    this.loadAddresses()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  loadAddresses() {
    this.setData({ addresses: this.store.addresses })
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
    const address = this.store.addresses.find(function (item) { return item.id === id })
    if (!address) return

    this.store.selectAddress(address)
    this.loadAddresses()

    if (this.data.selectMode) {
      ui.toast('已选择收货地址')
      setTimeout(function () { wx.navigateBack() }, 350)
    } else {
      ui.toast('已设为默认地址')
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
    if (!item) return
    this.setData({
      sheetVisible: true,
      editingIndex: index,
      draft: {
        id: item.id,
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
    const value = typeof e.detail === 'string' ? e.detail : e.detail.value
    const draft = Object.assign({}, this.data.draft)
    draft[field] = value
    this.setData({ draft: draft })
  },

  chooseLabel(e) {
    const draft = Object.assign({}, this.data.draft, { label: e.currentTarget.dataset.label })
    this.setData({ draft: draft })
  },

  saveAddress() {
    const draft = this.data.draft
    if (!draft.name.trim()) {
      ui.toast('请填写收货人')
      return
    }
    if (!draft.phone.trim()) {
      ui.toast('请填写联系电话')
      return
    }
    if (!draft.detail.trim()) {
      ui.toast('请填写详细地址')
      return
    }

    const page = this
    this.setData({ saving: true })
    const payload = this.data.editingIndex > -1
      ? Object.assign({}, draft)
      : {
        name: draft.name,
        phone: draft.phone,
        label: draft.label,
        detail: draft.detail,
        note: draft.note
      }

    this.store.saveAddress(payload).then(function () {
      page.setData({ sheetVisible: false, saving: false })
      page.loadAddresses()
      ui.toast('地址已保存')
    }).catch(function () {
      page.setData({ saving: false })
      ui.toast('保存失败，请稍后再试')
    })
  },

  deleteAddress(e) {
    const index = Number(e.currentTarget.dataset.index)
    const item = this.data.addresses[index]
    if (!item) return
    const page = this

    ui.confirm({
      title: '删除地址',
      message: '确定删除「' + item.detail + '」吗？'
    }).then(function () {
      page.store.deleteAddress(item.id)
      page.loadAddresses()
      ui.toast('地址已删除')
    }).catch(function () {})
  }
})
