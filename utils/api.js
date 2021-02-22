var app = getApp();
/*

  间隔1分钟刷新位置定位

*/
function commparams(){//发送经纬度
          //console.log(Math.round(+ new Date()/1000/60))
    if(wx.getStorageSync('timefun') !== ''){
      if(wx.getStorageSync('timefun') < Math.round(+ new Date()/1000/60)){

        _getlocation(function(res){
          //如果时间过期重新获取位置
          wx.setStorageSync('lola', {latitude  : res.latitude,longitude : res.longitude});
        },function(err){
          //err - 失败情况下处理
          wx.setStorageSync('lola',{latitude:'0',longitude:'0'});
        })
        setTimeout(function(){//延迟1.5m/s进行时
          wx.setStorageSync('timefun',Math.round(+ new Date()/1000/60))
        },1200)
         //console.log('过期了')
      }else{
        //console.log('没过期')
      }
    }  
    if(wx.getStorageSync('lola') ||  wx.getStorageSync('lang')){
      var get_currency = wx.getStorageSync('currency') == ''?'日元':wx.getStorageSync('currency');//币种
      var lolauser     = wx.getStorageSync('lola'),languageback   = wx.getStorageSync('lang');//默认获取位置
      return {
          api_params: "latitude="+lolauser.latitude+"&longitude="+lolauser.longitude+"&lang="+languageback+'&currency='+encodeURI(get_currency)
      } 
    }
}

/*
  记录7天，循环每隔7天 弹一次
*/ 
function sevenDaysTimer(initFn,callBack){
  if(wx.getStorageSync('sevenDaysTime') == ''){
     initFn && initFn()
     wx.setStorageSync('sevenDaysTime',Math.round(+ new Date()/1000+(86400*7)))
  }
  if(wx.getStorageSync('sevenDaysTime') != ''){
      if( Math.round(+ new Date()/1000) < wx.getStorageSync('sevenDaysTime')){

         console.log('还没到7天呢')
      }else{
        wx.removeStorageSync('sevenDaysTime')
        wx.setStorageSync('sevenDaysTime',Math.round(+ new Date()/1000+(86400*7)))
        callBack && callBack()
        console.log('到7天了')
      }
    }
}
/*

  送同行朋友
    部分处理 － > 大写处理 
*/
function day_index(){
  return {
     z_day :['','一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','二一','二二','二三','二四','二五','二六','二七','二八','二九','三十','三一','三二','三三','三四','三五','三六','三七','三八','三九','四十','四一','四二','四三','四四','四五','四六','四七','四八','四九','五十'] 
  }
}
/*
  获取当前日期
*/
function c_date(){
    var myDate      = new Date();
    var yy          = myDate.getFullYear();
    var mm          = myDate.getMonth()+1;
    var hh          = myDate.getDate();
  return yy +'-' +mm +'-'+ hh;
}
/*
  函数节流 － 防止支付多次点击
*/
function throttle(fn, gapTime) {
    if (gapTime == null || gapTime == undefined) {
        gapTime = 1500
    }

    let _lastTime = null
    // 返回新的函数
    return function () {
        let _nowTime = + new Date()
        if (_nowTime - _lastTime > gapTime || !_lastTime) {
            fn.apply(this, arguments)   //将this和参数传给原函数
            _lastTime = _nowTime
        }
    }
}
/*

  支付接口

*/
function requestPayment(res,callback){
  var subData = res.data;
    wx.requestPayment({
       'timeStamp'  : subData.timeStamp,//时间戳
       'nonceStr'   : subData.nonceStr,//随机字符串，长度为32个字符以下
       'package'    : subData.package,
       'signType'   : subData.signType,
       'paySign'    : subData.paySign,
       'success':function(res){
          wx.showModal({
            title: '提示',
            content: '付款成功',
            showCancel:false,
            success:function(res){
              callback(res);//支付成功回调
           }
          })
       },
       'fail':function(res){
         wx.showModal({title: '提示',content: '支付失败 确认后重新支付',showCancel:false})
       }
    });
}
function _getlocation(callBack,failback){//获取地理位置
     wx.getLocation({  
        type: 'gcj02',
        success: function (res) {
            callBack(res) 
        },
        fail: function (err){
            failback(err)
        }
      })
}
function fmtDate(timeStamp){//解析php时间戳
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
      return y + '-' + m + '-' + d;      
} 

function cutString(str, len){//溢出..处理
    if(str.length*2 <= len) {
         return str;
    }
    var strlen = 0,s = "";
    for(var i = 0;i < str.length; i++) {
        s = s + str.charAt(i);
      if (str.charCodeAt(i) > 128) {
          strlen = strlen + 2;
        if(strlen >= len){
            return s.substring(0,s.length-1) + "··";
        }
      }else {
          strlen = strlen + 1;
          if(strlen >= len){
             return s.substring(0,s.length-2) + "··";
          }
      }
    }
    return s;
  }
/*
  监听登陆状态
*/
function addListLoginStatus(r,successFun,failFun,callLoginBack){   

    if(wx.getStorageSync('login_token')){//如果登陆过，走这里
         //r.code = 200000
          if(r.code != 200000){// 已登录状态
              console.log('亲～已登录状态。。')
              successFun && successFun();
          }else{//登录失效
              console.log('丫的，登录失效，重新登陆')
              wx.removeStorageSync('login_token')
              forceLogin(function(){//重新登录
                  callLoginBack && callLoginBack();
              })
          }
     }else{ //如果初次登陆，走这里
        if(wx.getStorageSync('info_user') != ''){
            console.log('－ －, 初次登录！！！')
            wx.removeStorageSync('login_token')
            forceLogin(function(){//重新登录
               failFun && failFun();
            })
        }
     }
}
/*
  个人授权 － 获取个人信息
*/ 
function getGoUserInfo(r,callback,failFun){
  // console.log(r)
  if(r.errMsg != "getUserInfo:fail auth deny"){
    wx.setStorageSync('info_user',r.userInfo);
    wx.login({
        success:function(res){
           requestPostApi(app.apicom+'/login/wechat',{
                code           : res.code,
                encrypted_data : r.encryptedData,
                iv             : r.iv,
                gender         : r.userInfo.gender,
                nick_name      : r.userInfo.nickName,
                language       : r.userInfo.language,
                city           : r.userInfo.city,
                province       : r.userInfo.province,
                country        : r.userInfo.country,
                avatar_url     : r.userInfo.avatarUrl
          },function(res){
              wx.setStorageSync('login_token', res.data.session.token)
              wx.setStorageSync('login_info',res.data.session)
              callback && callback(r) 
          }) 
        }
    }) 
  }else{
      failFun && failFun(r);
  }
}
function forceLogin(callback) {//发送登陆状态
    if (wx.getStorageSync('login_token')){
        return;
    }
    wx.login({
        success:function(res){

            requestGetApi(app.apicom +'/login/wechat?code='+res.code+'&from='+app.from_data,[],function(res){
              wx.setStorageSync('login_token', res.data.session.token)
              wx.setStorageSync('login_info',res.data.session)
              callback()
            })
        }
    })  
}
/*
  未读状态了解一下
*/ 
function unreadStatus(successFun,failFun){
  var that = this;
  requestGetApi(app.apicom + '/user/noticenum',[],function(res){
    // res.data.notice_version  = 18
    if(res.data.cash_coupon_num != 0){
      successFun && successFun();
    }else{
      failFun && failFun();
    }
  })
}
/*
    父页面 － 子页面 or 子页面与父页面 － > 之间的通信

*/ 
function global_event_on(name, obj, fn) {
  var app = getApp(), events = app.__global_events__ || {};
  events[name] = {obj: obj, fn: fn};
  app.__global_events__ = events;
}
function global_event_trigger(name) {
  var app = getApp(), events = app.__global_events__ || {};
  if (events[name]) {
    events[name].fn.apply(events[name].obj, Array.prototype.slice.call(arguments, 1));
    delete events[name];
    app.__global_events__ = events;
  }
}

function global_event_prevpass(name,fn) {
  var app = getApp(), events = app.__global_events__ || {};
  fn(events[name])
  delete events[name]
  app.__global_events__ = events
}
/**
 * 请求API
 * requestPostApi -> POST 发送请求
 * requestGetApi  -> GET  接受请求
 * @param  {String}   url         接口地址
 * @param  {String}   method      请求类型
 * @param  {Object}   params      请求的参数
 * @param  {Function} successFun  接口调用成功返回的回调函数
 * @param  {Function} failFun     接口调用失败的回调函数
*/
function requestPostApi(url, params,successFun,failFun) {
    requestApi(url,'POST',params,successFun,failFun);
}
function requestGetApi(url,params,successFun,failFun) {
    requestApi(url,'GET',params,successFun,failFun); 
}
function requestApi(url,method,params,successFun,failFun) {
    if (method == 'POST') {
        var contentType = 'application/x-www-form-urlencoded'
    } else {
        var contentType = 'application/json'
    }
    wx.request({
        url:    url,
        method: method,
        data:   params,
        header: {
            'Content-Type': contentType,
            'Cookie': 'goku_login_token=' + wx.getStorageSync('login_token')
        },
        success: function (res){
          successFun(res.data);
        },
        fail: function (res){
          wx.showModal({
            title: '提示',
            content: '额...网络不给力 请检查网络',
            showCancel:false,
            success:function(){
              // requestGetApi(url,params,successFun);
            }
          })
        }
    })
}
module.exports = {
  requestGetApi  : requestGetApi,
  requestPostApi : requestPostApi,
  forceLogin     : forceLogin,
  commparams     : commparams,
  cutString      : cutString,
  requestPayment : requestPayment,
  fmtDate        : fmtDate,
  day_index      : day_index,
  c_date         : c_date,
  throttle       : throttle,
  getGoUserInfo  : getGoUserInfo,
  addListLoginStatus :addListLoginStatus,
  sevenDaysTimer  :sevenDaysTimer,
  unreadStatus   : unreadStatus,
  on: global_event_on,
  trigger: global_event_trigger,
  prevpass: global_event_prevpass
}
