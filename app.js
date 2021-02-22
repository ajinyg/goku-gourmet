//app.js 
App({
  apicom       : "https://gokudeli.oneniceapp.com",
  // apicom       : "http://rdtest2.want.oneniceapp.com",
  map_api      : 'http://api.map.baidu.com/staticimage?width=450&height=250&zoom=17&markerStyles=l,&center=',
  isiphonex    : false,
  isiphonePlus : false,
  from_data    : '',
  onLaunch:function (options){ 
      this.isipx();//是否为iphone x
      this.updateManager();//强行更新
      if(wx.getStorageSync('timefun') == ''){
         wx.setStorageSync('timefun',Math.round(+ new Date()/1000/60))
      }else{return}

  },
   /**
   * 初始化登录
   */
  getCommit:function(callBack){//GET position
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
          wx.setStorageSync('lola', {latitude : res.latitude,longitude: res.longitude});
      },
      fail: function (res){
          wx.setStorageSync('lola', {latitude:"0",longitude: "0"});
      },
      //语言请求发送
      complete:function(){
        wx.setStorageSync('lang', wx.getSystemInfoSync().language);
        callBack && callBack(wx.getStorageSync('lang') != ''?'success':'error')
      }
    })  
  },
  /*
    强行更新
  */ 
  updateManager:function (){
    var upManager = wx.getUpdateManager();
    upManager.onCheckForUpdate(function (res) {
      if(res.hasUpdate){
        upManager.onUpdateReady(function(){
            upManager.applyUpdate();
        })
      }else{
        console.log('未发现新版本～～')
      }
    });
  },
  isipx:function(){ //专门处理iphonex
    if(wx.getSystemInfoSync().model.indexOf('iPhone X')!=-1)this.isiphonex = true;
    if(wx.getSystemInfoSync().model.indexOf('iPhone 6 Plus')!=-1)this.isiphonePlus = true;
  },
  get_window_h:function(ele){//获取设备屏幕
    wx.getSystemInfo({
      success: function(res){
        ele.setData({ 
          winHeight: res.windowHeight,
          winWidth : res.windowWidth
        });
      }
    });  
  },
  globalData:{
    userInfo:null,
    openid:null
  }
})