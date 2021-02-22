var app = getApp();
var util= require('../../../utils/api.js');
Page({
  data: {
    is_new:true, // 是否为新用户 － > 默认为true
    iphonex: app.isiphonex // 判断是否是iphonex
  },
  onLoad: function (options) {
    this.toastedit = this.selectComponent("#toastedit");//获得toastedit组件
    app.get_window_h(this);//获取设备高度
    this.loadNewusergift();

  },
  loadNewusergift:function(){
    var that = this;
    var dataRecommend = app.apicom + '/Membershipcard/ineffect?'+util.commparams().api_params;
    wx.showLoading({title: '正在加载中'})
    util.requestGetApi(dataRecommend,[],function(res){
      // res.data.is_new = 'yes'
      that.setData({
        is_new:res.data.is_new == 'yes'?true:false
      })
       wx.hideLoading()
    })
  },
  onGotUserInfo:function(e){
    var that = this;
    var dataRecommend = app.apicom + '/Membershipcard/newusergift?'+util.commparams().api_params;
    if(this.data.is_new){
      if(wx.getStorageSync('info_user')!=''){
          util.requestGetApi(dataRecommend,[],function(res){
               // res.code = 0
               switch (res.code) {
                    case 0://
                       wx.showLoading({title: '正在加载中'})
                        setTimeout(function(){
                            that.toastedit.showToast('领取成功',1100);
                            wx.hideLoading()
                        },600)
                        setTimeout(()=>{
                          wx.reLaunch({
                            url:"/pages/order/order?current='yes'"
                          })
                        },1200); 
                    break;
                    case 200017:
                     that.toastedit.showToast('您已是老用户',1100);
                    break;
                    case 200000://未登录  
                      wx.removeStorageSync('login_token')
                      util.forceLogin(function(){
                        that.loadNewusergift();
                      })
                    break;
                }
          })
      }else{
        util.getGoUserInfo(e.detail,function(r){
          util.requestGetApi(dataRecommend,[],function(res){
            // res.code = 0
              switch (res.code) {
                  case 0://
                     wx.showLoading({title: '正在加载中'})
                      setTimeout(function(){
                          that.toastedit.showToast('领取成功',1100);
                          wx.hideLoading()
                      },600)
                      setTimeout(()=>{
                        wx.reLaunch({
                           url:"/pages/order/order?current='yes'"
                        })
                      },1200); 
                  break;
                  case 200017:
                   that.loadNewusergift();
                   that.toastedit.showToast('您已是老用户',1100);
                  break;
              }
          })
        });
      }
    }else{
       this.toastedit.showToast('您已是老用户',900);
    }
  },
  onUnload:function(){
    util.on('setNewActivity02',{
      new_activity01:'yes'
    })
  }
})