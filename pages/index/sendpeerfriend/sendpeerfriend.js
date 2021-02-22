var app = getApp();
var util = require('../../../utils/api.js');
Page({
  data: {
    iphonex         : app.isiphonex, // 判断是否是iphonex
    hiddenLoading   : true,
    //状态集合
    card_status:{
      getSetting     : true,// 默认第一次需要授权
      is_checked     : false,//复选框
      is_peerdetails : false,//是否打开退款
      conduct_ro_end : false,//是否打开时间轴
    }
  },
  onLoad: function (options) {
    // console.log(options.order_id)
    this.setData({
      order_id :options.order_id
    })
    this.is_getsetting(this);//is 判断是否授权
    this.load_item_card(options.order_id);//卡片赠送订单
    // console.log(wx.getStorageSync('info_user'))
  },
  load_item_card:function(order_id){//卡片赠送订单
      var dataUrl = app.apicom + '/membershipcard/Giftorder?order_id='+order_id;
      var that = this;
      util.requestGetApi(dataUrl,[],function(res){
        // console.log(res)
        var subject = res.data.gift_list,membership_list = {},cardlist = [];
           for(var key in subject){
            var item_card = subject[key].membership_card;
            // console.log(subject[key])
             if(subject[key].already_purchased == subject[key].total){
                var card_item_status = 'end';
                var total_status     = '剩';
                var total_num        =  0;
              }else if(subject[key].wait_for_send_gift == subject[key].total){
                var card_item_status = 'normal';
                var total_status     = '共';
                var total_num        =  subject[key].total;
              }else if(subject[key].wait_for_send_gift != subject[key].total){
                var card_item_status = 'normal';
                var total_status     = '剩'
                var total_num        =  subject[key].wait_for_send_gift;
              }
              membership_list = {
                membership_card_id : item_card.membership_card_id,//id
                time_interval      : item_card.time_interval,//会员天数
                price              : item_card.price,//会员价格
                total              : subject[key].total,//一共数量 
                wait_for_send_gift : subject[key].wait_for_send_gift,
                total_status       : total_status,
                total_num          : total_num,
                number             : 1,//会员卡片数量
                checked            : false//会员卡状态
              }
              // console.log(subject[key].wait_for_purchase)
               cardlist.push(membership_list)
           }
           that.setData({
            cardlist      : cardlist,
            add_time      : util.fmtDate(res.data.order.add_time).replace(/-/g,'.'),
            expire_time   : util.fmtDate(res.data.order.expire_time).replace(/-/g,'.'),
            total_sum     : res.data.receive_list.total,
            hiddenLoading : false
          })
      })
  },
  is_getsetting:function(that){//is 判断是否授权
    if(wx.getStorageSync('info_user')!=''){
      that.data.card_status.getSetting = false;
    }else{
      that.data.card_status.getSetting = true;
    }
    that.setData({
      card_status:that.data.card_status
    })
  },
  onGotUserInfo: function (e) {
    var info =  e.detail.userInfo,obj;
    // console.log(e.detail)
    if(info != undefined){
        console.log('你点击了确认')
        this.data.card_status.getSetting = false;
        wx.setStorageSync('info_user',info)
        this.user_info(e.detail);//获取

        wx.setStorageSync('userInfoGo',this.user_info(e.detail).api_info);

        var dataUrl = app.apicom + '/User/Setdetail?'+ this.user_info(e.detail).api_info;
        util.requestGetApi(dataUrl,[],function(res){
          console.log(res)
        })
    }else{
      console.log('你点击了取消')
      this.data.card_status.getSetting = true;
    }
    this.setData({
      card_status:this.data.card_status
    })
  },
  user_info :function(res){
    var user_obj = res.userInfo;
    var obj = {
      nick_name      : encodeURI(user_obj.nickName),// nick Name
      gender         : user_obj.gender,
      language       : user_obj.language,
      city           : user_obj.city,
      province       : user_obj.province,
      country        : user_obj.country,
      avatar_url     : user_obj.avatarUrl,
      iv             : res.iv,
      encrypted_data : res.encryptedData
    }
    return {
      api_info:'nick_name='+ obj.nick_name+'&gender='+obj.gender+'&language='+obj.language+'&city='+obj.city+'&province='+obj.province+'&country='+obj.country+'&avatar_url='+obj.avatar_url+'&iv='+obj.iv+'&encrypted_data='+obj.encrypted_data
    }
  },
  onUnload: function () {
    wx.reLaunch({ 
      url:"../../order/order?buy_id=send_back"
    })  
  },
  onShareAppMessage: function (res) {//分享
      var that = this;
      console.log(wx.getStorageSync('userInfoGo'))
      var dataUrl = app.apicom + '/User/Setdetail?'+ wx.getStorageSync('userInfoGo');
        util.requestGetApi(dataUrl,[],function(res){
          console.log(res)
      })
    if (res.from === 'button') {
          // 来自页面内转发按钮
         return {
          title    : wx.getStorageSync('info_user').nickName+'送你'+that.data.total_sum+'份礼物，拆开看看',
          imageUrl : 'http://img08.oneniceapp.com/upload/resource/7906bcc41a62c313596d5c217f372948.png',
          path     : 'pages/index/recpeerfriend/recpeerfriend?order_id='+that.data.order_id,
          success: function(res) {
            console.log('转发成功')
            var dataUrl = app.apicom + '/membershipcard/Sendgiftorder?order_id='+that.data.order_id;
            util.requestGetApi(dataUrl,[],function(res){
              // console.log(res)
              wx.reLaunch({ 
                url:"../../order/order?buy_id=send_back"
              })
            })
              
          },
          fail: function(res) {
            // 转发失败
            // wx.reLaunch({ 
            //   url:"../../order/order?buy_id=send_back"
            // })  
          }
        }
      }
      
    }
})