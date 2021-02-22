var app = getApp();
var util= require('../../../utils/api.js');
Page({
  data: {
    iphonex : app.isiphonex, // 判断是否是iphonex
  },
  onLoad: function (options) {
    app.get_window_h(this);//获取设备高度
    //console.log(wx.getSystemInfoSync().model)
    this.init_recommend();//菜品推荐
  },
  init_recommend:function(){
    var that = this;
    var dataRecommend = app.apicom + '/package/recommend?'+util.commparams().api_params;
    // console.log(dataRecommend)
    util.requestGetApi(dataRecommend,[],function(res){
      if(res.code ===100100)return
      // console.log(res)
      var list = [];
      var subjects = res.data.data.subjects;
      for (var key in subjects) {
        var subject  = subjects[key].package;
        // console.log(subject.package_introduction)
        var sbtype   = subjects[key].shop;
        var temp  = {
            shop_id          : sbtype.shop_id,//shop_id -> 核销历史记录要用到 
            kugu_id          : subject.package_id,//id
            shop_name        : sbtype.shop_name,
            picture_url      : subject.picture_url,//pic-url
            currency         : subject.currency,//价格
            icon             : subject.icon, // 时间节点套餐状态
            // name             : subject.package_introduction,//推荐标语
            name:subject.desc,
            package_name     : subject.package_name,//套餐name
            package_type     : subject.package_type.join("  | "),//套餐类型
            discount         : subject.discount,//折扣
            distance         : subject.distance===undefined?0+'m':subject.distance, // 距离
            original_price   : subject.original_price,//  原价
            discounted_price : subject.discounted_price //折后价
          }
          list.push(temp)
        }
        that.setData({list:list})
        // console.log(list)
    });
  },
  redirect:function(e){//详情页
    var id      = e.currentTarget.dataset.id;
    var shop_id = e.currentTarget.dataset.shopid;
    var common  = this.data;

    wx.navigateTo({
      url:"/pages/index/detail/detail?package_id="+id+'&shop_id='+shop_id
    }); 
  },
  buy_member:function(){
     wx.navigateTo({
        url: "../buymember/buymember"
      }); 
  },
   sub_member_btn:function(){//会员激活
     var card_num = this.data.shop_member_card_num;
     if(wx.getStorageSync('info_user') != ''){
        if(card_num){
             var dataMember = app.apicom + '/membershipcard/activation?'+util.commparams().api_params;
             
             util.requestPostApi(dataMember,{
              membership_card_num_passwd : encodeURI(card_num)
             },function(res){
              //console.log(res)
                if(res.code === 0){
                  wx.showModal({
                    title: '提示',
                    content: '会员卡激活成功',
                    showCancel:false,
                    success:function(){
                        wx.navigateTo({
                         url:"../buycalendar/buycalendar?gift_user=yes&num="+res.data.time_interval+'&membership_card_num_id='+res.data.membership_card_num_id
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
  onGotUserInfo:function(e){
    if(wx.getStorageSync('info_user') == ''){
       util.getGoUserInfo(e.detail)
    }
  },
  backpage:function(){
    wx.navigateBack({ changed: true });//返回上一页 
  },
  membership_card_num:function(e){
    //获取input - value － 值
    this.setData({
      shop_member_card_num :e.detail.value
    })
  }
})