var app = getApp(); 
var util = require('../../utils/api.js');
Page({
  data: {
    currentTab:0,
    unused_list : [], //  可使用
    used_list   : [],  //  不可使用
    iphonex       : app.isiphonex // 判断是否是iphonex
  },
  onLoad: function (options) {
    var that = this;
    // options = {
    //   scene:5
    // }
    console.log(options)
    this.toastedit = this.selectComponent("#toastedit");//获得toastedit组件
    app.get_window_h(this);//加载设备
    
    this.loadVoucherStatus(options);

    this.loadCashCouponMine(function(res){
      if(options.scene != undefined){
        util.requestGetApi(app.apicom + '/login/invite',{
          invite_userid : options.scene
         },function(r){
            that.errorCodeTips(r);//错误处理
         })
      }
    });
  },
  /*
    可用 － 不可用数据加载
  */ 
  loadVoucherStatus:function(options){
    if(options.scene != undefined){
      this.setData({
        invite_userid:options.scene
      })
    }
    if(options.scene != undefined && wx.getStorageSync('info_user') != ''){
       this.setData({
        backIndex :true
      })
    }
  },
  loadCashCouponMine:function(cb){
       var that = this;
       util.requestGetApi(app.apicom + '/Cashcoupon/Mine',[],function(res){
        if(wx.getStorageSync('info_user')!=''){
          //res.code = 200000
            if(res.code != 200000){
               that.setData({
                  unused_list : res.data.unused_list,
                  used_list   : res.data.used_list
                })
                typeof cb == "function" && cb(res.data)
              }else{
                //console.log('/2')
                wx.removeStorageSync('login_token')
                util.forceLogin(function(){//重新登录
                  that.loadCashCouponMine();
                })
              }
        }else{
          that.setData({
            getSuerInfoFade :true
          })
        }
       })
  },
  //头部点击
  swichNav: function(e){  
    var that = this;  
    if(that.data.currentTab !== e.target.dataset.current ) {  
      that.setData({  
        currentTab:e.target.dataset.current  
      })  
    }
    switch (e.target.dataset.current) {
        case '0':
          this.loadCashCouponMine();
        break;
        case '1':
          this.loadCashCouponMine();
        break;
    }

  },
  /*
    第一步 － > 先授权
  */
  onGotUserInfo:function(e){
    var that = this;
    if(wx.getStorageSync('info_user') == ''){
      util.getGoUserInfo(e.detail,function(){
        that.loadCashCouponMine(function(res){
          if(that.data.invite_userid != undefined){
            util.requestGetApi(app.apicom + '/login/invite',{
              invite_userid : that.data.invite_userid
             },function(r){
                that.errorCodeTips(r);//错误处理
                that.setData({ backIndex :true})
             })
          }
        })
        that.setData({
          getSuerInfoFade :false
        })
      });  
    }
  },
  errorCodeTips:function(r){
    var that = this;
    switch (r.code) {
          case 0://领取成功
          that.loadCashCouponMine();
          that.toastedit.showToast('领取成功',1300);
          break;
          case 200019://人不在日本
          that.toastedit.showToast('抱歉，中国地区不参与此活动～',1300);
          break;
          case 200017://不是新用户
          wx.showModal({title: '提示',content: '您已是老用户，无法领取代金券。',showCancel:false})
          break;
          case 200021://不能邀请自己
          wx.setNavigationBarTitle({ title: ''})
          that.setData({
            userInfo : true
          })
          break;
    }
  },
  activityEvent:function(e){
    var that = this;
    if(wx.getStorageSync('info_user') == ''){
      util.getGoUserInfo(e.detail,function(res){
        wx.navigateTo({
          url:"/pages/activity/activity02/activity02"
        })
      });  
    }else{
       wx.navigateTo({
          url:"/pages/activity/activity02/activity02"
        })
    }
  },
  navindex:function(){
     wx.reLaunch({
        url:"/pages/index/index"
      });
  }
})