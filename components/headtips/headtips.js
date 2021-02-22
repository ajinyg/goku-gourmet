// components/Dialog/dialog.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    //提示内容
    content: {
      type: String,
      value: '默认消息'
    },
    // 样式
    className: {
      type: String,
      value: 'normal'
    },
    overflow:{
      type: String,
      value: 'line'
    }
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    // no  action
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    // no action
  }
})