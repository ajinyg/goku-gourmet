var util = require('../../../utils/api.js');
var app = getApp();
Page({  
    data:{  
    	headDate	    : ['日','一','二','三','四','五','六'],
    	hiddenLoading   : true,
    	is_buy_calendar : false //是否调用购买日历
    },  
    onLoad: function (options){
    	var that 		 = this;
    	var calendarData = app.apicom + "/package/calendar?package_id="+options.package_id;
    	util.requestGetApi(calendarData,[],that.calendarData);
    },
	calendarData:function(res){
		this.dateData(res.data);
	},
    dateData: function (obj) {
	    var dataAll      = []//总日历数据
	    var dataAll2     = []//总日历数据
	    var dataMonth    = []//月日历数据
	    var date		 = new Date//当前日期
	    var year 		 = date.getFullYear()//当前年
	    var week 		 = date.getDay();//当天星期几
	    var weeks 		 = []
	    var month        = date.getMonth() + 1//当前月份
	    var day 		 = date.getDate()//当天
	    var daysCount    = 180//一共显示多少天
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
	      	
	        dataMonth  			= []
	        var t_days 			= [31, 28 + leapYear(yearList[i]), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
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
	              if (k + 1 >= day) {
	              		var moth_o   = mList[j] < 10?"0" + mList[j]:mList[j];
	                	var viewDate =  yearList[i] + "-" + moth_o + "-" + days
		              	var dayBool  = [];
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
				                selected : dayBool,
				                re       : viewDate
			                }
			            }
	                	dataMonth.push(nowData)
	              }
	            } else {//其他情况
            	  var moth_o   = mList[j] < 10?"0" + mList[j]:mList[j];
	              var viewDate =  yearList[i] + "-" +moth_o + "-" + days
              	  var dayBool  = [];
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
			                selected : dayBool,
			                re       : viewDate
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
	    var weekssw = new Date().getDay();
    	weeks.unshift(weekssw)
	    this.setData({
	      date          : dataAll2,
	      weeks         : weeks,
	      month 		: month,
	      hiddenLoading : false
	    })
	    // console.log(this.data)
	  }
})  
