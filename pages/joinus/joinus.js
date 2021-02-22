var app = getApp();
Page({
  data: {
    image:['http://img08.oneniceapp.com/upload/resource/61105a7d4ea9c78b4c9d712fac500d50.jpg'],
    iphonex : app.isiphonex // 判断是否是iphonex
  },
  onLoad: function (options) {
    
  },
  //图片点击事件
  openPicGraph:function(event){
      var src = event.currentTarget.dataset.src;//获取data-src
    //图片预览
    wx.previewImage({
        current : src, // 当前显示图片的http链接
        urls    : this.data.image // 需要预览的图片http链接列表
    })
   },
})