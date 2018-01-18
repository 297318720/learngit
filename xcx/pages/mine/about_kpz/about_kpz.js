var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage
var md5 = util.hexMD5;
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      baseUrl:"",
      show:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.setNavigationBarTitle({
          title:'关于空瓶子'
      });
      // toast组件实例
      var app = getApp();
      new app.ToastPannel();
      new app.ShowModalPannel();
      new app.LoadingPannel();
      this.setData({
          baseUrl:baseUrl
      })
      console.log(this.data.baseUrl)
      // if (wx.canIUse('web-view')) {
      //     this.setData({
      //         show:true
      //     })
      // }else {
      //     this.modal({
      //         content: '当前微信版本过低，无法使用该嵌套H5页面功能，请升级到最新微信版本后重试。',
      //         showCancel:false,
      //         confirmText:'知道了',
      //         confirm:()=>{
      //             wx.navigateBack();
      //         }
      //     })
      // }
  },
    call:function () {
        wx.makePhoneCall({
            phoneNumber: '4008885186'
        })
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