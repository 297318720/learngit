var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage
var md5 = util.hexMD5;
var error_bomb = util.error_bomb
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
var index = 1
Page({

  /**
   * 页面的初始数据
   */
  data: {
      isHiddenBottom_loading:true, //底部过渡加载效果的隐藏和显示
      no_data:false,  //是否有数据，有为true,无为false
     list:[
         // {
         //     record_id: 1,
         //     title    : "平台充值",
         //     type    : 2,
         //     change_money: 2000 ,
         //     trade_time: "2107-08-03 12:12:12",
         // },
         // {
         //     record_id: 1,
         //     title    : "卡座预定消费",
         //     type    : 1,
         //     change_money: 1300.00 ,
         //     trade_time: "2107-08-08 10:24:18",
         // },
         // {
         //     record_id: 1,
         //     title    : "卡座套餐消费",
         //     type    : 1,
         //     change_money: 800.00 ,
         //     trade_time: "2107-09-08 10:24:18",
         // },
         // {
         //     record_id: 1,
         //     title    : "平台充值",
         //     type    : 2,
         //     change_money: 1000 ,
         //     trade_time: "2107-08-13 12:12:12",
         // },
         // {
         //     record_id: 1,
         //     title    : "优惠套餐消费",
         //     type    : 1,
         //     change_money: 200.00 ,
         //     trade_time: "2107-08-15 10:24:18",
         // },
     ]
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
          title:'交易明细'
      });
      var member = storage()
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      http(`${baseUrl}/v1/member/transactionDetails`, {token: member.token, client: 'xcx',member_id:member.member_id,page_size:10,page:1,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
          this.setData({
              list:res.data.list
          })
           if(this.data.list.length == 0){
              this.setData({
                  no_data:true
              })
           }
      })
  },
    // 上拉触底
    onReachBottom:function () {
        var member = storage()
        this.setData({
            isHiddenBottom_loading:false
        })
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/transactionDetails`, {token: member.token, client: 'xcx',member_id:member.member_id,page_size:10,page:++index,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
           this.data.list = this.data.list.concat(res.data.list)
            this.data.isHiddenBottom_loading = true
            this.setData(this.data)


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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})