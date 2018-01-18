var util = require('../../../../utils/util.js');
var http = util.http;
var storage = util.storage;
var md5 = util.hexMD5;
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
      merchant_id:"",
      evaluate:{
          // average: "4.9",
          // environment_star: 4.8,
          // atmosphere_star: 4.5,
          // service_star: 4.0,
      },
      list:[
      //     {
      //     comment_id: 1,
      //     merchant_id: 1,
      //     created_time: "2017-8-18",
      //     average: "4.6",
      //     content: "酒吧环境好，酒吧环境好，酒吧环境好，酒吧环境好，酒吧环境好" ,
      //     member_id: "13",
      //     avatar: "/member/20160921/to179583447187.jpg",
      //     realname:"李四"
      //     },{
      //     comment_id: 1,
      //     merchant_id: 1,
      //     created_time: "2017-8-18",
      //     star: "4.6",
      //     content: "酒吧环境好，酒吧环境好，酒吧环境好，酒吧环境好，酒吧环境好" ,
      //     member_id: "13",
      //     avatar: "/member/20160921/to179583447187.jpg",
      //     realname:"李四"
      // },{
      //     comment_id: 1,
      //     merchant_id: 1,
      //     created_time: "2017-8-18",
      //     star: "4.6",
      //     content: "酒吧环境好，酒吧环境好，酒吧环境好，酒吧环境好，酒吧环境好" ,
      //     member_id: "13",
      //     avatar: "/member/20160921/to179583447187.jpg",
      //     realname:"李四"
      // },{
      //     comment_id: 1,
      //     merchant_id: 1,
      //     created_time: "2017-8-18",
      //     star: "4.6",
      //     content: "酒吧环境好，酒吧环境好，酒吧环境好，酒吧环境好，酒吧环境好" ,
      //     member_id: "13",
      //     avatar: "/member/20160921/to179583447187.jpg",
      //     realname:"李四"
      // },
      ],
      isHiddenBottom_loading:true, //底部过渡加载效果的隐藏和显示
      no_evaluation:null  //是否有评价，有评价为true,无评价为false
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
          title:'评价'
      });
      this.setData({
          merchant_id:options.merchant_id
      })
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      // 获取商户星级
      http(`${baseUrl}/v1/Comment/merchantStar`, {client: 'xcx',merchant_id:options.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
          if(res.code == 200){
              this.setData({
                  evaluate:res.data
              })
          }
      })
      // 获取用户评价列表
      http(`${baseUrl}/v1/Comment/commentList`, {client: 'xcx',merchant_id:options.merchant_id,page:1,page_size:10,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
          if(res.code == 200){
              this.setData({
                  list:res.data.list
              })
          }
          if(this.data.list.length == 0){
              this.setData({
                  no_evaluation:false
              })
          }else {
              this.setData({
                  no_evaluation:true
              })
          }
      })
  },
    // 上拉触底
    onReachBottom:function () {
        console.log('上拉触底')
        this.setData({
            isHiddenBottom_loading:false
        })
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/Comment/commentList`, {client: 'xcx',merchant_id:this.data.merchant_id,page:++index,page_size:10,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            if(res.code == 200){
                this.data.list = this.data.list.concat(res.data.list)
                this.data.isHiddenBottom_loading = true
                this.setData(this.data)

            }
        })
    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }

})