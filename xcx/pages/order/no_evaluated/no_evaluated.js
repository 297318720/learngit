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
     // 打分
      order_no:"", //订单号
      stars: [0, 1, 2, 3, 4],
      stat_off: '/assets/order_image/order_star_one.png',
      stat_on: '/assets/order_image/order-_star_click_one.png',
      key1: 0,  //酒吧环境
      key2: 0,  //酒吧服务
      key3: 0,  //音乐演艺
      key4: 0,  //服务员

      num:80,  // 剩余字数
      num1:6,  //至少输入的字数
      sum:"",  //当前输入的总字数
      index:"",    //当前订单详情对应的订单列表的index
      type:"",     //上一个页面是表列页还是详情页
      value:"",
      data_evaluated:{
          // merchant_title: "星巴克(兰桂坊店)",
          // merchant_id: "1",
          // logo: "ad/20170822/bqv1503382111cbds829.jpg",
          // order_no: "1170830155558408974",
          // employee_avatar: "http://p1.music.126.net/u90gIteTsanANKM6VAWKNQ==/18795051767223821.jpg?param=140y140",
          // employee_realname: "袁康",
          // employee_id: "袁康",
      }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      // toast组件实例
      var app = getApp();
      new app.ToastPannel();
      new app.ShowModalPannel();
      new app.LoadingPannel();
      wx.setNavigationBarTitle({
          title:"我的评价"
      });
      if(options.type == "1"){
          this.setData({
              index:options.index
          })
      }
      this.setData({
          type:options.type,
          order_no:options.order_no
      })
      var member = storage()
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      http(`${baseUrl}/v1/comment/commentBaseInfo`,{order_no:this.data.order_no,token:member.token,member_id:member.member_id,client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
          console.log(res)
          if(res.code == 200){
              this.setData({
                  data_evaluated:res.data
              })
          }
      })
  },
    selectstat: function (e) {
        var key = e.currentTarget.dataset.key
        var type= e.currentTarget.dataset.type
        switch(type) {
            case "1":
                this.setData({
                    key1:key
                })
                break;
            case "2":
                this.setData({
                    key2:key
                })
                break;
            case "3":
                this.setData({
                    key3:key
                })
                break;
            case "4":
                this.setData({
                    key4:key
                })
                break;
        }
    },
    input:function (e) {

        this.setData({
            num1:6 - e.detail.value.length,
            sum:e.detail.value.length,
            value:e.detail.value
        })




    },
    submit:function () {
       if(this.data.key1 == 0 || this.data.key2 == 0 || this.data.key3 == 0 || (this.data.data_evaluated.employee_realname == undefined?false:this.data.key4 == 0)){
           wx.hideLoading()
           this.show({
               content:'星级打分请填噢',
               // duration:3000
           });
           return
       }else if(this.data.sum <6){
           wx.hideLoading()
           this.show({
               content:'评论文字须达到6个噢~',
               // duration:3000
           });
           return
       }

        wx.showLoading({
            title: '提交中',
        })
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];  //当前页面
        var prevPage = pages[pages.length - 2]; //上一个页面

        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        console.log(this.data.order_no)
        if(this.data.data_evaluated.employee_realname == undefined){
            //没有客户经理的评价
            http(`${baseUrl}/v1/comment/submitComment`,{
                uid:member.uid,
                content:this.data.value,
                atmosphere_star:this.data.key3,
                service_star:this.data.key2,
                environment_star:this.data.key1,
                merchant_id:this.data.data_evaluated.merchant_id,
                order_no:this.data.order_no,
                token:member.token,
                member_id:member.member_id,
                client:'xcx',
                sign:str_md5,
                timestamp:timestamp
                },
                (res)=>{
                console.log(res)
                wx.hideLoading()
                if(res.code == 200){
                    if(this.data.type == "1"){
                        prevPage.data.list[this.data.index].is_comment = 1
                        prevPage.setData(prevPage.data)
                    }else {
                        prevPage.data.cur_message.is_comment =1
                        prevPage.setData(prevPage.data)
                    }
                    wx.navigateBack();
                }else {
                    // wx.showModal({
                    //     title: '提示',
                    //     content: res.msg,
                    //     showCancel:false,
                    //     success: function(res) {
                    //         if (res.confirm) {
                    //             // if(res.code == ){
                    //             //     wx.navigateBack();
                    //             // }
                    //         }
                    //     }
                    // })

                    this.modal({
                        content:res.msg,
                        showCancel:false,

                    })
                }
            })
            //有客户经理的评价
        }else {
            http(`${baseUrl}/v1/comment/submitComment`,{uid:member.uid,employee_star:this.data.key4,employee_id:this.data.data_evaluated.employee_id,content:this.data.value,atmosphere_star:this.data.key3,service_star:this.data.key2,environment_star:this.data.key1,merchant_id:this.data.data_evaluated.merchant_id,order_no:this.data.order_no,token:member.token,member_id:member.member_id,client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
                console.log(res)
                wx.hideLoading()
                if(res.code == 200){
                    if(this.data.type == "1"){
                        prevPage.data.list[this.data.index].is_comment = 1
                        prevPage.setData(prevPage.data)
                    }else {
                        prevPage.data.cur_message.is_comment =1
                        prevPage.setData(prevPage.data)
                    }
                    wx.navigateBack();
                }else {
                    // wx.showModal({
                    //     title: '提示',
                    //     content: res.msg,
                    //     showCancel:false,
                    //     success: function(res) {
                    //         if (res.confirm) {
                    //             // if(res.code == ){
                    //             //     wx.navigateBack();
                    //             // }
                    //         }
                    //     }
                    // })
                    this.modal({
                        content:res.msg,
                        showCancel:false,
                        confirm:()=>{

                        }
                    })
                }
            })
        }


    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }

})