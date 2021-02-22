var app = getApp(); 
var util = require('../../utils/api.js');
Page({
  data: {
    
  },
  onLoad: function (options) {
    this.loadNoticenum();
    this.is_china();
  },
  loadNoticenum:function(){
     var dataMember = app.apicom + '/user/noticenum?'+util.commparams().api_params,
          that = this;
       util.requestGetApi(dataMember,[],function(res){
          that.setData({
            cash_coupon_num : res.data.cash_coupon_num
          })
       })
  },
  onShow:function(){
    this.loadNoticenum()
    var that = this;
    util.unreadStatus(function(){
      that.setData({unread: true})
    },function(){
      that.setData({unread: false })
    })
  },
  setupEvent:function(){
    wx.navigateTo({
      url:"/pages/setup/setup"
    })
  },
  voucherEvent:function(){
    wx.navigateTo({
      url:"/pages/voucher/voucher"
    })
  },
  /*
    是否在中国
  */
  is_china:function(){
    var dataMember  = app.apicom + "/Membershipcard/ineffect?date="+util.c_date()+'&'+util.commparams().api_params,
        that =this;
    util.requestGetApi(dataMember,[],function(res){
      if(res.data.is_china == 'yes'){
        that.setData({is_china:false})
      }else{
        that.setData({is_china:true})
      }
    })
  },
  activityRunEvent:function(){
    wx.navigateTo({
      url:"/pages/activity/activity02/activity02"
    })
  },
  joinusEvent:function(){
    wx.navigateTo({
      url:"/pages/joinus/joinus"
    })
  },
  instructionsEvent:function(){
    wx.navigateTo({
      url:"/pages/instlist/instlist"
    })
  }
})