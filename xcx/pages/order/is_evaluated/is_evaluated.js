var util = require('../../../utils/util.js');
var http = util.http
var md5 = util.hexMD5;
var storage = util.storage
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      data_evaluated:{
          // merchant_title: "星巴克(兰桂坊店)",
          // logo: "/assets/forthemoment/order_labelling.png",
          // merchant_id: 1,
          // order_no: "1708240343581124641463",
          // environment: 3,
          // atmosphere: 3,
          // service: 4,
          // content: "我真的是超喜欢这里的哦，阿凡达司法所的放大撒的发阿斯蒂芬啊",
          // employee_star: 5,
          // employee_avatar: "/assets/forthemoment/order_labelling.png",
          // employee_realname: "李小曼"
      }
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
          title:"我的评价"
      });

      var member = storage()
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      http(`${baseUrl}/v1/comment/commentByOrder`,{order_no:options.order_no,token:member.token,member_id:member.member_id,client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
          console.log(res)
          if(res.code == 200){
              this.setData({
                  data_evaluated:res.data
              })
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