var app = getApp();
var util = require('../../../utils/api.js');
Page({
  data: {
    iphonex         : app.isiphonex, // 判断是否是iphonex
    hiddenLoading   :true,
    //状态集合
    card_status:{
      is_checked       : false,//复选框
      is_checked_radio : false,//单选框
      is_noneCard      : false, //打开可退款卡片
      is_peerdetails   : false,//是否打开退款
      conduct_ro_end   : false,//是否打开时间轴
      card_end         : false,//流程结束
      getSetting       : true
    }
  },
  onLoad: function (options) {
    //console.log(options)
   this.setData({
      order_id :options.order_id
    }) 
   this.laod_card_status(options.ident,this);//is卡片状态
   this.load_item_card(options);

   this.is_getsetting(this,options.ident);//判断是否授权
  },
   //申请退款
  application:function(e){
    var shopids = e.currentTarget.dataset.shopids;
     wx.navigateTo({
          url: "../application/application?shopids="+shopids
      });
  },
  is_getsetting:function(that,ident){//is 判断是否授权
    // console.log(wx.getStorageSync('info_user'))
    if(ident == '已结束' || ident == '已退款'){
      that.data.card_status.getSetting = false;
    }else{
      if(wx.getStorageSync('info_user')!=''){
        that.data.card_status.getSetting = false;
      }else{
        that.data.card_status.getSetting = true;
      }
    }
    that.setData({
      card_status:that.data.card_status
    })
  },
  load_item_card:function(options){//卡片赠送订单
      var dataUrl = app.apicom + '/membershipcard/Giftorder?order_id='+options.order_id;
      var that = this;
      util.requestGetApi(dataUrl,[],function(res){
        //console.log(res)
        var subject = res.data.gift_list,membership_list = {},cardlist = [];
           for(var key in subject){
            var item_card = subject[key].membership_card,card_item_status;
            // console.log(subject[key])
            if( subject[key].wait_for_send_gift == 0){
              card_item_status = 'end'
            }else{
              if(options.ident == '已结束' ){
                card_item_status = 'hand'
              }else{
                card_item_status = 'normal'
              }

            }
            if(options.status == 'timeout'){
                if(subject[key].already_purchased == subject[key].total){
                  var card_item_status = 'end';
                  var total_status     = '剩';
                  var total_num        =  0;
                }else if(subject[key].wait_for_send_gift == subject[key].total){
                  var card_item_status = 'hand';
                  var total_status     = '共';
                  var total_num        =  subject[key].total;
                }else if(subject[key].wait_for_send_gift != subject[key].total){
                  var card_item_status = 'hand';
                  var total_status     = '退'
                  var total_num        =  subject[key].already_refunded;
                }
            }else{
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

              if(subject[key].already_refunded == subject[key].total){//已退款情况下
                var card_item_status = 'hand';
                var total_status     = '共'
                var total_num        =  subject[key].already_refunded;
              }
            }
              // console.log(item_card)
              membership_list = {
                order_id               : res.data.order.order_id,//未送出礼物退款需要
                // membership_card_num_id : item_card.membership_card_id,//id
                membership_card_id     : item_card.membership_card_id,//id
                time_interval          : item_card.time_interval,//会员天数
                price                  : item_card.price,//会员价格
                total                  : subject[key].total,//一共数量 
                wait_for_send_gift     : subject[key].wait_for_send_gift,
                card_item              : card_item_status,//卡片状态
                total_status           : total_status,
                total_num              : total_num,
                number                 : 1,//会员卡片数量
                checked                : false//会员卡状态
              }
              // console.log(subject[key])
               cardlist.push(membership_list)
               // console.log(cardlist)
           }
           that.setData({
            cardlist      : cardlist,
            add_time      : util.fmtDate(res.data.order.add_time).replace(/-/g,'.'),
            expire_time   : util.fmtDate(res.data.order.expire_time).replace(/-/g,'.'),
            total_sum     : res.data.receive_list.total,
            hiddenLoading : false
          })
          that.load_time_list(res.data.receive_list,that);//时间轴数据加载
      })
  },
   load_time_list:function(res,that){//时间轴数据加载
      if(res.list.length!=0){
         var time_list = [],obj = res.list,time_obj;
          for(var key in obj){
              var userInfo = obj[key].user_detail; // user 信息
              var cardInfo = obj[key].membership_card;//卡片记录
              time_obj = {
                 
                  nick_name          : userInfo.nick_name,//领取人name
                  time_interval      : cardInfo.time_interval,//卡片的天数
                  add_time           : util.fmtDate(userInfo.add_time).replace(/-/g,'.'),
                  pay_time           : that.fmtDate(obj[key].pay_time),
              }
              time_list.push(time_obj);
              var time_view_lists = {
                  z_receive          : util.day_index().z_day[res.receive],
                  z_total            : util.day_index().z_day[res.total],
                  receive            : res.receive,//剩余 卡片数量
                  total              : res.total,//卡片总数量
                  time_lists          : time_list
              }

          }
          that.setData({
            time_list     : time_view_lists,
            is_time_show  : true,
            hiddenLoading : false
          })
        }else{
          that.data.card_status.conduct_ro_end = false;
          that.setData({
            card_status  : that.data.card_status,
            is_time_show : false
          })
        }
     
  },
  laod_card_status:function(ident,that){//is卡片状态
    console.log(ident)
    if(ident == '未送出'){
      that.data.card_status.conduct_ro_end = false; // 关闭时间轴
      that.data.card_status.is_peerdetails = true; // 打开退款
      that.data.card_status.card_end       = false; //关闭按钮

    }else if(ident == '进行中'){

      that.data.card_status.conduct_ro_end = true; // 打开时间轴
      that.data.card_status.is_peerdetails = false; // 关闭退款
      that.data.card_status.card_end       = false; //关闭按钮

    }else if(ident == '已结束'){
      that.data.card_status.conduct_ro_end = true; // 打开时间轴
      that.data.card_status.is_peerdetails = false; // 关闭退款
      that.data.card_status.card_end       = true; //打开按钮

    }else if(ident == '已退款'){
      that.data.card_status.conduct_ro_end = true; // 打开时间轴
      that.data.card_status.is_peerdetails = false; // 关闭退款
      that.data.card_status.card_end       = true; //打开按钮

    }
    that.setData({
      card_status : that.data.card_status
    })
  },
  nav_calendar:function(e){
    var index = e.currentTarget.dataset.indexIdx;
    var cardlist = this.data.cardlist;
    var order_id = this.data.order_id;

    
    var dataUrl = app.apicom + '/membershipcard/Recievegiftorder?order_id='+order_id+'&membership_card_id='+cardlist[index].membership_card_id;
    
    var that = this;
    util.requestGetApi(dataUrl,[],function(res){
      
      wx.navigateTo({
        url:"../../index/buycalendar/buycalendar?gift_user=yes&membership_card_num_id="+res.data.membership_card_num_id+"&num="+cardlist[index].time_interval
      }); 
    })
    
  },
  //申请退款
  application:function(e){
    var order_id = e.currentTarget.dataset.shopids;
      wx.navigateTo({
          url: "../../order/application/application?order_id="+order_id
      });
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
      nick_name      : user_obj.nickName,// nick Name
      gender         : user_obj.gender,
      language       : user_obj.language,
      city           : user_obj.city,
      province       : user_obj.province,
      country        : user_obj.country,
      avatar_url      : user_obj.avatarUrl,
      iv             : res.iv,
      encrypted_data : res.encryptedData
    }
    return {
      api_info:'nick_name='+ obj.nick_name+'&gender='+obj.gender+'&language='+obj.language+'&city='+obj.city+'&province='+obj.province+'&country='+obj.country+'&avatar_url='+obj.avatar_url+'&iv='+obj.iv+'&encrypted_data='+obj.encrypted_data
    }
  },
  onShareAppMessage: function (res) {//分享
      var that = this;
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
              console.log(res)
            })
          },
          fail: function(res) {
            // 转发失败
          }
        }
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
        return y + '.' + m + '.' + d + ' '+h+':'+minute+':'+second;      
  }
})