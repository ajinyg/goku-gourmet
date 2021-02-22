var app = getApp();
var util = require('../../../utils/api.js');
Page({
  data: {
    iphonex             : app.isiphonex, // 判断是否是iphonex
    purchase            :true,
    hiddenLoading       :true,
    wet : 'no'
  },
  onLoad: function (options) {
    if(options.wet !== undefined){
      this.setData({wet:'wetex'})
    }
    this._load_buy_member()//加载会员列表
    console.log(this.data)
  },
  _load_buy_member:function(){
    var that    = this;
    var dataUrl = app.apicom + '/MembershipCard/lists?'+util.commparams().api_params;
    util.requestGetApi(dataUrl,[],function(res){
       var subject      = res.data.list,membership_list = {}
       membership_list  = {
          membership_list : subject,
          hiddenLoading   : false
       }
       that.setData(membership_list)
    })
  },
  onGotUserInfo:function(e){
   var id     = e.currentTarget.dataset.cardId,
      cardDay = e.currentTarget.dataset.days,
      that= this;
    if(wx.getStorageSync('info_user')!=''){
      if(this.data.wet == 'wetex'){
        wx.navigateTo({
          url: "/pages/index/buycalendar/buycalendar?carId="+id+'&cardDay='+cardDay+'&wet='+this.data.wet
        })
      }else{
        wx.navigateTo({
          url: "/pages/index/buycalendar/buycalendar?carId="+id+'&cardDay='+cardDay
        })
      }
    }else{
      util.getGoUserInfo(e.detail,function(r){
       if(that.data.wet == 'wetex'){
          wx.navigateTo({
            url: "/pages/index/buycalendar/buycalendar?carId="+id+'&cardDay='+cardDay+'&wet='+this.data.wet
          })
        }else{
          wx.navigateTo({
            url: "/pages/index/buycalendar/buycalendar?carId="+id+'&cardDay='+cardDay
          })
        }
      });
    }
  },
  onGotUserInfos:function(e){
    if(wx.getStorageSync('info_user') == ''){
      util.getGoUserInfo(e.detail)
    }else{
       wx.navigateTo({
        url: "/pages/index/buypeerfriend/buypeerfriend"
      })
    }
  },
  navbuypeer:function(){
   
  },
  navprivacypolicy:function(){//跳转服务条款
    wx.navigateTo({
        url: "/pages/setup/privacypolicy/privacypolicy"
      })
  }
})