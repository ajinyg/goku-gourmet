var app = getApp(); 
Page({
  data: {
  },
  onLoad: function (options) {

  },
  explainEvent:function(){
    wx.navigateTo({
      url:"/pages/instlist/explain/explain"
    })
  },
  instEvent:function(){
    wx.navigateTo({
      url:"/pages/instlist/inst/inst"
    })
  }
  
})