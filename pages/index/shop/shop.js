var app  = getApp();
var util = require('../../../utils/api.js'); 
Page({
  data: {
    ismember        : true,
    wechat          : true, //是否通过微信打开
    is_his          : true,
    guku_id         : '',
    hiddenLoading   : true,
    iphonex         : app.isiphonex, // 判断是否是iphonex
  },
  onLoad: function (options) {
    var options_url = decodeURIComponent(options.q),shop_id = options_url.match(/shop_id=(\S*)/)[1];//304

    this.setData({shop_id:shop_id})

    this._load_activation(shop_id); // 初始化
  },
  _load_activation:function(options){
    var that = this;
    app.getCommit(function(r){
        if(r == 'success'){
           that._loadNewUser();  //判断是否为会员
           that._load_shop_details(options); // 加载数据
        }
    })
  },
  onShow:function(){
    if(wx.getStorageSync('info_user')!==''){
      this._loadNewUser()
    }
    
  },
  _loadNewUser:function(location_api){
    var that = this;
      util.requestPostApi(app.apicom + "/Membershipcard/ineffect?"+util.commparams().api_params,{
        date:util.c_date()
      },function(res){//加载是否为会员
          if(res.data.is_new == 'yes'){ 
            wx.navigateTo({
              url:"/pages/activity/activity01/activity01"
            }); 
          }
          if(res.data.is_effect == 'yes'){
            that.setData({
              ismember:false
            })
          }
      })
  },
  //店铺基础数据
  _load_shop_details:function(shop_id){
    var that = this;
    util.requestPostApi(app.apicom +"/shop/detail?"+util.commparams().api_params,{
        shop_id : shop_id
      },function(r){
           switch (r.code) {
                case 0://领取成功
                that.load_shop(r);
                break;
                case 200000://登录失效
                wx.removeStorageSync('login_token')
                util.forceLogin(function(){
                   that._load_shop_details(that.data.shop_id)
                })
                break;
          }
      })
  },
  load_shop:function(res){
    var that = this,
        list = [],
        subjects = res.data,
        subject  = subjects.package.list,
        sbtype   = subjects.shop;
    for(var key in subject){
      var temp     = {
          kugu_id        : subject[key].package_id,//id
          picture_url    : subject[key].picture_url,//pic-url
          commod_list    : {//处理comm 商品 List
              currency         : subject[key].currency,//价格
              cash_coupon      : sbtype.cash_coupon,//代金券
              name             : sbtype.shop_name,//标题
              package_name     : subject[key].package_name,//套餐name
              package_type     : subject[key].package_type.join("  | "),//套餐类型
              discount         : subject[key].discount,//折扣
              original_price   : subject[key].original_price,//  原价
              discounted_price : subject[key].discounted_price, //折后价
              full_category    : subject[key].full_category,
              wifi             : sbtype.wifi
          } 
        }
        list.push(temp)
    }
    that.setData({
       shop_name     : sbtype.shop_name,//店铺name
       list          : list,
       hiddenLoading : false
    });
  },
  navindex:function(){
     wx.reLaunch({
        url:"/pages/index/index"
      });
  },
  buy_member:function(e){//购买会员
      wx.navigateTo({
        url: "/pages/index/buymember/buymember?wet="+e.currentTarget.dataset.wetchatidx
      }); 
  },
  redirect:function(e){//通用的点击列表
      wx.navigateTo({
        url:"/pages/index/detail/detail?package_id="+e.currentTarget.dataset.id+'&shop_id='+this.data.shop_id
      })
  }
  })
