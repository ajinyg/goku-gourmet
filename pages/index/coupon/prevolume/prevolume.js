var app = getApp();
var util = require('../../../../utils/api.js');
import { GuKuList } from '../../detail/class/detail.js';
Page({
  data: {
    scrollindex   : 0,  //当前页面的索引值
    // totalnum:3,  //总共页面数
    starty        : 0,  //开始的位置x
    endy          : 0, //结束的位置y
    critical      : 100, //触发翻页的临界值
    margintop     : 0,  //滑动下拉距离
    hiddenLoading : true,
    iphonex       : app.isiphonex, // 判断是否是iphonexisiphonePlus
    iphonePlus    : app.isiphonePlus,
  },
  onLoad: function (options) {
    console.log(options)
      var that       =  this;
      var shop_id    = options.shop_id;
      // shop_id = 41;
      var detailData = app.apicom + "/Membershipcardconsume/lists/?shop_id=" + shop_id+"&"+util.commparams().api_params;
      util.requestGetApi(detailData,[],function(res){
        var list = [];
        var subjects = res.data.list;
        for (var key in subjects) {
          var subject  = subjects[key].package;
          var sbtype   = subjects[key].shop;
          
          var temp ={//shop List 单独 data 处理
                picture_url : subject.picture_url,
                add_time    : subjects[key].add_time,
                pay_price   : subjects[key].cash_coupon.pay_price,
                price       : subjects[key].cash_coupon.price,
                currency          : subjects[key].currency,
                commod_list       : {
                  currency          : subject.currency,//价格
                  name              : sbtype.shop_name,//套餐name
                  package_name      : subject.package_name,
                  package_type      : subject.package_type.join("  |   "),//套餐类型x
                  // distance          : subject.distance===undefined?0+'m':subject.distance,//距离
                  discount          : subject.discount,//折扣
                  original_price    : subject.original_price,//原始价格
                  discounted_price  : subject.discounted_price,//折后价格
                  cash_coupon       : sbtype.cash_coupon,//代金券
                  full_category     : subject.full_category,
                  wifi              : sbtype.wifi
                } 
          }
        
          list.push(temp)
        }
        that.setData({
              list          : list,
              totalnum      : res.data.list.length,
              hiddenLoading : false
        }); 
        // console.log(res)
      })
      console.log(this.data)
  },
  scrollTouchstart:function(e){
    let py = e.touches[0].pageY;
    this.setData({
      starty: py
    })
  },
  scrollTouchmove:function(e){
    let py = e.touches[0].pageY;
    let d = this.data;
    this.setData({
      endy: py,
    })
    if(py-d.starty<100 && py-d.starty>-100){    
      this.setData({
        margintop: py - d.starty
      })
    }
  },
  scrollTouchend:function(e){
    let d = this.data;
    // console.log(this.data)
    if(d.endy-d.starty >100 && d.scrollindex>0){

      this.setData({
        scrollindex: d.scrollindex-1
      })
    }else if(d.endy-d.starty <-100 && d.scrollindex<this.data.totalnum-1){

      this.setData({
        scrollindex: d.scrollindex+1
      })
    }
    this.setData({
        starty:0,
        endy:0,
        margintop:0
    })
  }
})