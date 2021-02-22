var util = require('../../utils/api.js');
var app = getApp();

Page({ 
	data:{
		current_model   : false,//打开浮动顶部
		currentTab      : 3,// 0 为附近 1 为全部 3为空

		seladd  		: '附近',
		whole 			: '全部',
		cityname        : '东京',

		showMore        : true,// loading

		totalCount      : 0,   // data 分页

		is_his 			: true, // 模版加载  ＝ 两种方案

		scroll_hidden   : false, //scroll解决打开弹层解决禁止下拉动作

		country         : 0,

		area_id         : 0, //精品推荐
		init_seladd     :'附近',

		activityModel   : false, //拉新活动
		swiperCurrent   : 0,    // 轮播默认下标为0
		time_out        : 3000

	},
	onLoad:function(options){
		var that = this;
		this._init_from_data(options);//记录访问来源
		this._load_goku_data();//初始化加载 
		
	},
	_load_activityModel:function(){
		var that = this;
		var dataMember  = app.apicom + "/Membershipcard/ineffect?date="+util.c_date()+'&'+util.commparams().api_params;

		util.sevenDaysTimer(function(){
			// 从第一次加载的时候为开始节点
			util.requestGetApi(dataMember,[],function(res){
				if(res.data.is_china == 'yes'){
					that.setData({activityModel:false})
				}else{
					that.setData({activityModel:true})
				}
			})
			
		},function(){
			// 记录超过7天的时候
			util.requestGetApi(dataMember,[],function(res){
				if(res.data.is_china  == 'yes'){
					that.setData({activityModel:false})
				}else{
					that.setData({activityModel:true})
				}
			})
		})
		
	},
	_load_goku_data:function(){//初始化监听登录状态
		var that = this,
			init_area_id = that.data.area_id;
			app.getCommit(function(res){ 
				if(res == 'success'){
					
				 	var dataMember  = app.apicom + "/Membershipcard/ineffect?date="+util.c_date()+'&'+util.commparams().api_params;
				 	
					util.requestGetApi(dataMember,[],function(res){//加载是否为会员

							util.requestGetApi(app.apicom +'/shop/city?'+util.commparams().api_params,[],function(nolmal){
								var normal_city = nolmal.data.selected_city_id;

								var dataUrl     = app.apicom + "/package/lists?city_id="+normal_city+"&area_id="+init_area_id+"&package_type_id=0&"+util.commparams().api_params;

								that._init_is_member(dataUrl,dataMember,that,res,nolmal)
							})
					})
					
					if(wx.getStorageSync('lola').latitude == 0){
						wx.showModal({title: '提示',content: '地理位置无法获取，请授权使用',showCancel:false})
					}
				    
				}
			})
	},
	_init_from_data:function(options){
		//console.log(options)
		if(options.q != undefined){
			var options_url = decodeURIComponent(options.q) 
			app.from_data 	= options_url.match(/from=(\S*)/)[1];
		}
	},
	_init_is_member:function(dataUrl,dataMember,that,res,nolmal){//初始化是否会员
		// console.log(res)
		//console.log(res.data.is_membership)
		var normal_city = nolmal.data.selected_city_id-1;
		if(res.data.is_new == 'yes'){ 
			wx.navigateTo({
				url:"/pages/activity/activity01/activity01"
			});	
		}
		that.setData({
			cityname:nolmal.data.list[normal_city].city
		})
		
		that.getListData(dataUrl,'list');//加载列表

		app.get_window_h(that);//获取设备高度

		that.getHeadBanner(nolmal);//加载head
        //分页地址
		that.setData({requestUrl    : app.apicom + "/package/lists?city_id="+nolmal.data.selected_city_id+"&area_id="+that.data.area_id+"&package_type_id=0&"});

	},

	changeSelectSeladdr:function(e){//筛选
		var that 		= this,
			currentTab  = e.currentTarget.dataset.current;
	    if(this.data.currentTab === e.target.dataset.current) {
	    	that.setData({
	    		currentTab:3,
	    		current_model : false 
	    	});
	    }else{ 
	    	
	      that.setData({
	        currentTab	  : currentTab,
	        current_model : true,
	        scroll_hidden : true
	      })
	    } 
	},
	currentSelect:function(e){//筛选
		// console.log(e)
		var that 		 = this,
			current_list = e.currentTarget.dataset.index,
			current_tab  = that.data.currentTab;
			if(current_tab == 1){//分类
				var get_val   = that.data.packagetype[current_list].package_type;

				var area_id   = that.data.area[that.data.current_by_seladdr].area_id;

				var grt_id    = that.data.packagetype[current_list].package_type_id;
				// console.log(grt_id)
				var shop_city = that.data.shopcity[that.data.country].city_id;
				// console.log(that.data.area[that.data.current_by_seladdr])
				var dataResult = app.apicom + "/package/lists?city_id="+shop_city+"&area_id="+area_id+"&package_type_id="+grt_id+'&'+util.commparams().api_params;
				that.getListData(dataResult,'list');
				that.setData({
					list             : [],//第一步清空数据
					totalCount       : 0, 
					requestUrl       : app.apicom + "/package/lists?city_id="+shop_city+"&area_id="+area_id+"&package_type_id="+grt_id+'&',
					current_by_whole : current_list,
					whole 			 : util.cutString(get_val,6),
			    	showMore		 : true,
			    	current_model  	 : false, //关闭 遮罩
					currentTab       : 3, // 关闭附近 － 类型 － 城市
					scroll_hidden    : false // 关闭scroll-view

			    });
			}else if(current_tab ==0){//附近
				var get_val   = that.data.area[current_list].area;

				var area_id   = that.data.area[current_list].area_id;

				var grt_id    = that.data.packagetype[that.data.current_by_whole].package_type_id;

				var shop_city = that.data.shopcity[that.data.country].city_id;

				var dataResult = app.apicom + "/package/lists?city_id="+shop_city+"&area_id="+area_id+'&package_type_id='+grt_id+'&'+util.commparams().api_params;
				
				that.getListData(dataResult,'list');

				that.setData({
					list               : [],//第一步清空数据
					totalCount         : 0, 
					requestUrl         : app.apicom + "/package/lists?city_id="+shop_city+"&area_id="+area_id+"&package_type_id="+grt_id+'&',
			    	current_by_seladdr : current_list,
					seladd 			   : util.cutString(get_val,9),
			    	showMore           : true,
			    	currentTab         : 1
			    });
			}else if(current_tab ==2){//位置
				// console.log(current_list)
				var get_val   = that.data.shopcity[current_list].city;

				var shop_city = that.data.shopcity[current_list].city_id;

				that.requestScreen('/package/area?city_id='+shop_city+'&',function(areares){

					areares.unshift({"area_id" : that.data.area_id,"area": that.data.init_seladd})

		    		that.requestScreen('/package/packagetype?city_id='+shop_city+'&',function(packagetyperes){

						packagetyperes.unshift({"package_type_id" : "0","package_type" : "全部"})
						
						var dataResult = app.apicom + "/package/lists?city_id="+shop_city+"&area_id="+that.data.area_id+"&package_type_id=0&"+util.commparams().api_params;
						
						that.getListData(dataResult,'list');

						that.setData({
							list               : [],//第一步清空数据
							totalCount         : 0, 
							requestUrl         : app.apicom + "/package/lists?city_id="+shop_city+"&area_id="+that.data.area_id+"&package_type_id=0&",
					    	country            : current_list,
							cityname  		   : get_val,
							seladd  		   : that.data.init_seladd,
					        whole 			   : '全部',
					        area               : areares,
					        packagetype        : packagetyperes,
					        current_by_whole   : 0,
					    	current_by_seladdr : 0,
					    	showMore           : true,
					    	current_model  	   : false, //关闭 遮罩
							currentTab         : 3, // 关闭附近 － 类型 － 城市
							scroll_hidden      : false // 关闭scroll-view
						});
			    	})
		    	})
				
			}
			// console.log(that.data)
	},
	requestScreen:function(type,callback){//筛选公共
		// console.log(app.apicom)
		util.requestGetApi(app.apicom + type + util.commparams().api_params,[],function(res){
			// console.log(res)
			if(type != '/shop/city?'){
				for(var key in res.data)callback(res.data[key])
			}else{
				callback(res.data.list)
			}
			
		});
	},
	getHeadBanner:function(nolmal){//GET HEAD 信息
		

		// console.log('调用成功！！')
		//console.log(nolmal)
		var dataBanner  = app.apicom + "/package/lists";//banner
		var selected_city_id = nolmal.data.selected_city_id;
		var that = this;
		/*
			banner - 加载
		*/
		util.requestGetApi(app.apicom + '/Activity/Banner?'+ util.commparams().api_params,[],function(res){
			that.setData({
				banner:res.data.banner
			})
			
		});

		//筛选 －  类型
		that.requestScreen('/package/packagetype?city_id='+selected_city_id+'&',function(res){
			// console.log(res)
			res.unshift({
    			"package_type_id" : "0",
    			"package_type"    : "全部"
    		})
    		that.setData({
    			packagetype 	   : res,
    			current_by_whole   : 0,
		    	current_by_seladdr : 0,
		    	country 		   : 0
    		});
    	})
    	//筛选 －  附近
    	that.requestScreen('/package/area?city_id='+selected_city_id+'&',function(res){
    		res.unshift({
    			"area_id" : "0",
    			"area"    : "附近"
    		})
    		that.setData({
    			area 			   : res,
    			current_by_whole   : 0 ,
		    	current_by_seladdr : 0,
		    	country 		   : 0
    		});
    	})
    	//城市选择
    	that.requestScreen('/shop/city?',function(res){
    		//console.log(nolmal)
    		// console.log(res)
    		that.setData({
    			shopcity	 	   : res,
    			current_by_whole   : 0,
		    	current_by_seladdr : 0,
		    	country 		   : nolmal.data.selected_city_id-1
    		});
    		// console.log(that.data)
    	}) 
		
	},
	getListData: function(url, settedKey) {//GET List
	    var that = this;
	    wx.request({
	      url    : url,
	      method : 'GET',
	      header: {
	        "Content-Type": 'json',
	        'Cookie': 'goku_login_token=' + wx.getStorageSync('login_token')
	      },
	      success: function (res) {
	        that.processData(res.data,settedKey)
	      },
	      fail: function (error) {
	        // fail
	        console.log(error)
	      }
	    })
	},
	processData: function (gukuList,settedKey) {//GET List
		// console.log(gukuList)
		if(!gukuList.data){
			return
		}
	    var list = [];
	    var subjects = gukuList.data.data.subjects;
	    for (var key in subjects) {
	      var subject  = subjects[key].package;
	      var sbtype   = subjects[key].shop;
	      var imgapim;
	      if(subject.picture_url === ""){
	      	imgapim = ""
	      }else{
	      	imgapim = subject.picture_url
	      }
		  var temp  = {
		  		shop_id          : sbtype.shop_id,//shop_id -> 核销历史记录要用到 
		  		kugu_id          : subject.package_id,//id
		  		picture_url		 : subject.picture_url,//pic-url
		  		commod_list 	 : {//处理comm 商品 List

		  			currency         : subject.currency,//价格
		  			cash_coupon      : sbtype.cash_coupon,//代金券
		  			cash_coupon_status: 'yes',//代金券
		  			icon 			 : subject.icon, // 时间节点套餐状态
		  			name	 	     : sbtype.shop_name,//标题
			        package_name	 : subject.package_name,//套餐name
			        package_type     : subject.package_type.join("	|	"),//套餐类型
			        discount         : subject.discount,//折扣
			        distance		 : subject.distance===undefined?0+'m':subject.distance, // 距离
			        original_price   : subject.original_price,//  原价
			        discounted_price : subject.discounted_price, //折后价
			        full_category    : subject.full_category,
			        wifi             : sbtype.wifi
		  		} 
		    }
		  
	      list.push(temp)
	    }
	    var totalGukuList = {}
	    //如果要绑定新加载的数据，那么需要同旧有的数据合并在一起
	    // 附近上拉加载更多
	    // console.log(list)
	    if(settedKey === 'list'){
		    setTimeout(()=>{
		    	if(list.length > 0){
			    	if (!this.data.showMore){
			    		//数据上滑合并
			    		totalGukuList[settedKey] = this.data.list.concat(list);
				    }else{
				    	//默认
				    	//console.log('默认')
				      	totalGukuList[settedKey] = list;
				      	// console.log(gukuList.data.data.next_page)
				      	if(gukuList.data.data.next_page == 'no'){
				      		this.setData({showMore:false});
				      	}else{
				      		this.data.showMore = false
				      	}
				    }
			    }else{
			    	//数据为空的时候
			    	totalGukuList[settedKey] = []; 
			    	this.setData({showMore:false});
			    }
			    this.setData(totalGukuList);
			    this.data.totalCount += gukuList.data.data.limit;

			    this.setData({
			    	nextpage:gukuList.data.data.next_page
			    })
			    this.data.nextpage  = gukuList.data.data.next_page;

		    },200)
	    }	
	},
	onPullDownRefresh:function(e){//监听页面下拉
		var that = this;
		if(that.data.seladd == that.data.init_seladd && that.data.whole == '全部' && that.data.cityname == '东京'){
			console.log('默认')
			util.requestGetApi(app.apicom +'/shop/city?'+util.commparams().api_params,[],function(nolmal){
				//console.log(nolmal)
				that.getHeadBanner(nolmal);//加载head
				that.setData({
					requestUrl : app.apicom + "/package/lists?city_id="+nolmal.data.selected_city_id+"&area_id=0&package_type_id=0&",
					cityname   : nolmal.data.list[nolmal.data.selected_city_id-1].city
					});//分页地址
				var refreshUrl = that.data.requestUrl+util.commparams().api_params +"&offset=0";
				that.getListData(refreshUrl,'list');
				//console.log(refreshUrl)
			})
			that.setData({
		    	totalCount         : 0, 
		    	showMore           : true,
		    	seladd  		   : that.data.init_seladd,
			    whole 			   : '全部',
			    current_by_whole   : 0,
			    current_by_seladdr : 0
			})
		}else{
			var refreshUrl = that.data.requestUrl+util.commparams().api_params;
			that.setData({
				totalCount         : 0,
		    	showMore           : true,
		    	seladd  		   : that.data.seladd,
			    whole 			   : that.data.whole
			})
		    that.getListData(refreshUrl,'list');
		}
		wx.stopPullDownRefresh();
	},

	onReachBottom:function(e){//监听页面上滑
		// console.log(this.data.totalCount)
		var next_url = this.data.requestUrl + util.commparams().api_params,
			count    = this.data.totalCount;
		this.scroll_more(this,next_url,count,'list')//加载默认上滑
	},
	onShareAppMessage: function (res) {
	    return {
	      title    : '全球美食护照',
          imageUrl : 'http://img08.oneniceapp.com/upload/resource/8367f42ea9a50e1c96062f6f68dd7bff.jpg',
	      path     : '/pages/index/index'
	    }
	},
	currentBannerEvent:function(e){
		var index = e.detail.current;
		this.setData({
			swiperCurrent : index
		})
	},
	defultBannerIntervalEvent:function(){
		if(wx.getStorageSync('info_user') == ''){
			this.setData({time_out : false})
		}
	},
	avtivityEvent:function(e){//授权
		var name = e.currentTarget.dataset.name,
			that  = this;
		if(wx.getStorageSync('info_user') != ''){
			that.navigateToBanner(name);
		}else{
		  util.getGoUserInfo(e.detail,function(r){
	      	that.navigateToBanner(name);
	      },function(r){
	      	that.setData({time_out : true})
	      });
		}
	},
	navigateToBanner:function(name){
		switch (name) {
	      	case 'activation':
	       		wx.navigateTo({
					url:"/pages/index/bannerdetails/bannerdetails"
				});	
	        break;
	     	case 'newuser':
	     		wx.navigateTo({
					url:"/pages/activity/activity01/activity01"
				});	
	        break;
	        case 'invite':
	     		wx.navigateTo({
					url:"/pages/activity/activity02/activity02"
				});	
	        break;
	    }
	},
	onGotUserInfo:function(e){
		var id 	    = e.currentTarget.dataset.id;
		var shop_id = e.currentTarget.dataset.shopid;
		var common  = this.data;
		if(wx.getStorageSync('info_user')!=''){
			wx.navigateTo({
				url:"../index/detail/detail?package_id="+id+'&shop_id='+shop_id
			});	
	    }else{
	      util.getGoUserInfo(e.detail,function(r){
	      	wx.navigateTo({
				url:"../index/detail/detail?package_id="+id+'&shop_id='+shop_id
			});	
	      });
	    }
	},
    _buy_mamber:function () {//open buy mamber - 会员
	    wx.navigateTo({
	      url: "../index/buymember/buymember"
	    });	
    },
	scroll_more:function(ele,url,count,obj){
		//上滑加载更多)
		if(ele.data.nextpage == 'yes'){
		    ele.getListData(url + "&offset="+count,obj);	
		}else{
			ele.setData({showMore:false});
			return
		}	
	},
	onShow:function(){
		var that = this;
		util.prevpass('setNewActivity02',function(r){
			if(r!= undefined){
				if(r.obj.new_activity01 != 'no'){
					that._load_activityModel();
				}
			}
		})
		util.unreadStatus(function(){
			that.setData({unread: true})
		},function(){
			that.setData({unread: false	})
		})
		
	},
	closeModel:function(){//关闭遮罩
		this.setData({
			current_model : false,
			currentTab    : 3,
			scroll_hidden : false
		});
	},
	closeActivityEvent:function(){
		this.setData({
			activityModel : false
		})
	},
	activityEvent:function(e){
		if(wx.getStorageSync('info_user')!=''){
			wx.navigateTo({
				url:"/pages/activity/activity02/activity02"
			})		
	    }else{
	      util.getGoUserInfo(e.detail,function(r){
	      	wx.navigateTo({
				url:"/pages/activity/activity02/activity02"
			})	
	      });
	    }
		
	}
})	
