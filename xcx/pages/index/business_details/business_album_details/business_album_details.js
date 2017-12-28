var util = require('../../../../utils/util.js');
var http = util.http;
var storage = util.storage;
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
      image:[
          // "/assets/forthemoment/商家详情页.png",
          // "/assets/forthemoment/商家详情页.png",
          // "/assets/forthemoment/商家详情页.png",
          // "/assets/forthemoment/商家详情页.png",
          // "/assets/forthemoment/商家详情页.png",
          // "/assets/forthemoment/商家详情页.png",
          // "/assets/forthemoment/商家详情页.png",
          // "/assets/forthemoment/商家详情页.png",
          // "/assets/forthemoment/商家详情页.png",
      ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.setNavigationBarTitle({
          title:'商家相册'
      });
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      http(`${baseUrl}/v1/Merchant/merchantDetail`, {client: 'xcx',merchant_id:options.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
          if(res.code == 200){
              this.setData({
                  image:res.data.image
              })
          }
      })

  },
    previewImage:function (e) {
        wx.getSystemInfo({
            success: (res)=> {
                console.log(res)
                if(res.brand == 'vivo' || res.brand == 'samsung' || res.brand == 'Xiaomi'){
                    return
                }else {
                    var curimage = e.currentTarget.dataset.image;
                    wx.previewImage({
                        current:curimage, // 当前显示图片的http链接
                        urls:this.data.image // 需要预览的图片http链接列表
                    })
                }
            }
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
  onHide: function () {
  
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