var app = getApp(); 
var util = require('../../../utils/api.js');
Page({
  data: {
    hiddenLoading : true,
    purchase      : false // is 带 del ,
  },
  onLoad: function (options) {
    this._load_buy_member();//加载会员卡
  },
   //申请退款
  application:function(e){
    console.log(e)
    var shopids  = e.currentTarget.dataset.shopids,
        aleady   = e.currentTarget.dataset.aleady,
        refund   = e.currentTarget.dataset.refund,
        platform = e.currentTarget.dataset.platform,
        is_gift = e.currentTarget.dataset.gift;
        if(aleady == 'yes'){
          if(is_gift == 'yes'){
            wx.showModal({
              title: '提示',
              content: '尊敬的用户您好 您的会员卡为礼物卡 若要退款将退至购买该卡用户中 请熟知',
              showCancel:true,
              success:function(res){
                if(res.confirm){
                    wx.navigateTo({
                      url: "/pages/order/application/application?shopids="+shopids
                    });
                }
              }
            })
          }else{
            wx.navigateTo({
                url: "/pages/order/application/application?shopids="+shopids
            });
          }
         
        }else{
          if(refund == 'platform'){
            if(platform == '其他'){
              wx.showModal({title: '提示',content: '抱歉，您所退款的会员卡为其他平台购买，请联系购买方进行退款。',showCancel:false})    
            }else{
              wx.showModal({title: '提示',content: '抱歉，该会员卡为'+platform+'平台购买，请前往'+platform+'平台申请退款！',showCancel:false})    
            }
          }else if(refund == 'timeout'){
            wx.showModal({title: '提示',content: '抱歉，会员卡已距离出行时间小于24小时或已使用会员特权功能，不能申请退款。',showCancel:false})
          }
        }

  },

 _load_buy_member:function(){
    var that = this;
    var dataUrl  = app.apicom + '/MembershipCard/mine?'+util.commparams().api_params //会员公用api
    util.requestGetApi(dataUrl,[],function(res){
      //console.log(res)
      if(res.code !== 200000 ){
        if(res.data.list.length != 0){
          //已登录
          var subject         = res.data.list,
              membership_list = [],
              num             = that.data.data_more;
              for(var i=0; i<subject.length;i++){
                var obj = {
                      platform                : subject[i].platform,//查看来源信息
                      can_not_refund_reason   : subject[i].can_not_refund_reason,//查看卡片是否通过平台购买
                      can_refund              : subject[i].can_refund,//是否超过24小时
                      status                  : subject[i].status,//卡片退款状态
                      is_gift                 : subject[i].is_gift,//卡片是否为送的
                      membership_card_num_id  : subject[i].membership_card_num_id,//退款id
                      membership_card_id      : subject[i].membership_card_id,
                      time_interval           : subject[i].time_interval,
                      price                   : subject[i].price,
                      start_time              : util.fmtDate(subject[i].start_time).replace(/-/g,'.'),
                      end_time                : util.fmtDate(subject[i].end_time).replace(/-/g,'.')
                  }
                  membership_list.push(obj)
              }
              that.setData({  
                  membership_list : membership_list,
                  hiddenLoading   : false,//关闭loding
              })  
          }
      }else{ 
        //未登录
        util.forceLogin(function(){
          util.requestGetApi(that.data.api,[],function(res){
            if(res.data.list.length != 0){//是否会员
                var subject       = res.data.list,
                membership_list   = [],
                num               = that.data.data_more;
                for(var i=0; i<subject.length;i++){
                        var obj = {
                            platform                : subject[i].platform,//查看来源信息
                            can_not_refund_reason   : subject[i].can_not_refund_reason,//查看卡片是否通过平台购买
                            can_refund              : subject[i].can_refund,//是否超过24小时
                            status                  : subject[i].status,//卡片退款状态
                            is_gift                 : subject[i].is_gift,//卡片是否为送的
                            membership_card_num_id  : subject[i].membership_card_num_id,//退款id
                            membership_card_id      : subject[i].membership_card_id,
                            time_interval           : subject[i].time_interval,
                            price                   : subject[i].price,
                            start_time              : util.fmtDate(subject[i].start_time).replace(/-/g,'.'),
                            end_time                : util.fmtDate(subject[i].end_time).replace(/-/g,'.')
                        }
                        membership_list.push(obj)
                }
                that.setData({ 
                    // is_buy_mem      : true,//打开空
                    membership_list : membership_list,
                    member_head:{
                      day_interval : res.data.day_interval,
                      save_money   : res.data.save_money 
                    },
                    hiddenLoading   : false,//关闭loding
                })
              }else{
                that.setData({ is_buy_mem :false})
              }
          }) 
        });
      }
    })
  }
})