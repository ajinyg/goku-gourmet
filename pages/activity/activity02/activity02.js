var app = getApp();
var util= require('../../../utils/api.js');
Page({
  data: {
    shareModel:false,
    iphonex  : app.isiphonex, // 判断是否是iphonex
    invite_list:[
          // {
          //   "user_detail":{"nick_name":"蔡榕生","avatar_url":"http://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83epBORvJHTictQK4wg8ialQmbticibrHeT5FEEIvicwg1T6nfyUjU4Aysib8qfG9Cm8W1k64DqQpGRHgniatg/132"},"invite_time":"2018.08.25"
          // },
          // {
          //     "user_detail":null,"invite_time":"2018.08.25"
          // }
        ]
  },
  onLoad: function (options) {
    this.toastedit = this.selectComponent("#toastedit");//获得toastedit组件
    this.loadJapanShare();
    
  },
  /*
     滚屏 数据
  */
  loadJapanShare:function(){
    var that = this;
    var dataRecommend = app.apicom + '/cashcoupon/lists?'+util.commparams().api_params;
    util.requestGetApi(dataRecommend,[],function(res){
      //console.log(JSON.stringify(res.data.invite_list))
      that.setData({
        invite_list:res.data.invite_list
      })
    })
  },
  /*
    分享了解一下
  */ 
  onShareAppMessage: function (res) {
      return {
        title    : wx.getStorageSync('info_user').nickName + '送了你1份免费大餐礼物，拆开看看。',
        imageUrl : "http://img08.oneniceapp.com/upload/resource/900730a194700e1c4fe089618401c560.png",
        path     : "/pages/voucher/voucher?scene="+wx.getStorageSync('login_info').user_id
      }
  },
  openShareModel:function(){
    this.setData({
      shareModel:true
    })
  },
  closeShareModel:function(){
    this.setData({
      shareModel:false
    })
  },
  shareWetPyEvent:function(){
    wx.navigateTo({
      url:'/pages/shareqrcode/shareqrcode'
    })
  }
})