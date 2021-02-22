var app = getApp(); 
var util = require('../../../utils/api.js');
Page({
  data: {
    is_his: false, // 模版加载 － 两种方案
    hiddenLoading : true, //Loading 
  },
  onLoad: function (options) {
    app.get_window_h(this);//获取设备高度
    this._load_historypack();
  },
  _load_historypack:function(){
     var dataUrl = app.apicom + '/Membershipcardconsume/Sumlists?'+util.commparams().api_params;
     var that    = this;
      util.requestGetApi(dataUrl,[],function(res){
        var dconsume_sub = res.data.list,
            dconsume_shop_list =[];
        for(var key in dconsume_sub){
            var shop_sub    = dconsume_sub[key].shop;
            var package_sub = dconsume_sub[key].package;
          var obj = {
              shop_ids       : shop_sub.shop_id,//菜品id
              shop_id        : dconsume_sub[key].package_id,
              shop_name      : shop_sub.shop_name,
              picture_url    : package_sub.picture_url,
              business_hours : shop_sub.business_hours,
              address        : shop_sub.address,
              cash_coupon    : dconsume_sub[key].cash_coupon,
              add_time       : dconsume_sub[key].add_time,
              currency       : dconsume_sub[key].currency,
              discounted_price : package_sub.discounted_price,
              original_price   : package_sub.original_price,
              full_category   : package_sub.full_category,
              shopconsum:dconsume_sub[key].shopconsum,
              brwShow:false
          }
           dconsume_shop_list.push(obj);
        }
        that.setData({
          dconsume_shop_list:dconsume_shop_list,
          hiddenLoading : false, 
        })
    })
  },
  shop_detail:function(e){
     var shop_idx = e.currentTarget.dataset.idx;
     var shop_id = e.currentTarget.dataset.shopid;
     //console.log(shop_idx)
      wx.navigateTo({
          url: "/pages/index/detail/detail?package_id="+shop_idx+'&shop_id='+shop_id
      });
  },
  seehisEvent:function(e){
    var index = e.currentTarget.dataset.index,dconsume_shop_list = this.data.dconsume_shop_list;
    dconsume_shop_list[index].brwShow = dconsume_shop_list[index].brwShow?false:true;
    this.setData({dconsume_shop_list:dconsume_shop_list})
  }
})