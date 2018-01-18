// pages/payment/pay_success/pay_success.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      pay_price:null,
      date:"",
      status:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var app = getApp();
      // toast/showModal组件实例
      new app.ToastPannel();
      new app.ShowModalPannel();
      new app.LoadingPannel();
      wx.setNavigationBarTitle({
          title:'支付完成'
      });

      this.setData({
          pay_price:options.pay_price,
          date:options.date,
          status:options.status,
      })
      console.log(options.status)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide:function () {
      setTimeout(()=>{
          wx.hideLoading()
      },500)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})