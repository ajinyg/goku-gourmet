var app = getApp(); 
Page({
  data: {
    hiddenLoading:true
  },
  onLoad: function (options) {
    app.get_window_h(this);//获取设备高度
     //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
    // console.log(this.dialog)
    setTimeout(()=>{
      this.setData({
        hiddenLoading:false
      })
    },150)
  },
  get_currency:function(){
    wx.navigateTo({
      url:"../setup/currency/currency"
    })
  },
  get_privacypolicy:function(){//服务条款
    wx.navigateTo({
      url:"../setup/privacypolicy/privacypolicy"
    })
  },
  get_terms:function(){//隐私政策
    wx.navigateTo({
      url:"../setup/terms/terms"
    })
  },
  get_aboutus:function(){//关于我们
    wx.navigateTo({
      url:"../setup/Aboutus/Aboutus"
    })
  },
  showDialog:function(){
    console.log(this.dialog)
     this.dialog.showDialog();
  },
  //取消事件
  _cancelEvent() {
    console.log('你点击了取消');
    this.dialog.hideDialog();
  },
  //确认事件
  _confirmEvent() {
    console.log('你点击了确定');
    this.dialog.hideDialog();
  },
  
})