var util = require('../../../utils/util.js');
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
      // 头上的简略信息
      simpleInfo:{

      },
      // 头以下的信息
      merchantDetail:{
          // merchant_id: 1,
          // logo:"/merchant/20170803/jdsf83jidfs8934njd9.jpg",
          // avg_consume:3000,
          // average:4.8,
          // begin_time:"21:00:00",
          // end_time:"09:00:00",
          // image:[
          //     "/assets/forthemoment/商家详情页.png",
          //     "/assets/forthemoment/商家详情页.png",
          //     "/assets/forthemoment/商家详情页.png",
          // ],
          // province:"四川省",
          // city:"成都市",
          // area:"成华区",
          // address:"成华区建设北路三段华茂广场",
          // lat:30.6795539824,
          // lng:104.1071319580,
          // tel:"028-1232134",
          // tags:["WiFi","可刷卡","包厢"],
          // description:"这里是酒吧的简介，这里是酒吧的简介，这里是酒吧的简介，这里是酒吧的简介，这里是酒吧的简介"
      }


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


      // 头上的简略信息
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      http(`${baseUrl}/v1/merchant/simpleInfo`, {client: 'xcx',merchant_id:options.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
          if(res.code == 200){
              this.setData({
                  simpleInfo:res.data
              })
              wx.setNavigationBarTitle({
                  title:this.data.simpleInfo.title
              });
          }
      })
      // 头以下的信息
      http(`${baseUrl}/v1/Merchant/merchantDetail`, {client: 'xcx',merchant_id:options.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
          if(res.code == 200){
              this.setData({
                  merchantDetail:res.data
              })
          }
      })

  },
    call:function () {
        wx.makePhoneCall({
            phoneNumber: this.data.merchantDetail.tel //仅为示例，并非真实的电话号码
        })
    },
    openLocation:function () {
        wx.openLocation({
            latitude: this.data.merchantDetail.lat,
            longitude: this.data.merchantDetail.lng,
            name:this.data.simpleInfo.title,
            address:this.data.merchantDetail.address
        })
    },
    into_album:function () {
        wx.navigateTo({
            url: `./business_album_details/business_album_details?merchant_id=${this.data.simpleInfo.merchant_id}`
        })
    },
    into_user_evaluation:function () {
        wx.navigateTo({
            url: `./user_evaluation/user_evaluation?merchant_id=${this.data.simpleInfo.merchant_id}`
        })
    }


})