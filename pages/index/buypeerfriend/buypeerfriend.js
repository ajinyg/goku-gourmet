var app = getApp();
var util = require('../../../utils/api.js');
Page({
  data: {
    iphonex         : app.isiphonex, // 判断是否是iphonex
    hiddenLoading:true,
    goodsList:{
      totalPrice : 0//默认为0
    },
    //状态集合
    card_status:{
      is_checked     : true,//复选框
      send_card      : true,//购买礼物
      is_peerdetails : false,//是否打开退款
      conduct_ro_end : false,//是否打开时间轴
    }
  },
  onLoad: function (options) {
    this._load_buy_member();//加载会员卡
  },
  _load_buy_member:function(){//加载卡片
    var that    = this;
    var dataUrl = app.apicom + '/MembershipCard/lists?'+util.commparams().api_params;
    console.log(dataUrl)
    util.requestGetApi(dataUrl,[],function(res){
       var subject = res.data.list,membership_list = {},cardlist = [];
       for(var key in subject){
          membership_list = {
            membership_card_id : subject[key].membership_card_id,//id
            time_interval      : subject[key].time_interval,//会员天数
            price              : subject[key].price,//会员价格
            number             : 1,//会员卡片数量
            checked            : false//会员卡状态
          }
           cardlist.push(membership_list)
       }
       that.setData({
        cardlist      : cardlist,
        hiddenLoading : false
      })
    })
  },
  cardcheck:function(e){//多选
    var index       = e.currentTarget.dataset.idx;
        this.data.cardlist[index].checked = !this.data.cardlist[index].checked;
        if(this.data.cardlist[index].number == 0){
          this.data.cardlist[index].number = 1
        }
        this.setData({
            cardlist    : this.data.cardlist
        })
        this.setGoodsList(this.totalPrice(),this.noSelect(),this.data.cardlist);//支付价格改变
  },
  jiaBtnTap:function(e){//增加
    var index = e.currentTarget.dataset.index,
        num   = this.data.cardlist[index].number;
    if(index!=="" && index != null){
      if(num<100){
        num++; 
        this.data.cardlist[index].number = num

        this.setData({
            cardlist:this.data.cardlist
        })
         this.setGoodsList(this.totalPrice(),this.noSelect(),this.data.cardlist);//支付价格改变
      }
    }
   },
   jianBtnTap:function(e){//减少
    var index = e.currentTarget.dataset.index,
        num   = this.data.cardlist[index].number,
        obj   = this.data.cardlist;
    if(index!=="" && index != null){
      if(num>0){
        num--; 
        this.data.cardlist[index].number = num

        for(var key in obj){
          if(obj[key].number == 0){
            obj[key].checked = false
          }
        }

        this.setData({
            cardlist:this.data.cardlist
        })
        this.setGoodsList(this.totalPrice(),this.noSelect(),this.data.cardlist);//支付价格改变
      }
    }
   },
   totalPrice:function(){//价格改变
      var list = this.data.cardlist;
      var total = 0;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(curItem.checked){
            total+= parseFloat(curItem.price)*curItem.number;
          }
      }

      total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度

      return total;
   },
   noSelect:function(){
      var list = this.data.cardlist;
      var noSelect = 0;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(!curItem.checked){
            noSelect++;
          }
      }
      if(noSelect == list.length){
         return true;
      }else{
        return false;
      }
   },
  setGoodsList:function(total,noSelect,list){
     this.setData({
        goodsList:{
          totalPrice:total
        },
        cardlist : list
      });
   },
   get_sub_ship_arr:function(subject){//get获取提交数据
      var membership_arr = new Array();
      membership_arr.length = 0;
      for(var key in subject){
        if(subject[key].checked == true){
            membership_arr.push({
              membership_card_id :subject[key].membership_card_id,
              num                :subject[key].number
            })
            
        }
      }
      return membership_arr; 
   },
   buy_purchase:util.throttle(function (e){//确认购买
    var obj = this.data.goodsList.totalPrice;
    this.get_sub_ship_arr(this.data.cardlist);//get获取提交数据
    var dataUrl = app.apicom + '/Membershipcard/Creategiftorder?membership_card_id_and_num='+JSON.stringify(this.get_sub_ship_arr(this.data.cardlist))+'&'+util.commparams().api_params;
    console.log(dataUrl)
    if(obj != 0){
        util.requestGetApi(dataUrl,[],function(res){
          var order_id = res.data.order_id;
          console.log(order_id)
          util.requestPayment(res,function(res){
            //支付成功回调
            wx.navigateTo({
              url:"../sendpeerfriend/sendpeerfriend?order_id="+order_id
            }); 
          })
        });
      }else{
        wx.showModal({title: '提示',content: '未选中会员卡 确认后请重新选择 ',showCancel:false})
      }
   },1500)
})