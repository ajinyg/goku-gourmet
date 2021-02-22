var app = getApp();
var util= require('../../utils/api.js');
Page({
  data: {
    iphonex  : app.isiphonex, // 判断是否是iphonex
    intro    :  "",
    share_bg : "/images/share-bg.png",
    shareModel :true
  },
  onLoad: function (options) {
    var info_name = wx.getStorageSync('info_user').nickName+"邀请您加入全球美食护照,新用户可获得美食代金券，可用来全日本合作餐厅菜品消费抵扣！";
    this.setData({intro:info_name})
    this.toastedit = this.selectComponent("#toastedit");//获得toastedit组件
    app.get_window_h(this);         //获取设备高度
    this.initWechartQrcode(this.data);  // 默认 初始化生成二维码
  },
 
  
  /*
    根据 token  对应生成二维码
  */ 
  initWechartQrcode:function(info){
    var that = this;
    util.requestPostApi(app.apicom+'/common/Invite?'+util.commparams().api_params,{
      token:wx.getStorageSync('login_token')
    },function(res){
       switch (res.code) {
            case 0://
               that.setData({ share_qrcode:res.data.invite_qrcode})
                wx.downloadFile({
                  url: res.data.invite_qrcode,
                  success: function(res) {
                    console.log(res)
                    that.drawShareImages(res.tempFilePath,info);
                  }
                })
            break;
            case 200000://未登录  
              wx.removeStorageSync('login_token')
              util.forceLogin(function(){
                that.initWechartQrcode(that.data);
              })
            break;
        }
    })
  },
  /*
    导出
  */ 
  saveImagesEvent:function(){
    var that =this
    wx.canvasToTempFilePath({
        destWidth:1125,
        destHeight:1809,
        canvasId: 'secondCanvas',
        fileType: 'jpg',
        success: function (res) {
          console.log(res)
          /* 这里 就可以显示之前写的 预览区域了 把生成的图片url给image的src */
          that.saveImagesPhotos(res);
        }
    })
  },
  /*
    保存到本地相册
  */ 
  saveImagesPhotos:function(res){
    var that = this;
    wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success:function(result) {
            wx.showLoading({title: '正在绘制中'})
            wx.downloadFile({
              url:that.data.share_qrcode,
              success: function(r) {
                  that.drawShareImages(res.tempFilePath,that.data);
                  wx.hideLoading()
                  that.toastedit.showToast('已保存到相册，快来分享起来吧～',2500);
              }
            })
        },
        fail:function(error){
          that.toastedit.showToast('点击允许才能保存哦～',1800);
          that.spoceSaveImages()
        }
    })
  },
   /*
    如 用户拒绝 － 强行授权
  */
  spoceSaveImages:function(){
    var that = this;
    wx.openSetting({
        success: function (data) {
          if (data.authSetting["scope.writePhotosAlbum"] == true) {
            that.saveImagesEvent()
          }else{          
            that.toastedit.showToast('点击允许才能保存哦～',1800);
          }
        }
      })
  },
  /*
    获取分享绘图
  */ 
  drawShareImages:function(r,info){
    var that       = this,
        contentStr = info.intro,
        canvas     = wx.createCanvasContext('secondCanvas'),
               Rpx = that.data.winWidth / 375,  // 获取canvas的的宽  自适应宽（设备宽/750) px
        lineHeight = Rpx * 30,       //设置行高
       paddingLeft = Rpx * 45,       //左边距
      paddingRight = Rpx * 45,       //右边距
 currentLineHeight = Rpx * 20,       //当前行高
        winWidth   = that.data.winWidth,
        winHeight  = 1206/2,
       share_bg    = that.data.share_bg,
    share_envelope = that.data.share_envelope,
  avatarurl_width  = 120,                       //绘制的头像宽度
  avatarurl_heigth = 120,                       //绘制的头像高度
       avatarurl_x = winWidth / 2 - avatarurl_width/2,      //绘制的头像在画布上的位置
       avatarurl_y = 380,       //绘制的头像在画布上的位置
    share_qrcode   = r;
    
    canvas.drawImage(share_bg, 0, 0, winWidth, winHeight); // 先绘制背景

    canvas.save();

    canvas.beginPath(); //开始绘制
    //canvas.arc(120 / 2 + avatarurl_x, 120 / 2 + avatarurl_y, 120 / 2, 0, Math.PI * 2, false);
    //canvas.rect(avatarurl_x,avatarurl_y, avatarurl_width, avatarurl_heigth);
    canvas.setFillStyle('#716bea');//字体颜色

    canvas.setTextAlign('center'); //  位置

    canvas.setStrokeStyle('#ffe05c')

    canvas.setLineWidth(8); //边框宽度

    var result = breakLinesForCanvas(canvas, contentStr || '无内容', winWidth - paddingLeft - paddingRight, `${(Rpx * 18).toFixed(0)}px PingFangSC-Regular`);
    
    if(result.length >= 6)lineHeight = 25

    result.forEach(function (line, index) {
      currentLineHeight += Rpx * lineHeight;
      canvas.fillText(line,  winWidth / 2,index==0?285:235+currentLineHeight);
    })
    canvas.arc(avatarurl_width / 2 + avatarurl_x, avatarurl_heigth / 2 + avatarurl_y, avatarurl_width / 2, 0, Math.PI * 2, false);

    canvas.clip()
    //that.roundRect(canvas,avatarurl_x,avatarurl_y, avatarurl_width, avatarurl_heigth,50)
    //console.log(share_qrcode)
    canvas.drawImage(share_qrcode, avatarurl_x+4, 385, 113, 111); // 推进去图片，必须是https图片

    canvas.stroke();
   
    canvas.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制

    canvas.draw(true,setTimeout(function(r){
      //that.saveImagesEvent()
      
    },100));   
  },
  
  /**
  * 
  * @param {CanvasContext} ctx canvas上下文
  * @param {number} x 圆角矩形选区的左上角 x坐标
  * @param {number} y 圆角矩形选区的左上角 y坐标
  * @param {number} w 圆角矩形选区的宽度
  * @param {number} h 圆角矩形选区的高度
  * @param {number} r 圆角的半径
  */
 roundRect:function(ctx, x, y, w, h, r) {
    // 开始绘制
    ctx.beginPath()
    // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
    // 这里是使用 fill 还是 stroke都可以，二选一即可
    ctx.setFillStyle('transparent')
    //ctx.setStrokeStyle('transparent')
    // 左上角
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

    // border-top
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.lineTo(x + w, y + r)
    // 右上角
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

    // border-right
    ctx.lineTo(x + w, y + h - r)
    ctx.lineTo(x + w - r, y + h)
    // 右下角
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

    // border-bottom
    ctx.lineTo(x + r, y + h)
    ctx.lineTo(x, y + h - r)
    // 左下角
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

    // border-left
    ctx.lineTo(x, y + r)
    ctx.lineTo(x + r, y)

    // 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
    ctx.fill()

    // ctx.stroke()
    ctx.closePath()
    // 剪切
    ctx.clip()

  }
})
function findBreakPoint(text, width, context) {
  var min = 0;
  var max = text.length - 1;
  while (min <= max) {
    var middle = Math.floor((min + max) / 2);
    var middleWidth = context.measureText(text.substr(0, middle)).width;
    var oneCharWiderThanMiddleWidth = context.measureText(text.substr(0, middle + 1)).width;
    if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
      return middle;
    }
    if (middleWidth < width) {
      min = middle + 1;
    } else {
      max = middle - 1;
    }
  }
 
  return -1;
}
function breakLinesForCanvas(context, text, width, font) {
  var result = [];
  if (font) {
    context.font = font;
  }
  var textArray = text.split('\r\n');
  console.log(textArray)
  for (let i = 0; i < textArray.length; i++) {
    let item = textArray[i];
    var breakPoint = 0;
    while ((breakPoint = findBreakPoint(item, width, context)) !== -1) {
      result.push(item.substr(0, breakPoint));
      item = item.substr(breakPoint);
    }
    if (item) {
      result.push(item);
    }
  }
  return result;
}    