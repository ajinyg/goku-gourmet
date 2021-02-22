var app  = getApp(); 
var util = require('../../../utils/api.js');
import { GuKuList } from './class/detail.js';
var time; 
Page({
	data: {
	    hiddenLoading : true, //Loading 

	    isbshow       : false,

	    customer_curr : true,//客服到底部打开
	    
	    is_his 		  : true, // 模版加载  ＝ 两种方案

	    wechat  	  : true,//关闭距离

	    ismember      : true,// 判断是否购买会员

	    iphonex       : app.isiphonex // 判断是否是iphonex
	},
	onLoad:function(options){ 
		var that         = this;
	    var dataMember   = app.apicom + "/Membershipcard/ineffect?date="+util.c_date()+'&'+util.commparams().api_params;

		util.requestGetApi(dataMember,[],function(res){//加载是否为会员
			that._load_init_details(that,options,res);
		})
		console.log(this.data)
	},
	//加载详情
	_load_init_details:function(that,options,res){

		var detailData 	 = app.apicom + "/package/detail?package_id=" + options.package_id+"&"+util.commparams().api_params;

		that._load_options(that,options,res);//接受 init 带过来的参数

		that._load_is_latitude(that,options,detailData);//判断是否授权
	},
	//判断是否授权
	_load_is_latitude:function(that,options,detailData){
		if(wx.getStorageSync('lola').latitude != 0){
	    	that._load_details_data(new GuKuList(detailData),options.package_id)//详情初始化
		}else{
			wx.showModal({
	            title: '是否授权当前位置',
	            content: '"全球美食护照" 要获取你的地理位置，是否允许？',
	            success: function (res) {
	              if (res.cancel) {
	                wx.showModal({title: '提示',content: '地理位置无法获取，请授权使用',showCancel:false})
	                 that._load_details_data(new GuKuList(detailData),options.package_id)//详情初始化
	              } else if (res.confirm) {
	                wx.openSetting({
	                  success: function (data) {
	                    console.log(data);
	                    if (data.authSetting["scope.userLocation"] == true) {
	                      wx.getLocation({
					        type: 'gcj02',
					        success: function (res) {
					        	wx.showToast({title: '授权成功',icon: 'success',duration: 5000})
					            var laloect = {latitude : res.latitude,longitude: res.longitude}
					            wx.setStorageSync('lola', laloect);
	    						var detailData 	 = app.apicom + "/package/detail/?package_id=" + options.package_id+"&"+util.commparams().api_params;
					            that._load_details_data(new GuKuList(detailData),options.package_id)//详情初始化
					        }
					      })
	                    }else{
	                    	console.log('没有授权')
	                    	wx.showModal({title: '提示',content: '地理位置无法获取，请授权使用',showCancel:false})
	                    	that._load_details_data(new GuKuList(detailData),options.package_id)//详情初始化
	                    }
	                  }
	                })
	              }
	            }
	          })
		}
	},
	_load_options:function(that,options,res){

		if(options.shop_id!== undefined)that.setData({shop_id:options.shop_id})//防止微信扫一扫进来

		if(res.data.is_effect == 'no')that.setData({ismember : false});//不是会员切换按钮

		that.setData({package_id:options.package_id,hiddenLoading:false})//商品id or 店铺id

		
	},
	_load_details_data:function(protosubect,scene){//详情初始化
		var that = this;
		app.get_window_h(that);//获取设备高度
		protosubect.getGukuData(function(data,commod_list){//详情初始化
	    	var laislo_map  = data.longitude+','+data.latitude,
	    		map_subject = app.map_api+laislo_map+'&markers='+laislo_map;
	    		//console.log(map_subject)
	    		//console.log(data)
	    	that.setData({
		        detailList       : data,
		        commod_list      : commod_list,
		        guKuId	      	 : scene,
		        map_subject 	 : map_subject
		    });
		    //console.log(that.data)
	    })
	    that.getCalendarMDay(app.apicom + "/package/calendar?package_id="+that.data.package_id)//加载日历
	},
	getCalendarMDay:function(calendarData){//日历
		var that = this;
		util.requestGetApi(calendarData,[],function(res){//日历初始化
			var obj    = res.data,
				dates  = [],
				myDate = new Date(),
				datestr,dateobj;
		    for (var i = 0; i < 5; i++) {
				var days;
				if(myDate.getDate()<10){
					days = "0"+myDate.getDate()
				}else{
					days = myDate.getDate()
				}
		        datestr = Number(myDate.getMonth()) + 1 + "月" + days + '日';
		        // console.log(Number(myDate.getMonth()))
		        dateobj = {
		        	dataTime  : datestr,
		        	available : "no"
		        }
		        dates.push(dateobj);
		        myDate.setTime(myDate.getTime() + 1000*60*60*24);
		    }
		    //console.log(dates)
		    for (var key in dates) {//通过后台返回状态来判断是否可用
		    	// console.log(dates[key].dataTime )
		    	for (var j in obj) {
		    		if(dates[key].dataTime === obj[j].data){
		    			if(obj[j].available == 'yes'){
		    				dates[key].available = "yes"
		    			}
		    		}
		    	}
		    }
		    that.setData({hotList:dates})
	    });
	},
	//打开查看路线
	viewTheLine:function(e){
		var that = this; 
      	wx.getLocation({  
		  success: function(res){
		  	var latitude  = Number(that.data.detailList.latitude);
		  	var longitude = Number(that.data.detailList.longitude);
		  	var name	  = that.data.detailList.position;
		    wx.openLocation({  
		      	latitude    : latitude,
              	longitude   : longitude,
		      	scale		: 17,
		      	name		: name
		    })  
		  }  
		})
	},
	onShareAppMessage: function (res) {
	    return {
	      title    : this.data.commod_list.name,
	      imageUrl : this.data.detailList.picture_url,
	      path     : "/pages/index/detail/detail?package_id="+this.data.package_id+'&shop_id='+this.data.shop_id
	    }
	},
	buymember:function(){ //is 是否会员然后如果不是会员购买会员去
		wx.navigateTo({
			url:"../buymember/buymember"
		});
	},
	//callPhone
	calling:function(e){  
	    wx.makePhoneCall({  
	      	phoneNumber:this.data.detailList.phoneCall
	    })  
	},
	// 头部图片点击事件
	open_head_pic:function(event){
		var src = event.currentTarget.dataset.src;//获取data-src
		var arr = [];//图片预览
		arr.push(this.data.detailList.picture_url)
		// console.log(this.data)
	 	wx.previewImage({
	    	current : src, // 当前显示图片的http链接
	 		urls    : arr // 需要预览的图片http链接列表
	 	})	
	},
	//图片点击事件
 	open_pic_graph:function(event){
	    var src = event.currentTarget.dataset.src;//获取data-src
	 	//图片预览
	 	wx.previewImage({
	    	current : src, // 当前显示图片的http链接
	 		urls    : this.data.detailList.pictures // 需要预览的图片http链接列表
	 	})
	 },
	 scrollCustomer:function(e){//控制客服打开显示
	 	this.setData({customer_curr : false})
	 	clearTimeout(time)
	 	time = setTimeout(()=>{
	 		this.setData({customer_curr : true})
	 	},200)
	 }, 
	 //href Scan
	 CouponScan:function(){
	 	var comm = this.data;
	 	// console.log(comm.ismember)
	 	wx.navigateTo({
			url:"../coupon/coupon?id="+comm.guKuId+'&shop_id='+comm.shop_id+'&is_member='+comm.ismember
		});
	 },
	 Consumable:function(){
	 	wx.navigateTo({
			url:"../consumable/consumable?package_id="+this.data.package_id
		});
	 }
})		