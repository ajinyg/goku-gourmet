// components/dialog-toast/toast.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    toastText: {
      type: String,
      value: '内容'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    toastShow: false,
    opacity: 1
  },
  attached: function () {

  },
  /**
  * 组件的方法列表
  */
  methods: {
    showToast: function (text, time) {
      if (this.data.toastShow) {
        return
      }
      var _this = this
      this.setData({
        toastShow: !this.data.toastShow,
        toastText: text
      })
      if (!time) time = 8000;
      setTimeout(() => {
        // this.setData({  
        //   toastShow: !this.data.toastShow  
        // })  
        _this.counter()
      }, time);
    },
    counter: function () {
      var _this = this,
        setp = .1
      setTimeout(() => {
        _this.setData({
          opacity: _this.data.opacity -= setp
        })
        if (_this.data.opacity > 0) {
          _this.counter()
        } else {
          _this.setData({
            opacity: 1,
            toastShow: false
          })
        }
      }, 10)
    }
  }
})
