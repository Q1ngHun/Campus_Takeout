Component({
  properties: {
    icon: {
      type: String,
      value: 'bag'
    },
    title: {
      type: String,
      value: '这里空空如也'
    },
    desc: {
      type: String,
      value: '去首页逛逛，发现宿舍楼下的好味道'
    },
    action: {
      type: String,
      value: ''
    }
  },
  methods: {
    handleAction() {
      this.triggerEvent('action')
    }
  }
})
