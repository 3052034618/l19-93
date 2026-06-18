export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/report/index',
    'pages/scenic/index',
    'pages/clue-detail/index',
    'pages/feedback/index',
    'pages/records/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E56A0',
    navigationBarTitleText: '舆情巡检',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#6B7280',
    selectedColor: '#1E56A0',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/report/index',
        text: '巡检日报'
      }
    ]
  }
})
