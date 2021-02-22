var app = getApp();
var util = require('../../../utils/api.js');
Page({
  data: {
    iphonex         : app.isiphonex, // 判断是否是iphonex
    order_id      :'normal',
    writeSuccess  : false
  },
  onLoad: function (options) {

    app.get_window_h(this);//加载设备宽度

    this.is_order_card(options,this);//加载书否通过批量退款打开

    this.load_information(this,options)//加载来源信息
    
  },
  load_information:function(that,options){//退款来源
      console.log(options)
      var dataMember;
      if (that.data.order_id !='normal') {
        dataMember = app.apicom + '/membershipcard/Orderdetail?order_id='+that.data.order_id;
        util.requestGetApi(dataMember,[],function(res){
          console.log(res.data.order)
          var subject_card     = res.data.order;
          var obj = {
              time_interval           : subject_card.time_interval,
              price                   : subject_card.price,
              membership_card_num_id  : subject_card.order_id,
              platform                : subject_card.platform,
              pay_time                : that.fmtDate(subject_card.payed_time),
              pay_price               : subject_card.refund_price
          }
          that.setData({
            in      : obj
           
          })
        })
      }else{
        dataMember = app.apicom + '/membershipcard/detail?membership_card_num_id='+options.shopids;
         util.requestGetApi(dataMember,[],function(res){
          var subject_card     = res.data.membership_card,
              subject_card_num = res.data.membership_card_num;
          var obj = {
              time_interval           : subject_card.time_interval,
              price                   : subject_card.price,
              membership_card_num_id  : subject_card_num.membership_card_num_id,
              platform                : subject_card_num.platform,
              pay_time                : that.fmtDate(subject_card_num.pay_time),
              pay_price               : subject_card_num.pay_price
          }
          that.setData({
            in      : obj
           
          })
       })
      }
      
      
  },
  is_order_card:function(options,that){
    if(options.order_id!=undefined){
        that.setData({
          order_id :options.order_id
        })
    }else{
        that.setData({
          order_id :'normal'
        })
    }

    if(options.shopids !=undefined){
      that.setData({
        shopids :options.shopids
      })
    }
  },
  fmtDate:function(timeStamp){//解析php时间戳
        var date = new Date();  
        date.setTime(timeStamp * 1000);  
        var y = date.getFullYear();      
        var m = date.getMonth() + 1;      
        m = m < 10 ? ('0' + m) : m;      
        var d = date.getDate();      
        d = d < 10 ? ('0' + d) : d;      
        var h = date.getHours();    
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();    
        var second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;      
        second = second < 10 ? ('0' + second) : second;    
        return y + '-' + m + '-' + d + ' '+h+':'+minute+':'+second;      
  }, 
  application_btn:function(){
    var dataMember,that =this;
    if(this.data.reason_val){
      if(this.data.reason_val.length < 5){
        wx.showModal({title: '提示',content: '退款原因不得少于五个字',showCancel:false})
      }else{
        if(this.data.mobile_n){
            if(this.data.mobile_n.length !=11){
                 wx.showModal({title: '提示',content: '手机号码格式不正确',showCancel:false})
            }else{
              wx.showLoading({title: '正在加载中'})
              if (that.data.order_id !='normal') {
                dataMember = app.apicom + '/MembershipCard/Applyrefund?order_id='+this.data.order_id+'&mobile='+this.data.mobile_n+'&reason='+encodeURI(encodeURI);
                util.requestGetApi(dataMember,[],function(res){
                   that.setData({writeSuccess  : true});
                    wx.hideLoading();
                     wx.showModal({title: '提示',content: '退款成功',showCancel:false,
                      success: function (res) {
                         wx.reLaunch({ url:"../../order/order?buy_id=send_back"})
                      }
                    })
                })
              }else{
                dataMember = app.apicom + '/MembershipCard/Applyrefund?membership_card_num_id='+this.data.shopids+'&mobile='+this.data.mobile_n+'&reason='+encodeURI(this.data.reason_val);
                util.requestGetApi(dataMember,[],function(res){
                   that.setData({writeSuccess  : true});
                    wx.hideLoading();
                     wx.showModal({title: '提示',content: '退款成功',showCancel:false,
                      success: function (res) {
                         wx.reLaunch({ url:"../../order/order?current=2"})
                      }
                    })
                })
              } 
            }
        }else{
          wx.showModal({title: '提示',content: '手机号码不能为空',showCancel:false})
        }
      }
    }else{
        wx.showModal({title: '提示',content: '退款原因不能为空 确认后重新填写',showCancel:false})
    }
  },
  lication_reason:function(e){//退款原因
    var reason_val = e.detail.value;
    this.setData({
      reason_val:reason_val
    })
  },
  mobile_reason:function(e){
    var reason_val = e.detail.value;
    this.setData({
      mobile_n:reason_val
    })
  }
})