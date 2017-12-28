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
     my_purse:{
         // member_id:1,
         // money:0,
         // is_password:0  //是否设置支付密码 0未设置 1已设置
     },
      show:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


      wx.setNavigationBarTitle({
          title:'我的钱包'
      });
      var member = storage()

      this.capital(member)

  },
    capital:function(get_member){
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/capital`, {token: get_member.token, client: 'xcx',member_id:get_member.member_id,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            this.data.my_purse = res.data
            this.data.my_purse.money = this.data.my_purse.money.toString()
            this.setData(this.data)
            wx.stopPullDownRefresh()
            wx.hideNavigationBarLoading()
        })
},
    recharge:function () {
        wx.navigateTo({
            url: '../recharge/recharge?type=2'
        })
    },
    into_consumer_details:function () {
        wx.navigateTo({
            url: '../consumer_details/consumer_details'
        })

    },
    instruction:function () {
        this.setData({
            show:true
        })

    },
    quxiao:function () {
        this.setData({
            show:false
        })
    },
    into_setpassword:function () {
        wx.navigateTo({
            url: '../setpassword/setpassword'
        })
    },
    into_update_password:function () {
        wx.navigateTo({
            url: '../update_password/update_password'
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        console.log('下拉刷新')
        wx.showNavigationBarLoading()
        this.setData({
            show:false
        })
        this.onLoad()
    },
})