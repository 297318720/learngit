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
     img:[],
      previewImage_list:[],
      height:"",
      show:false  //是否用H5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log(baseUrl)
     this.setData({
         baseUrl:baseUrl
     })

      wx.setNavigationBarTitle({
          title: "用户指南"
      });
      console.log(wx.canIUse('web-view'))
      if (wx.canIUse('web-view')) {
         this.setData({
             show:true
         })
      } else {
          wx.getSystemInfo({
              success: (res)=> {
                  console.log(res.windowHeight)
                  this.setData({
                      height:res.windowHeight
                  })
              }
          })
          // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
          // wx.showModal({
          //     title: '提示',
          //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          // })
          var member = storage()
          var MD5 = md5()
          var timestamp = MD5.timestamp
          var str_md5 = MD5.str_md5
          http(`${baseUrl}/v1/member/userguide`,{token:member.token,client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
              console.log(res)
              this.setData({
                  img:res.data
              })
              res.data.forEach((item)=>{
                  this.data.previewImage_list.push(item.url)
              })
              this.setData(this.data)
          })

      }


  },
    loadimg:function (e) {
        var index =e.currentTarget.dataset.index
        this.data.img[index].height = e.detail.height
        this.setData(this.data)
    },

    previewImage:function (e) {
       var curimage = e.currentTarget.dataset.image;

       wx.previewImage({
           current:curimage, // 当前显示图片的http链接
           urls:this.data.previewImage_list // 需要预览的图片http链接列表
       })
    },



})