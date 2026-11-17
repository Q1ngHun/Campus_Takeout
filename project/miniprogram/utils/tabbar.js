/**
 * 自定义 tabBar 与页面内 Vant 弹层（action-sheet / dialog / popup）在不同渲染层，
 * 弹层打开时暂时隐藏 tabBar，避免底部操作被遮挡。
 */
function setTabBarVisible(page, visible) {
  if (!page || typeof page.getTabBar !== 'function') return
  const tabBar = page.getTabBar()
  if (tabBar && tabBar.setData) tabBar.setData({ hidden: !visible })
}

function hideTabBar(page) {
  setTabBarVisible(page, false)
}

function showTabBar(page) {
  setTabBarVisible(page, true)
}

module.exports = {
  setTabBarVisible: setTabBarVisible,
  hideTabBar: hideTabBar,
  showTabBar: showTabBar
}
