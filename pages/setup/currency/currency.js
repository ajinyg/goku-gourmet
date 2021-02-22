var app = getApp(); 
Page({
  data: {
      currency_sta  : 0,
      currency      :[
              {
                class_name    :'jpy',
                currency_name :'JPY',
                money_name    :'日元'
              },
               {
                class_name    :'cny',
                currency_name :'CNY',
                money_name    :'元'
              },
               {
                class_name    :'usd',
                currency_name :'USD',
                money_name    :'美元'
              },
               {
                class_name    :'hkd',
                currency_name :'HKD',
                money_name    :'港元'
              },
               {
                class_name    :'twd',
                currency_name :'TWD',
                money_name    :'新台币'
              }
      ]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.get_window_h(this);//获取设备高度
    this.init_loadcurrency(this);
  },
  init_loadcurrency:function(that){
    //init 默认进来判断是哪个国家的
    var obj = that.data.currency;
    var curr_zh = wx.getStorageSync('currency')==''?'日元':wx.getStorageSync('currency');
      for(var i=0; i<obj.length; i++){
        if(obj[i].money_name == curr_zh){
            var indexss = i ;
        }
      }
      that.setData({
        currency_sta:indexss
      })
  },
  get_currency_event:function(e){
      var curr_id  = e.currentTarget.dataset.id,
          set_curr = this.data.currency_sta;
          wx.setStorageSync('currency',this.data.currency[curr_id].money_name)
          // console.log(wx.getStorageSync('currency'))
          this.setData({
            currency_sta:curr_id
          })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.reLaunch({
      url:"../index/index"
    }) 
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})