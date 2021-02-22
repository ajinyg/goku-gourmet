var app = getApp(); 
var util = require('../../utils/api.js');
import { NumberAnimate } from './class/numberAnimate.js';
Page({  
  data:{
    //我的会员顶部收回初始化
    currentGesture: 1,
    // tab切换 
    currentTab    : 1,
     // 历史套餐默认为0 
    swiperCurrent : 0,
    //头部
    num           : 0, //节省钱数
    member_head   : {
      day_interval : 0,
      save_money_currency :'元'
    },
    //状态集合
    card_status:{
      is_peerdetails :true,
      is_noneCard : true,//是否打开退款
    },
    isHisShow:true
   
  },  
  onLoad: function(options){  

      app.get_window_h(this);//加载设备宽度加载数字翻页

      this.is_member_user(options);//init 是否为会员 

      this.load_buy_member_gift();//加载购买礼物

      this._load_buy_member()//load 会员卡信息

  },

  /*
    
    判断是否为会员
  
  */

  is_member_user:function(options){
    var dataMember = app.apicom + "/Membershipcard/ineffect?"+util.commparams().api_params;
      util.requestPostApi(dataMember,{
        date : util.c_date()
      },(res)=>{
        /*
          是否为会员
        */
        if(res.data.is_membership == 'yes'){
          this.setData({
            currentTab : 2
          })
        }
        /*
          是否为送出礼物界面返回
        */ 
        if(options && options.buy_id){
          this.setData({
            buy_id : 'send_back',
            currentTab :0
          })
        }
        /*
          是否为退款返回的
        */ 
        if(options && options.current){
          this.setData({
            currentTab:2
          })
        }
      });  
  },

  /*
    会员激活
  */

  sub_member_btn:function(){
    var card_num = this.data.shop_member_card_num;
    if(wx.getStorageSync('info_user') != ''){

        if(card_num){

             var dataMember = app.apicom + '/membershipcard/activation?'+util.commparams().api_params;

             util.requestPostApi(dataMember,{
                membership_card_num_passwd : encodeURI(card_num)
             },function(res){

                if(res.code === 0){
                  wx.showModal({
                    title: '提示',
                    content: '会员卡激活成功',
                    showCancel:false,
                    success:function(){
                        wx.navigateTo({
                          url:"../index/buycalendar/buycalendar?gift_user=yes&num="+res.data.time_interval+'&membership_card_num_id='+res.data.membership_card_num_id
                        })
                    }
                  })
                }else if(res.code == 200011){
                   wx.showModal({title: '提示',content: '此会员卡已激活',showCancel:false})
                }else{
                  wx.showModal({title: '提示',content: '输入有误,请重新输入',showCancel:false})
                }
            });
           }else{
              wx.showModal({title: '提示',content: '会员卡密码不能为空',showCancel:false})
           }
    }
      
  },
  
  
  /*
    加载购买礼物data
  */
  load_buy_member_gift:function(){
      var that = this;
      util.requestGetApi(app.apicom + '/membershipcard/Mygiftorder?'+util.commparams().api_params,[],function(r){
        util.addListLoginStatus(r,function(){
          //已经登陆
          that.load_buy_member_gift_data(r,that);
        },function(){
          //初次登陆
           that.load_buy_member_gift();
        },function(){
          //登陆失效
          that.load_buy_member_gift()
        });
      })
  },
  /*
    load － 会员卡
  */
  _load_buy_member:function(){
    var that = this;
    util.requestGetApi(app.apicom + '/MembershipCard/mine?'+util.commparams().api_params,[],function(r){

      util.addListLoginStatus(r,function(){
        //已经登陆
       that.load_my_member(r,that);       // 我的会员
       that.buy_gift_status_data(r,that); // 未激活的卡
      },function(){
        //初次登陆
        that._load_buy_member();
      },function(){
        //登陆失效
       that._load_buy_member();
      });
    })
  },
  /*
    load － 所品尝套餐
  */
  _load_shipcardconsume:function(){
    var that = this; 
    util.requestGetApi(app.apicom + '/Membershipcardconsume/lists?'+util.commparams().api_params,[],function(r){
      //console.log(res)
      util.addListLoginStatus(r,function(){
        //已经登陆
       that.load_my_shiocard(r,that);
      },function(){
        //初次登陆
        that._load_shipcardconsume();
      },function(){
        //登陆失效
       that._load_shipcardconsume();
      });
    })
  },
  onGotUserInfo:function(e){
    if(wx.getStorageSync('info_user') == ''){

      util.getGoUserInfo(e.detail,(res)=>{
       
        this.userInfoOrtapCurrentTab(this.data.currentTab/1,this); //tab切换数据加载
      });  
    }
  },
  //头部点击
  swichNav: function(e){  
    if(this.data.currentTab !== e.target.dataset.current )this.setData({currentTab:e.target.dataset.current });
    this.userInfoOrtapCurrentTab(this.data.currentTab/1,this); //tab切换数据加载
  },
  /*
    头部tab切换  － 数据切换
  */
  userInfoOrtapCurrentTab:function(index,e){
    switch (index) {
        case 0://点击购买礼物
          e.load_buy_member_gift();
        break;
        case 2://点击我的会员
          e._load_buy_member()//load 会员卡信息
          e._load_shipcardconsume()//load 所品尝套餐信息
        break;
    }
  },
  
  /*
    购买状态数据整理
  */
  buy_gift_status_data:function(res,that){

     if(res.data.notime_list.length != 0){

            var subject = res.data.notime_list,membership_list = {},cardlist = [];
             for(var key in subject){
              var item_card = subject[key];

                membership_list = {
                  platform               : item_card.platform,//查看来源信息
                  can_not_refund_reason  : item_card.can_not_refund_reason,//查看卡片是否通过平台购买
                  is_gift                : item_card.is_gift,//卡片是否为送的
                  membership_card_id     : item_card.membership_card_id,//id
                  membership_card_num_id : item_card.membership_card_num_id,//礼物卡id
                  time_interval          : item_card.time_interval,//会员天数
                  price                  : item_card.price,//会员价格
                  can_refund             : item_card.can_refund//卡片的退款状态
                }
                // time 
                var end_time = {
                  pay_time    : util.fmtDate(item_card.pay_time).replace(/-/g,'.'),
                  expire_time : util.fmtDate(item_card.expire_time).replace(/-/g,'.')
                }
                cardlist.push(membership_list)
             }
            that.setData({
              cardlist      : cardlist,
              end_time      : end_time,
              is_buy_mem    : true//打开空
            }) 
        }
  },
   /*
    送同行朋友 －  状态梳理  
  */
  load_buy_member_gift_data:function(res,that){
      if(res.data.order_list.length != 0){

            var arr = [],subject,obj = res.data.order_list,status_icon;
            
            for(var key in obj){
              var gift_status = obj[key].gift_order.status;

              if(gift_status == 'wait'){
                  status_icon = '未送出'
                  if(obj[key].gift_list.already_purchased == obj[key].gift_list.total){
                      var wait_for_send_gift = 0
                  }else if(obj[key].gift_list.already_purchased !== obj[key].gift_list.total){
                     var wait_for_send_gift = obj[key].gift_list.wait_for_send_gift
                  }

              }else if(gift_status == 'sending'){
                   status_icon = '进行中'
                   if(obj[key].gift_list.already_purchased == obj[key].gift_list.total){
                        var wait_for_send_gift = 0
                    }else if(obj[key].gift_list.already_purchased !== obj[key].gift_list.total){
                       var wait_for_send_gift = obj[key].gift_list.wait_for_send_gift
                    }
              }else if(gift_status == 'end'){
                    status_icon = '已结束'
                    if(obj[key].gift_list.already_purchased == obj[key].gift_list.total){
                        var wait_for_send_gift = 0
                    }else if(obj[key].gift_list.already_purchased !== obj[key].gift_list.total){
                       
                       if(obj[key].gift_list.already_refunded !== obj[key].gift_list.total){
                         var wait_for_send_gift = obj[key].gift_list.already_refunded
                      }else{
                        if(obj[key].gift_list.already_refunded == obj[key].gift_list.total){
                          var wait_for_send_gift = obj[key].gift_list.already_refunded
                        }else{
                          var wait_for_send_gift = obj[key].gift_list.wait_for_send_gift
                        }
                        
                      }
                    }
              }else if(gift_status == 'timeout'){
                  status_icon = '已结束'
                  if(obj[key].gift_list.already_refunded !== obj[key].gift_list.total){
                     var wait_for_send_gift = obj[key].gift_list.already_refunded
                  }else{
                    var wait_for_send_gift = obj[key].gift_list.already_refunded
                  }
              }else if(gift_status == 'refund'){
                 status_icon = '已退款'
              }
                subject = {
                    icon               : status_icon,//文字状态
                    status             : obj[key].gift_order.status,//状态
                    order_id           : obj[key].order.order_id,//卡片id
                    total              : obj[key].gift_list.total,//一共
                    already_purchased  : obj[key].gift_list.already_purchased==undefined?0:obj[key].gift_list.already_purchased,//已领取
                    wait_for_send_gift : wait_for_send_gift,//未领取
                    add_time           : util.fmtDate(obj[key].order.add_time).replace(/-/g,'.'),
                    expire_time        : util.fmtDate(obj[key].order.expire_time).replace(/-/g,'.'),
                }
                arr.push(subject);
            }
            that.setData({
              goodlist : arr
            })
          }
  },
  load_my_member:function(res,that){//会员卡信息
    var len = res.data.list.length;
      if(len != 0){
          //已登录
              if(len >3){
                  that.my_member_data(res,3);//加载小于3张
              }else{
                  that.my_member_data(res,res.data.list.length);//加载大于3张
              } 
              that.setData({  
                  membership_list : that.my_member_data(res,len >3?3:len),
                  member_head:{
                    day_interval        : res.data.day_interval,
                    save_money          : res.data.save_money,
                    save_money_currency : res.data.save_money_currency
                  }
              })
              //数字滚动
              that.num_animate(res.data.save_money*1,that)
          }
  },
  my_member_data:function(res,len){//data会员卡信息
     var subject = res.data.list,membership_list = [];
        for(var i=0; i<len;i++){
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
      this.setData({is_more :len>3?true:false})
      return membership_list;
  },

  shiocard_data:function(res,len){//我所品尝数据data
      var dconsume_sub        = res.data.list;
      var dconsume_shop_list  = [];
      // console.log(res)
      for(var i=0;i<len;i++){  
          var shop_sub    = dconsume_sub[i].shop;
          var package_sub = dconsume_sub[i].package;
          var obj = {
              shop_ids       : shop_sub.shop_id,//菜品id
              shop_id        : dconsume_sub[i].package_id,
              shop_name      : shop_sub.shop_name,
              picture_url    : package_sub.picture_url,
              business_hours : shop_sub.business_hours,
              address        : shop_sub.address,
              cash_coupon    : dconsume_sub[i].cash_coupon,
              add_time       : dconsume_sub[i].add_time,
              currency       : dconsume_sub[i].currency,
              discounted_price : package_sub.discounted_price,
              original_price   : package_sub.original_price,
              full_category   : package_sub.full_category
          }
         dconsume_shop_list.push(obj); 
         // console.log(dconsume_shop_list)
      }
      return dconsume_shop_list;
  },
  load_my_shiocard:function(res,that){//所品尝套餐

    var len = res.data.list.length;
    if(len != 0){
            if(len <5){
              that.shiocard_data(res,res.data.list.length)// 所品尝小于5的情况下
            }else{
              that.shiocard_data(res,5)//所品尝大于5的情况下
            }   
            that.setData({  
                dconsume_shop_list : that.shiocard_data(res,len <5?len:5)
            })
        }
  },
  onPageScroll:function(e){

      var scrollGestrue  = e.scrollTop;
      if(this.data.currentGesture <0){
        this.data.currentGesture = 0
      }
      if(scrollGestrue > this.data.currentGesture){
          this.data.is_swiper = true
      }else{
          this.data.is_swiper = false
      }
      this.data.currentGesture = scrollGestrue
      this.setData({
        currentGesture : this.data.currentGesture,
        is_swiper : this.data.is_swiper
      })
  },
  no_calendar:function(e){
    var shopids = e.currentTarget.dataset.shopids,
        nums    = e.currentTarget.dataset.nums;
    wx.navigateTo({
      url:"/pages/index/buycalendar/buycalendar?gift_user=yes&no_time=yes&membership_card_num_id="+shopids+"&num="+nums
    });
  },
  membership_card_num:function(e){
    //获取input - value － 值
    this.setData({
      shop_member_card_num :e.detail.value
    })
  },
  lookMore:function(){//点击更多
    wx.navigateTo({
          url: "../order/memberdetails/memberdetails"
    });
  },
  
  //事件处理函数
  swiperchange: function(e) {
      this.setData({  
        swiperCurrent: e.detail.current  
      })  
  },
  //如果不是会员，那么就跳转购买会员去
  _buy_member:function(){
     wx.navigateTo({
          url: "../index/buymember/buymember"
     }); 
  },
   //点击打开详情
  shop_detail:function(e){
      var shop_idx = e.currentTarget.dataset.idx;
      var shop_id = e.currentTarget.dataset.shopid;
      wx.navigateTo({
          url: "/pages/index/detail/detail?package_id="+shop_idx+'&shop_id='+shop_id
      });
  },
  //查看礼物详情
  nav_details:function(e){
    var ident    = e.currentTarget.dataset.ident;
    var order_id = e.currentTarget.dataset.order_id;
    var status   = e.currentTarget.dataset.status;
    wx.navigateTo({
        url: "/pages/order/buypeerdetails/buypeerdetails?status="+status+"&ident="+ident+"&order_id="+order_id
    });
  },
  //申请退款
  application:function(e){
    var datasets = e.currentTarget.dataset,
        shopids  = datasets.shopids,
        aleady   = datasets.aleady,
        refund   = datasets.refund,
        platform = datasets.platform,
        is_gift  = datasets.gift;
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
  //历史套餐
  get_his_curent:function(){
  	  wx.navigateTo({
      		url: "/pages/order/historypack/historypack"
      });	
  },
  //激活tab 
  bindChange:function(e){  
    this.setData({ currentTab: e.detail.current });
  },
  onShow:function(){ 

    this._load_shipcardconsume()//load 所品尝套餐信息 
    var that = this;
    util.unreadStatus(function(){
      that.setData({unread: true})
    },function(){
      that.setData({unread: false })
    }) 
  },
  num_animate:function(num,ele){//数字滚动
    var n1 = new NumberAnimate({
        from:num,
        speed:1000,
        decimals:0,
        refreshTime:100,
        onUpdate:()=>{
            ele.setData({
              num : n1.tempValue
            });
        }
      }); 
  }
})  