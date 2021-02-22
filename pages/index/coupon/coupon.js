var app = getApp();
var util = require('../../../utils/api.js');
import { GuKuList } from '../detail/class/detail.js';
Page({
	data:{
		his_shop      : true,
		writeSuccess  : false, //使用成功
		hiddenLoading : true,
		voucher_off   : false,//代金劵单选状态
		iphonex       : app.isiphonex, // 判断是否是iphonex
	},
	onLoad:function(options){
		// console.log(options)
		this.toastedit = this.selectComponent("#toastedit");//获得toastedit组件
		// options ={
		// 	id:834,
		// 	shop_id:304
		// }

		var detailData = app.apicom + "/package/detail/?package_id=" + options.id+"&"+util.commparams().api_params;
		
		var detGuke    = new GuKuList(detailData);
	    this.loadDetails(detGuke,options); // 套餐详情 加载
	    this.loadAvailable();              // 加载可食用金额

	    if(options && options.is_member)this.setData({is_member:options.is_member})
	    // console.log(this.data)
	},
	loadDetails:function(detGuke,options){
		var that = this;
		detGuke.getGukuData(function(data,commod_list){//详情初始化
	      var detailData = app.apicom + "/Membershipcardconsume/lists/?shop_id=" + options.shop_id+"&"+util.commparams().api_params;
	      util.requestGetApi(detailData,[],function(res){
	        //console.log(res)
	        if(res.data.list.length !=0){
	        	that.data.his_shop = true
	        }else{
	        	that.data.his_shop = false
	        }
	        that.setData({
	    		commod_list   : commod_list,
		        detailList    : data,
		        guKuId	      : options.id,
		        shop_id       : options.shop_id,
		        his_shop 	  : that.data.his_shop,
		        hiddenLoading : false
		    });
	      })
	    })
	},
	/*
		可使用代金券金额
	*/ 
	loadAvailable:function(){
		var dataConsume = app.apicom +"/Cashcoupon/Available?"+util.commparams().api_params;
		var that = this;
		util.requestGetApi(dataConsume,[],function(res){
			that.setData({
				available:res.data.available,
				currency :res.data.currency
			})

		})
	},
	/*
		扫一扫 了解一下
	*/ 
	sweepCodeEvent:function(){
		var that = this;
		//this.data.is_member = 'false'
		if(this.data.is_member != 'false'){
			if(this.data.available != 0){
				if(!this.data.writeSuccess)this.initScanCode();
			}else{
				// 无代金券的情况下
				if(!this.data.writeSuccess){
					this.initScanCode();
				}else{
					this.toastedit.showToast('使用成功',1100);
				}
			}
		}else{
 			util.requestPostApi(app.apicom +"/Membershipcardconsume/Consume?"+util.commparams().api_params,{
 				package_id  : that.data.guKuId,
 				shop_id     : that.data.shop_id,
 				date        : util.c_date(),
 				cash_coupon : that.data.voucher_off?'yes':'no'
 			},function(res){
 				if(res.code != 0){
 					wx.showModal({title: '提示',content: '抱歉，您不是会员无法使用会员卡，请购买后使用。',showCancel:false})
 				}else{
 					wx.showModal({title: '提示',content: '抱歉，您的会员卡使用时间为'+res.data.start_time+' — '+res.data.end_time+' 。',showCancel:false})
 				}
 			})
			
		}
		
	},
	/*
		扫一扫了解一下
	*/
	initScanCode:function(){
		var that = this;
		var comm = that.data;
		wx.scanCode({
		  onlyFromCamera: true,
		  success:function(res){
		  		var myDate 		= new Date();
		    	var src 		= decodeURIComponent(res.path) 
		    	var shop_id 	= res.result.match(/shop_id=(\S*)/)[1];
		    	var dataConsume = app.apicom +"/Membershipcardconsume/Consume?"+util.commparams().api_params;
     			util.requestPostApi(dataConsume,{
     				package_id  : comm.guKuId,
     				shop_id     : shop_id,
     				date        : util.c_date(),
     				cash_coupon : that.data.voucher_off?'yes':'no'
     			},function(res){
     				if(res.code !== 0){
     					if(res.code == 200004){
     						that.toastedit.showToast('所出示会员卡菜品不一致，请核对所消费菜品重新扫描',1100);
     					}else{
     						that.toastedit.showToast('使用失败 请重新扫描',1100);
     					}
     				}else{
     					wx.showLoading({title: '正在加载中'})
					    setTimeout(function(){
					      	that.setData({
				      			discounted_price   : res.data.discounted_price,  // 折后价格
						        cash_coupon_price  : res.data.cash_coupon_price, // 代金券价格
						        pay_price          : res.data.pay_price,         // 应支付
						        consume_id         : res.data.consume_id,        // 编号
						        date               : res.data.date,
						        package_name  	   : res.data.package_name,
						    	writeSuccess  	   : true,
						    	his_shop           : true
						    })
					        wx.hideLoading()
					    },600)
					    that.is_china()
     				}
     				
     			})
		  	}
		})
	},
	/*
		是否在中国
	*/
	is_china:function(){
		var dataMember  = app.apicom + "/Membershipcard/ineffect?date="+util.c_date()+'&'+util.commparams().api_params,
			that = this;
		util.requestGetApi(dataMember,[],function(res){
			//res.data.is_china = 'no'
			if(res.data.is_china == 'yes'){
				that.setData({is_china:false})
			}else{
				that.setData({is_china:true})
			}
		})
	},
	history_shop:function(e){
		var comm = this.data;
		wx.navigateTo({
	        url: "../coupon/prevolume/prevolume?shop_id="+comm.shop_id
	    }); 
	},
	activityEvent:function(){
		wx.navigateTo({
	        url: "/pages/activity/activity02/activity02"
	    }); 
	},
	voucherCheckedEvent:function(){
		this.data.voucher_off = this.data.voucher_off?true:false; 
		this.data.voucher_off = !this.data.voucher_off
		this.setData({
			voucher_off : this.data.voucher_off
		})
	}
})		