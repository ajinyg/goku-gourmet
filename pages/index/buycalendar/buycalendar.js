var app       = getApp();
var util      = require('../../../utils/api.js');
var init_date = []; //记录会员日期
var new_arr   = []; //去重后重新操作
Page({
  data: {
    hiddenLoading       : true,//loading ...
    headDate            : ['日','一','二','三','四','五','六'],
    is_buy_calendar     : true, // 是否调用购买日历
    num                 : 5, //会员14天优惠
    start_md            : [],//记录启用下标
    stop_md             : [],//记录停用下标
    total_time_interval : 0,//选择天数
    time_interval       : 0, //会员天数
    price               : 0, //单位（元
    member_day          : [],//起止日期
    total_time_interval : 0, // 选择天数
    stop_end_md         : [],//记录最后一次下表
    wet                 : 'no', //记录是否微信入口进入

    gift_user           : 'no',//是否通过购买渠道进入选择时间

    iphonex             : app.isiphonex // 判断是否是iphonex
  },
  onLoad: function (options) {
    var that = this;
    //console.log(options)
    var calendarData = app.apicom + "/Membershipcard/Calendar";
    util.requestGetApi(calendarData,[],that.calendarData);

    app.get_window_h(this);//获取设备高度

    //this.calendarData();//加载日历
    
    this.initmember_user(this,options)//初始化
    
  },
  //初始化判断 wet and ota 
  initmember_user:function(ele,options){
    console.log(options)
      // 判断是否通过购买渠道进入选择时间
      if(options.gift_user !=undefined){
          wx.setNavigationBarTitle({ title: '选择日期'})
          if(options.num!=undefined){

              var status_gift = options.no_time != undefined?'no':'yes';
              ele.setData({
                ota_member              : true,  
                num                     : options.num,
                membership_card_num_id  : options.membership_card_num_id,
                gift_user               : status_gift
              })
          }
      }
      //自动匹配会员天数，然后自动生成
      if(options.cardDay!=undefined){
          ele.setData({
                num:options.cardDay,
                ota_member:false
          })//自动匹配会员天数，然后自动生成
      }
      //检测是否微信平台进入
      if(options.wet !== undefined ){
        ele.setData({wet: options.wet,});//微信平台进入
      }
  },
  onUnload: function () {
    console.log(this.data.gift_user)
    if(this.data.gift_user =='yes'){
      console.log('监听返回')
      wx.reLaunch({
        url:"/pages/order/order"
      }) 
    } 
  },
  navmember:function(){
    //如果是ota平台直接选择之后直接跳我的会员
    if(this.data.total_time_interval !=0){
        var total    = this.data.member_day;

        var membership_card_num_id = this.data.membership_card_num_id;//购物礼物进来的

        var nor_day = total[1] === undefined?total[0]:total[1];

        var dataota =  app.apicom + '/Membershipcard/Activationtime?membership_card_num_id='+membership_card_num_id+'&start_time='+total[0]+'&end_time='+nor_day+'&'+util.commparams().api_params;
        //console.log(dataota)
        util.requestGetApi(dataota,[],function(res){
            //console.log(res)
            if(res.code == 100100){
              wx.showModal({title: '提示',content: '发生异常 确认后请重新选择',showCancel:false})
            }else if(res.code == 200005){
              wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
            }else{
              wx.reLaunch({ url:"../../order/order"})
            }
        })
    }else{
      wx.showModal({title: '提示',content: '请选择启用日期与停用日期 再次购买会员',showCancel:false})
      return
    }
    
  },
  payment:util.throttle(function (e) {
    // console.log(this)
    // console.log(this.data)
    if(this.data.total_time_interval !=0){
      var total   = this.data.member_day;
      var carId   = this.data.cardId;
      var nor_day = total[1] === undefined?total[0]:total[1];
        if(this.data.wet == 'wetex'){
            wx.getLocation({
                type: 'gcj02',
                success: function (res) {
                    var laloect = {  
                      latitude : res.latitude,
                      longitude: res.longitude
                    }
                   var dataUrl = app.apicom + "/Membershipcard/Createorder?membership_card_id="+carId+"&start_time="+total[0]+'&end_time='+nor_day+'&latitude='+laloect.latitude+'&longitude='+laloect.longitude+'&lang='+wx.getStorageSync('lang'); 
                   util.requestGetApi(dataUrl,[],function(res){
                    console.log(res)
                      if(res.code !== 200005){
                        util.requestPayment(res,function(res){
                            //支付成功回调
                            wx.reLaunch({
                             url:"../../order/order"
                            })
                        })
                      }else{
                        wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
                      }
                        
                    })
                }
              })
        }else{
          var dataUrl = app.apicom + "/Membershipcard/Createorder?membership_card_id="+carId+"&start_time="+total[0]+'&end_time='+nor_day+'&'+util.commparams().api_params;
          util.requestGetApi(dataUrl,[],function(res){
              //console.log(res)
              if(res.code !== 200005){
                util.requestPayment(res,function(res){
                    //支付成功回调
                    wx.reLaunch({
                     url:"../../order/order"
                    })
                })
              }else{
                wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
              }
          })
        }
         
      }else{
         wx.showModal({title: '提示',content: '请选择启用日期与停用日期 再次购买会员',showCancel:false})
         return
      }
  },1500),
  
  
  ota_date:function(e){ //ota事件
     var index_m = e.currentTarget.dataset.indexMonth,
        index_d = e.currentTarget.dataset.indexDay,
        dates   = this.data.date;
    if(dates[index_m][index_d].selected == 'yes'){
       wx.showModal({title: '提示',content: '已购买的日期不能选择 确认后请重新选择',showCancel:false})
      return
    }     
    if (dates[index_m][index_d].status == 'disable') {
      // no action
      return ;
    } else if (dates[index_m][index_d].status == 'normal') { //默认状态
          this.empty_data(dates) //第一步，先清空
          // 设置当前点为start，记录this.start_md
          dates[index_m][index_d].status = 'start';
          this.data.start_md = [index_m, index_d];
          var nums = this.data.num;
          if(nums !== 1){//这种情况是不等于一天的卡片
            var myDate     = new Date(dates[index_m][index_d].date)
            var that       = this;
            new_arr.length = 0
            this._create_day(nums,dates[index_m][index_d],[],myDate) //生成规则天数，存起来
            new_arr.splice(0,1);
            this.get_calendar_data(dates,function(res){
                 for(var i=0; i<=new_arr.length;i++){
                      if(new_arr[i] === res.date){
                          res.status = 'selected';
                      }
                 }
                 if(new_arr[new_arr.length-1] === res.date){
                    res.status = 'stop';
                    // that.data.stop_md = [index_m, index_d+nums];
                  }
            })
            var obj_date =  this.data.no_date;
              for(var key in obj_date){
                  for(var i=0; i<=new_arr.length; i++){
                    if(obj_date[key].data_time === new_arr[i]){

                        wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
                        
                        return
                    }
                  }
              }
          }
        var day_arr = [],nor_day ;

        that.get_start_and_end(day_arr,dates)//GET 获取开始与结束时间
        if(day_arr.length===1  && nums !=1){
            console.log('进来了')
            wx.showModal({title: '提示',content: '所选择时间不足 确认后请重新选择',showCancel:false})
            this.empty_data(dates)// 重置所有非disable状态的按钮为normal状态
            //点击启用重置并且清除数据
            this.setData({
              price               : 0,
              time_interval       : 0,
              total_time_interval : 0
            })
            this.data.start_md = [];
            this.data.stop_md = [];
            return
        }
        var nor_day = day_arr[1] === undefined?day_arr[0]:day_arr[1];

        var dataCalculation = app.apicom+'/Membershipcard/Calculatedate?start_time='+day_arr[0]+'&end_time='+nor_day
       
        that.calculating_price(dataCalculation,day_arr,that)//计算价格

    } else if (dates[index_m][index_d].status == 'start') {
        this.empty_data(dates) // 重置所有非disable状态的按钮为normal状态
        //点击启用重置并且清除数据
        this.setData({
          price               : 0,
          time_interval       : 0,
          total_time_interval : 0
        })
        this.data.start_md = [];
        this.data.stop_md = [];
    } else if (dates[index_m][index_d].status == 'selected') {
          // 没有操作行为
          this.empty_data(dates)//第一步，先清空
          // 设置当前点为start，记录this.start_md
          dates[index_m][index_d].status = 'start';
          this.data.start_md = [index_m, index_d];
          var nums = this.data.num;
          if(nums !== 1){//这种情况是不等于一天的卡片
            var myDate     = new Date(dates[index_m][index_d].date);
            var that       = this;
            new_arr.length = 0
            this._create_day(nums,dates[index_m][index_d],[],myDate) //生成规则天数，存起来
            new_arr.splice(0,1);
            this.get_calendar_data(dates,function(res){
                 for(var i=0; i<=new_arr.length;i++){

                      if(new_arr[i] === res.date){
                          res.status = 'selected';
                      }
                 }
                 if(new_arr[new_arr.length-1] === res.date){
                    res.status = 'stop';
                    // that.data.stop_md = [index_m, index_d+nums];
                  }
            })
             var obj_date =  this.data.no_date;
              for(var key in obj_date){
                  for(var i=0; i<=new_arr.length; i++){
                    if(obj_date[key].data_time === new_arr[i]){
                        wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
                        return
                    }
                  }
              }
          }
        var day_arr = [];

        that.get_start_and_end(day_arr,dates)//GET 获取开始与结束时间
        if(day_arr.length===1  && nums !=1){
            wx.showModal({title: '提示',content: '所选择时间不足 确认后请重新选择',showCancel:false})
            this.empty_data(dates)// 重置所有非disable状态的按钮为normal状态
            //点击启用重置并且清除数据
            this.setData({
              price               : 0,
              time_interval       : 0,
              total_time_interval : 0
            })
            this.data.start_md = [];
            this.data.stop_md = [];
            console.log('进来了2')
            return
        }
        
        var nor_day = day_arr[1] === undefined?day_arr[0]:day_arr[1];

        var dataCalculation = app.apicom+'/Membershipcard/Calculatedate?start_time='+day_arr[0]+'&end_time='+nor_day
       
        that.calculating_price(dataCalculation,day_arr,that)//计算价格

    } else if (dates[index_m][index_d].status == 'stop') {
      // 把自己解锁， 变成selected状态，取消全局的stop_md
    }
    this.setData({
      date    : dates
    })
  },
  get_date:function(e){//默认用户自定义
    var index_m = e.currentTarget.dataset.indexMonth,
        index_d = e.currentTarget.dataset.indexDay,
        dates   = this.data.date;
    if(dates[index_m][index_d].selected == 'yes'){
       wx.showModal({title: '提示',content: '已购买的日期不能选择 确认后请重新选择',showCancel:false})
      return
    }    
    if (dates[index_m][index_d].status == 'disable') {
      // no action
      return ;
    } else if (dates[index_m][index_d].status == 'normal') { //默认状态

      if (this.data.stop_md.length > 0) {
        // no action
      } else if (this.data.start_md.length > 0) {
        if (index_m < this.data.start_md[0] || index_m == this.data.start_md[0] && index_d < this.data.start_md[1]) {
          // no action
        } else {
          // 设置当前按钮为停用状态，从start_md标记起的所有按钮为selected，当前点设置为stop，且记录为stop_md
          var start_m = this.data.start_md[0], start_d = this.data.start_md[1];
          if (start_m == index_m) {

            //连续选择
            // console.log(index_d)
            for(var d = start_d + 1; d< index_d;d++){
                dates[start_m][d].status = 'selected';
                if(dates[start_m][d].selected == 'yes'){
                  wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
                  return
                }
            }

          } else {

                // 开始节点和结束节点不在同一月
                for (var d = start_d + 1; d < dates[start_m].length; d ++) {
                  dates[start_m][d].status = 'selected';
                  if(dates[start_m][d].selected == 'yes'){
                    wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
                    return
                  }
                }
                for (var m = start_m + 1; m < index_m; m ++) {
                  for (var d = 0; d < dates[m].length; d ++) {
                    dates[m][d].status = 'selected';
                    if(dates[m][d].selected == 'yes'){
                      wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
                      return
                    }
                  }
                }
                for (var d = 0; d < index_d; d ++) {
                  dates[index_m][d].status = 'selected';
                    // console.log(dates[start_m][d])
                  if(dates[index_m][d].selected == 'yes'){
                    wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
                    return
                  }
                }


          } 
            var day_arr = [],that = this;

            that.get_start_and_end(day_arr,dates)//GET 获取开始与结束时间
            
            dates[index_m][index_d].status = 'stop';

            // this.data.stop_md = [index_m, index_d];

            var dataCalculation = app.apicom+'/Membershipcard/Calculatedate?start_time='+day_arr[0]+'&end_time='+ dates[index_m][index_d].date
            
            util.requestGetApi(dataCalculation,[],function(res){//计算价格
              if(res.code === 100100){//如果超出30天重置
                wx.showModal({
                  title: '提示',
                  content: '会员卡天数不能超过30天 确定后请重新选择天数',
                  showCancel:false,
                  success:function(){
                      that.empty_data(dates)//第一步，先清空
                      that.data.start_md = [];
                      that.data.stop_md = [];
                      that.setData({
                        price               : 0,
                        time_interval       : 0,
                        total_time_interval : 0,
                        date                : dates
                      })
                  }
                })

              }else{
                that.setData({
                  price               : res.data.price,
                  time_interval       : res.data.time_interval,
                  total_time_interval : res.data.total_time_interval,
                  member_day          : [day_arr[0],dates[index_m][index_d].date],
                  cardId              : res.data.membership_card_id
                })
              }
                
            })
        }
      } else {

        // 设置当前点为start，记录this.start_md

          dates[index_m][index_d].status = 'start';
          // console.log(dates[index_m][index_d])
          this.data.start_md = [index_m, index_d];
          var nums = this.data.num,that = this;

          if(nums !== 1){//这种情况是不等于一天的卡片
              var myDate     = new Date(dates[index_m][index_d].date)
              var that       = this;
              new_arr.length = 0

              this._create_day(nums,dates[index_m][index_d],[],myDate) //生成规则天数，存起来

              new_arr.splice(0,1);
              this.get_calendar_data(dates,function(res){
                  for(var i=0; i<=new_arr.length; i++){
                    if(new_arr[i] === res.date && res.selected == 'no'){
                        res.status = 'selected';
                    }
                  }
                  if(new_arr[new_arr.length-1] === res.date && res.selected == 'no'){
                    res.status = 'stop';
                    // that.data.stop_md = [index_m, index_d+nums];
                  }
              })
              //避免重叠
              var obj_date =  this.data.no_date;
              for(var key in obj_date){
                  for(var i=0; i<=new_arr.length; i++){
                    if(obj_date[key].data_time === new_arr[i]){
                       
                        wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
                        this.empty_data(dates)// 重置所有非disable状态的按钮为normal状态
                        //点击启用重置并且清除数据
                        this.setData({
                          price               : 0,
                          time_interval       : 0,
                          total_time_interval : 0
                        })
                        this.data.start_md = [];
                        this.data.stop_md = [];
                        return
                    }
                  }
              }
          }
        var day_arr = [] ;
        that.get_start_and_end(day_arr,dates)//GET 获取开始与结束时间
        //时间不足
        /*console.log(nums+'－－－－－－－－－－－默认进来生成天数')
        console.log(day_arr.length+'－－－－－－－－－－－02')
        console.log(day_arr.length===1 && nums !=1)*/
        if(day_arr.length===1 && nums !=1){
        	console.log('进来了01')
            wx.showModal({title: '提示',content: '所选择时间不足 确认后请重新选择',showCancel:false})
            this.empty_data(dates)// 重置所有非disable状态的按钮为normal状态
            //点击启用重置并且清除数据
            this.setData({
              price               : 0,
              time_interval       : 0,
              total_time_interval : 0
            })
            this.data.start_md = [];
            this.data.stop_md = [];
            return
        }
        var nor_day = day_arr[1] === undefined?day_arr[0]:day_arr[1];

        var dataCalculation = app.apicom+'/Membershipcard/Calculatedate?start_time='+day_arr[0]+'&end_time='+nor_day
       
        that.calculating_price(dataCalculation,day_arr,that)//计算价格
      }
    } else if (dates[index_m][index_d].status == 'start') {
      this.empty_data(dates)// 重置所有非disable状态的按钮为normal状态
      //点击启用重置并且清除数据
      this.setData({
        price               : 0,
        time_interval       : 0,
        total_time_interval : 0
      })
      this.data.start_md = [];
      this.data.stop_md = [];
    } else if (dates[index_m][index_d].status == 'selected') {
      var that = this;
      // 没有操作行为
      if (dates[index_m][index_d].status == 'selected' && this.data.stop_md.length === 0) {
          var start_m = this.data.start_md[0],start_d = this.data.start_md[1];
          this.empty_data(dates) //第一步先清空
          if(start_m == index_m){//首先判断是否在同一月

              for(var d = start_d; d< index_d; d++){ 
                  dates[index_m][d].status = 'selected';
              }
              //第二步再展示改变的位置   
              dates[index_m][index_d].status = 'stop';
              //第三步打开启用
              dates[index_m][start_d].status = 'start';
              // this.data.stop_md = [start_d,index_d];

              var day_arr = [];
              that.get_start_and_end(day_arr,dates)//GET 获取开始与结束时间

              var dataCalculation = app.apicom+'/Membershipcard/Calculatedate?start_time='+day_arr[0]+'&end_time='+day_arr[1]
             
              that.calculating_price(dataCalculation,day_arr,that)//计算价格
          }else{ 
               dates[start_m][start_d].status = 'start';
              //不在同一月的情况下
              for (var d = start_d + 1; d < dates[start_m].length; d ++) {
                dates[start_m][d].status = 'selected';
                //找到启用位置
                dates[start_m][start_d].status = 'start';
                if(dates[start_m][d].selected == 'yes'){
                  wx.showModal({title: '提示',content: '抱歉 您所选择的会员卡日期范围与已经购买的会员卡日期所重叠 请从新选择',showCancel:false})
                  return
                }
              }
              for (var m = start_m + 1; m < index_m; m ++) {
                for (var d = 0; d < dates[m].length; d ++) {
                  dates[m][d].status = 'selected';
                }
              }
              for (var d = 0; d < index_d; d ++) {
                dates[index_m][d].status = 'selected';

              }
              //找到停用位置   
              dates[index_m][index_d].status = 'stop';
              // this.data.stop_md = [start_d,index_d];
              var day_arr = [];
              that.get_start_and_end(day_arr,dates)//GET 获取开始与结束时间

              var dataCalculation = app.apicom+'/Membershipcard/Calculatedate?start_time='+day_arr[0]+'&end_time='+day_arr[1]
             
              that.calculating_price(dataCalculation,day_arr,that)//计算价格
              console.log('不在同一月的情况下')
          }
        }
    } else if (dates[index_m][index_d].status == 'stop') {

      var day_arr = [],that = this;

      that.get_start_and_end(day_arr,dates)//GET 获取开始与结束时间

      if(that.DateDiff(day_arr[1],day_arr[0]) === 1){//判断点击停用为一天的时候
        day_arr.pop()

        dates[index_m][index_d].status = 'normal';//改变状态

        var dataCalculation = app.apicom+'/Membershipcard/Calculatedate?start_time='+day_arr[0]+'&end_time='+day_arr[0]
        
        that.calculating_price(dataCalculation,day_arr,that)//计算价格

        day_arr = [day_arr[0],undefined]//如果为一天的话 第二位为undefined 然后走提交逻辑

      }
    }
    this.setData({
      date    : dates
    })
  },
  calculating_price:function(dataCalculation,day_arr,that){//计算价格
    //dataCalculation - > 请求地址
     util.requestGetApi(dataCalculation,[],function(res){ 
        // console.log(res)
          that.setData({
            price               : res.data.price,
            time_interval       : res.data.time_interval,
            total_time_interval : res.data.total_time_interval,
            member_day          : day_arr,
            cardId              : res.data.membership_card_id
          })
      })
  },
  get_start_and_end:function(day_arr,dates){//获取开始时间与结束时间
      for (var m = 0; m < dates.length; m ++) {//GET 获取开始与结束时间
          for (var d = 0; d < dates[m].length; d ++) {
            if (dates[m][d].status == 'start'||dates[m][d].status == 'stop') {
              // console.log(dates[m][d].date)
              day_arr.push(dates[m][d].date)
            }
          }
      }
  },
  empty_data:function(dates){//清空时间
    for (var m = 0; m < dates.length; m ++) {
      for (var d = 0; d < dates[m].length; d ++) {
        if (dates[m][d].status != 'disable') {
          dates[m][d].status = 'normal';
        }
      }
    }
  },
  _create_day:function(num,first_,init_date,myDate){//创建规则天数
    for(var i=0;i<num;i++){
          //动态生成累加天数
          var year    = first_.year,
              day     = this.zero(myDate.getDate()),
              month   = this.zero(myDate.getMonth()+1);
          var datestr = year +'-'+month + "-" + day;//累加天数
           myDate.setTime(myDate.getTime() + 1000*60*60*24);
          init_date.push(datestr);// 把（启用->停用）天数 存起来
          this._arr(init_date) 
     }
  },
  get_calendar_data:function(obj,callback){ //通用的GETlist方法
    for(var key in obj){
      for(var j in obj[key]){
         callback(obj[key][j])
      }
    }
  },
  _arr:function(arr){//去重
    for(var i = 0;i<arr.length;i++){
        if(new_arr.indexOf(arr[i]) == -1){  //判断在s数组中是否存在，不存在则push到s数组中
            new_arr.push(arr[i]);
        }
    }
    // console.log(new_arr)
    return new_arr
  },
  DateDiff:function(d1,d2){//计算起始与结束天数
    var day = 24 * 60 * 60 *1000;
    try{    
           var dateArr = d1.split("-");
           var checkDate = new Date();
                checkDate.setFullYear(dateArr[0], dateArr[1]-1, dateArr[2]);
           var checkTime = checkDate.getTime();
          
           var dateArr2 = d2.split("-");
           var checkDate2 = new Date();
                checkDate2.setFullYear(dateArr2[0], dateArr2[1]-1, dateArr2[2]);
           var checkTime2 = checkDate2.getTime();
            
           var cha = (checkTime - checkTime2)/day;  
          return cha;
        }catch(e){
          return false;
        }
  },
  zero:function(num){//解决小于10 加零方法
      return num<10?'0'+num:num+'';
  },

  calendarData:function(res){
    this.dateData(res.data.calendar);
  },

  dateData: function (obj) {
    var dataAll      = []//总日历数据
    var dataAll2     = []//总日历数据
    var dataMonth    = []//月日历数据
    var date         = new Date//当前日期
    var year         = date.getFullYear()//当前年
    var week         = date.getDay();//当天星期几
    var weeks        = []
    var month        = date.getMonth() + 1//当前月份
    var day          = date.getDate()//当天
    var daysCount    = 150//一共显示多少天
    var dayscNow     = 0//计数器
    var monthList    = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]//月份列表
    var nowMonthList = []//本年剩余年份
    for (var i = month;i<13;i++){
      nowMonthList.push(i)
    }
    if(month <10){ //判断当前月份
      month = '0' +month
    }else{
      month = month
    }

    var yearList = [year]//年份最大可能
    for (var i = 0; i < daysCount/365+2;i++){
      yearList.push(year+i+1)
    }    
    var leapYear = function (Year) {//判断是否闰年 
      if (((Year % 4) == 0) && ((Year % 100) != 0) || ((Year % 400) == 0)) {
        return (true);
      } else { return (false); }
    }
    for (var i = 0; i < yearList.length;i++){//遍历年
      var mList
      if (yearList[i] == year){//判断当前年份
        mList = nowMonthList
      }else{
        mList = monthList
      }
      for (var j = 0; j < mList.length;j++){//循环月份
        dataMonth       = []
        var t_days      = [31, 28 + leapYear(yearList[i]), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        var t_days_thisYear = []
        if (yearList[i] == year){

          for (var m = 0; m<nowMonthList.length;m++){
              t_days_thisYear.push(t_days[mList[m]-1])
          }
          t_days = t_days_thisYear
        } else {
          t_days = [31, 28 + leapYear(yearList[i]), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        }
        for (var k = 0; k < t_days[j];k++){//循环每天
          dayscNow++
          var nowData
          if (dayscNow < daysCount) {//如果计数器没满
            var days = k + 1
            if (days < 10) {
              days = "0" + days
            }
            if (yearList[i] == year && mList[j] == month){//判断当年当月
              var moth_o   = mList[j] < 10?"0" + mList[j]:mList[j];
              var viewDate =  yearList[i] + "-" + moth_o + "-" + days
              var dayBool  = [];
              if (k + 1 >= day) {
                if(obj.length != 0){
                  for(var key in obj){
                      var timeDate = obj[key].data_time
                      if(timeDate === viewDate){
                          dayBool.push(obj[key].available)
                      }
                      nowData = {
                          year     : yearList[i],
                          month    : mList[j],
                          day      : k + 1,
                          date     : viewDate, 
                          re       : viewDate,
                          selected : dayBool.length == 0?'no':'yes',
                          status   : 'normal'
                      }
                  }
                }else{
                  nowData = {
                      year     : yearList[i],
                      month    : mList[j],
                      day      : k + 1,
                      date     : viewDate, 
                      re       : viewDate,
                      selected : dayBool.length == 0?'no':'yes',
                      status   : 'normal'
                  }
                }
                dataMonth.push(nowData)
              }

            } else {//其他情况
              var moth_o   = mList[j] < 10?"0" + mList[j]:mList[j];
              var viewDate = yearList[i] + "-" + moth_o + "-" + days
              var dayBool  = [];
              if(obj.length != 0){
                  for(var key in obj){
                      var timeDate = obj[key].data_time
                      if(timeDate === viewDate){
                        // console.log(obj[key])
                          dayBool.push(obj[key].available)
                      }
                      nowData = {
                          year     : yearList[i],
                          month    : mList[j],
                          day      : k + 1,
                          date     : viewDate, 
                          re       : viewDate,
                          selected : dayBool.length == 0?'no':'yes',
                          status   : 'normal'
                      }
                  }
               }else{
                  nowData = {
                      year     : yearList[i],
                      month    : mList[j],
                      day      : k + 1,
                      date     : viewDate, 
                      re       : viewDate,
                      selected : dayBool.length == 0?'no':'yes',
                      status   : 'normal'
                  }
               }
              dataMonth.push(nowData)
              if (k == 0) {
                var moth_o   = mList[j] < 10?"0" + mList[j]:mList[j];
                var date = new Date(yearList[i] + "-" + moth_o + "-" + k + 1)
                var weekss = date.getDay()//获取每个月第一天是周几
                weeks.push(weekss)
              }
            }
          }else{break}
        }
        
        dataAll.push(dataMonth)
      }
    }
    for (let i = 0; i < dataAll.length;i++){
      if (dataAll[i].length!=0){
        dataAll2.push(dataAll[i]);
      }
    }
    // console.log(dataAll2)
    var weekssw = new Date().getDay();
    weeks.unshift(weekssw)
    this.setData({
      date          : dataAll2,
      weeks         : weeks,
      month         : month,
      no_date       : obj,
      hiddenLoading : false
    })
  }
})