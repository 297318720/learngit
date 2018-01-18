var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage
var md5 = util.hexMD5;
var error_bomb = util.error_bomb
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      list:{
          // member_id: 1,
          // used_card: 0, //已使用数量
          // overdue:1,  //逾期卡券总数量数量
          // have_card: 1 //未使用数量
      },
      no_data:false  //是否有数据，有为true,无为false
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
          title:'我的卡券'
      });
      var member = storage()
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      http(`${baseUrl}/v1/member/mycard`, {token: member.token, client: 'xcx',member_id:member.member_id,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
          this.setData({
              list:res.data
          })
         if(this.data.list.overdue == 0){
              this.setData({
                  no_data:true
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