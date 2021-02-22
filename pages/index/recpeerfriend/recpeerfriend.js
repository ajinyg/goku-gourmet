var app = getApp();
var util = require('../../../utils/api.js');
var arr = [];
Page({
  data: {
    hiddenLoading  : true,
    init_status    : 'lw-icon',//默认状态 
    iphonex        : app.isiphonex, // 判断是否是iphonex
    //状态集合
    card_status:{
      getSetting       : true,// 默认第一次需要授权
      is_checked_radio : true,//单选框
      normal           : 'normal',  //normal 为 默认状态
      conduct_ro_end   : true, //时间轴 
    }
  },
  onLoad: function (options) {
    this.setData({
      order_id :options.order_id
    })
    this.load_item_card(options.order_id);//加载卡片
    //this.load_time_list();//时间轴数据加载
    this.is_getsetting(this);//is 判断是否授权
    // console.log(this.data)
  },
   navindex:function(){
     wx.reLaunch({
        url:"../index"
      });
  },
   load_item_card:function(order_id){//卡片赠送订单
    console.log('id'+order_id)
      var dataUrl = app.apicom + '/membershipcard/Giftorder?order_id='+order_id;
      var that = this;
       //判断是否登录状态
        if(wx.getStorageSync('login_token')){// 如果是登录过，走这里面
            util.requestGetApi(dataUrl,[],function(res){
              if(res.code != 200000){
                console.log('已登录')
                that.load_item_card_login(res,that);//
              }else{//如果token值失效，走这里
                  wx.removeStorageSync('login_token')
                  util.forceLogin(function(){//如果没有登录过，走这里面
                      util.requestGetApi(dataUrl,[],function(res){
                        that.load_item_card_login(res,that);//
                      })
                  })
              }
              
            })
        }else{//如果初次登录，走这里
          wx.removeStorageSync('login_token')
          util.forceLogin(function(){//如果没有登录过，走这里面
              util.requestGetApi(dataUrl,[],function(res){
                that.load_item_card_login(res,that);//
              })
          })
        }
  },
  load_item_card_login:function(res,that){//is判断登录状态
    // console.log(res)
      // res.data.is_receive  = 'no'
        if(res.data.is_receive == 'yes'){
          that.data.card_status.is_checked_radio = false
          that.setData({
            init_status             : 'past-icon',
            time_interval           : res.data.receive_membership_card.membership_card.time_interval,
            price                   : res.data.receive_membership_card.membership_card.price,
            card_status             : that.data.card_status,
            receive_membership_card : true,
            is_receive              : false
          })
        }else{
          var status = res.data.gift_order.status;
          // console.log(status)
          if(status == 'end'){
            that.data.init_status             = 'lw-end'
            that.data.receive_membership_card = false
            that.data.is_receive              = false
          }else if (status == 'sending'){
            that.data.init_status             = 'lw-icon'
            that.data.receive_membership_card = false
            that.data.is_receive              = true
          }else if(status == 'timeout'){
            that.data.init_status             = 'overtime-icon'
            that.data.receive_membership_card = false
            that.data.is_receive              = false
          }
          that.setData({
            init_status             : that.data.init_status,
            receive_membership_card : that.data.receive_membership_card,
            is_receive              : that.data.is_receive //提交状态
          })
        }
        var subject = res.data.gift_list, membership_list = {}, cardlist = [];
           for(var key in subject){
            var item_card = subject[key].membership_card;
              if(subject[key].already_purchased == subject[key].total){//已领完
                var card_item_status = 'end';
                var total_status     = '剩';
                var total_num        =  0;
              }else if(subject[key].wait_for_send_gift == subject[key].total){//默认没领取
                var card_item_status = 'normal';
                var total_status     = '共';
                var total_num        =  subject[key].total;
              }else if(subject[key].wait_for_send_gift != subject[key].total){//未领完
                var card_item_status = 'normal';
                var total_status     = '剩'
                var total_num        =  subject[key].wait_for_send_gift;
              }else if(subject[key].wait_for_send_gift!=0 && res.data.gift_order.status == 'timeout'){//已超时
                var card_item_status = 'end';
                var total_status     = '剩';
                var total_num        =  subject[key].wait_for_send_gift; 
              }
              membership_list = {
                membership_card_id : item_card.membership_card_id,//id
                time_interval      : item_card.time_interval,//会员天数
                price              : item_card.price,//会员价格
                total              : subject[key].total,//一共数量 
                wait_for_send_gift : subject[key].wait_for_send_gift,
                number             : 1,//会员卡片数量
                total_status       : total_status,
                total_num          : total_num,
                checked            : false,//会员卡状态
                card_item          : card_item_status
              }
               cardlist.push(membership_list)
           }
           // console.log(cardlist)
           that.setData({
            cardlist      : cardlist,//
            add_time      : util.fmtDate(res.data.order.add_time).replace(/-/g,'.'),
            expire_time   : util.fmtDate(res.data.order.expire_time).replace(/-/g,'.'),
            total_sum     : res.data.receive_list.total,
            avatar_url    : res.data.order_user_detail.avatar_url,
            nick_name     : res.data.order_user_detail.nick_name,
            hiddenLoading : false
          })
          that.load_event();//是否为一张卡
          that.load_time_list(res.data.receive_list,that);//时间轴数据加载
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
          // console.log(that.data)
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
  }, 
  load_event:function(){//是否为一张卡
    
    arr.length = 0;
    for(var i=0;i<this.data.cardlist.length;i++){
      if(this.data.cardlist[i].card_item == 'normal'){
         
          arr.push(this.data.cardlist[i]);
      }
    }
    if(arr.length ==1){
      this.data.card_status.is_checked_radio = false
      this.setData({
        card_status : this.data.card_status
      })
    }
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
  onGotUserInfo: function (e) {//判断是否授权
    var info =  e.detail.userInfo;
    if(info != undefined){
        console.log('你点击了确认')
        this.data.card_status.getSetting = false;
        wx.setStorageSync('info_user',info)
        this.user_info(e.detail);//获取

        wx.setStorageSync('userInfoGo',this.user_info(e.detail).api_info);

        var dataUrl = app.apicom + '/User/Setdetail?'+this.user_info(e.detail).api_info;
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
  cardcheck:function(e){//单选
    var select_idx = e.currentTarget.dataset.idx;
      if(this.data.card_status.normal === select_idx) {
        this.data.card_status.normal ='normal'
      }else{
          this.data.card_status.normal =select_idx
      } 
      this.setData({
        card_status   : this.data.card_status
      })
      // console.log(this.data.card_status)
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
  nav_calendar:function(){//跳转选择时间界面
    // console.log(arr)
    var that = this;
    if(arr.length != 1){// 判断是否为一张

      var dataUrl = app.apicom + '/User/Setdetail?'+ wx.getStorageSync('userInfoGo');
        util.requestGetApi(dataUrl,[],function(res){
          console.log(res)
      })
        
        if(that.data.card_status.normal != 'normal'){//判断是否选择卡片
          // console.log(that.data.cardlist[0].time_interval)
            var dataUrl = app.apicom + '/membershipcard/Recievegiftorder?order_id='+that.data.order_id+'&membership_card_id='+that.data.cardlist[that.data.card_status.normal].membership_card_id;
            var that = this;
            util.requestGetApi(dataUrl,[],function(res){
                // console.log(res)
                if(res.code == 200001){
                  wx.showModal({title: '提示',content: '礼物卡片已经领取完了 下手慢喽!',showCancel:false})
                  wx.reLaunch({
                    url:"../index/index"
                  });
                }else{
                  // console.log(res.data.membership_card_num_id)
                  wx.navigateTo({
                    url:"../buycalendar/buycalendar?gift_user=yes&membership_card_num_id="+res.data.membership_card_num_id+"&num="+that.data.cardlist[that.data.card_status.normal].time_interval
                  });
                }
            })
        }else{
          wx.showModal({title: '提示',content: '请选择你想要的礼物',showCancel:false})
        } 
    }else{
      var dataUrl = app.apicom + '/membershipcard/Recievegiftorder?order_id='+that.data.order_id+'&membership_card_id='+arr[0].membership_card_id;
      var that = this;
      util.requestGetApi(dataUrl,[],function(res){
          // console.log(res)
          if(res.code == 200001){
            wx.showModal({title: '提示',content: '礼物卡片已经领取完了 下手慢喽!',showCancel:false})
            wx.reLaunch({
              url:"../index/index"
            });
          }else{
            // console.log(res.data.membership_card_num_id)
            wx.navigateTo({
              url:"../buycalendar/buycalendar?gift_user=yes&membership_card_num_id="+res.data.membership_card_num_id+"&num="+arr[0].time_interval
            });
          }
      })
    }
  }
})