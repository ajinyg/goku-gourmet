var app = getApp();
var util = require('../../../../utils/api.js');
import { GuKuList } from '../../detail/class/detail.js';
Page({
  data: {
    wechat        : true, // 取消距离
    hiddenLoading : true
  },
  onLoad: function (options){
      var that       =  this;
      var type_id    = options.typeId;
      var detailData = app.apicom + "/package/detail/?package_id=" + type_id+"&"+util.commparams().api_params;
      var detGuke    = new GuKuList(detailData);
        detGuke.getGukuData(function(data,commod_list){//详情初始化
          that.setData({
              detailList    : data,
              commod_list   : commod_list
          });
        })
      setTimeout(()=>{
        this.setData({hiddenLoading : false})
      },1000)
  }
})