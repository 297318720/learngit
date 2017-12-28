var util = require('../../utils/util.js');
var http = util.http
var md5 = util.hexMD5;
var storage = util.storage
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;

var index= 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      // 0已取消 1未支付 2已支付 3已逾期 4已完成 5已作废
      whether_login:null,  //0未登陆 1已登陆
      is_order:false,  //当前有无订单
      isHiddenBottom_loading:true, //底部过渡加载效果的隐藏和显示
    list:[
        // {
        //     order_no:"201708032564157268625",
        //     merchant_title:"维纳斯酒吧",
        //     merchant_id:1,
        //     logo:"/assets/order_image/order_arrow@2x.png",
        //     total_price: 2000.00,
        //     format_time: "2017-08-03 12:00:00",
        //     created_time: 1532644645,  //秒
        //     status:0,
        //     order_type:2
        // },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
      var app = getApp();
      // toast/showModal组件实例
      new app.ShowModalPannel();

      wx.setNavigationBarTitle({
          title:"订单"
      });

      var JSONmember = wx.getStorageSync('member')
      if(JSONmember != ""){
          var member = JSON.parse(JSONmember)
          console.log('不为空')
          var MD5 = md5()
          var timestamp = MD5.timestamp
          var str_md5 = MD5.str_md5
          http(`${baseUrl}/v1/Member/verifyToken`,{token:member.token,sign:str_md5,timestamp:timestamp},(res)=>{
              console.log(res)
              if(res.code != 200){
                  console.log('登录状态失效')
                  this.setData({
                      whether_login:0
                  })
                  wx.stopPullDownRefresh()
                  wx.hideNavigationBarLoading()
              }else {
                  console.log('登录状态未失效')
                  this.setData({
                      whether_login:1,
                  })
                  this.myOrderList(member)
              }
          })
      }else {
          this.setData({
              whether_login:0
          })
          wx.stopPullDownRefresh()
          wx.hideNavigationBarLoading()
      }

      console.log('订单列表')
  },
    login:function () {
        wx.showLoading({
            title: '加载中',
        })
        wx.login({
            success:  (res) =>{
                wx.getUserInfo({
                    success:  (user)=> {
                        wx.showLoading({
                            title: '正在登陆',
                        })
                        if (res.code) {
                            //发起网络请求
                            var MD5 = md5()
                            var timestamp = MD5.timestamp
                            var str_md5 = MD5.str_md5
                            http(`${baseUrl}/v1/member/wxlogin`,{code: res.code, iv: user.iv, encryptedData: encodeURIComponent(user.encryptedData),sign:str_md5,timestamp:timestamp},(res)=>{
                                console.log(res)
                                var jsondata = JSON.stringify(res.data)
                                wx.setStorageSync('member', jsondata)
                                this.setData({
                                    whether_login:1
                                })
                                this.myOrderList(res.data)
                                wx.hideLoading()
                            })
                        }else {
                            console.log("code不存在")
                            wx.hideLoading()
                        }
                        console.log(res.code)

                    },
                    fail: ()=> {
                        console.log('获取接口调用失败' + res.errMsg + res)
                        wx.hideLoading()
                        // wx.showModal({
                        //     content: '监测到您没开打空瓶子的用户信息权限，是否去设置打开？',
                        //     confirmText:'确认',
                        //     success: (res) =>{
                        //         if (res.confirm) {
                        //             wx.openSetting()
                        //         } else if (res.cancel) {
                        //             console.log('用户点击取消')
                        //         }
                        //     }
                        // })
                        this.modal({
                            content:"监测到您没开打空瓶子的用户信息权限，是否去设置打开？",
                            confirm:()=>{
                                this.openSetting()
                            }
                        })
                    }
                });
            }
        });

    },
    openSetting:function () {
        wx.openSetting({
            success: (res) => {
                setTimeout(()=>{
                    wx.getSetting({
                        success: (res) => {
                            if(res.authSetting["scope.userInfo"]){
                                this.login()
                            }
                            /*
                             * res.authSetting = {
                             *   "scope.userInfo": true,
                             *   "scope.userLocation": true
                             * }
                             */
                        }
                    })
                },300)

            },

        })
    },
    myOrderList:function (get_member) {
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5


            //主动修改订单状态
        http(`${baseUrl}/v1/order/updateStatus`,{client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
            http(`${baseUrl}/v1/order/myOrderList`,{token:get_member.token,client:'xcx',member_id:get_member.member_id,page:1,page_size:8,sign:str_md5,timestamp:timestamp},(res)=>{
                console.log(res)
                this.setData({
                    list:res.data.list
                })

                if(this.data.whether_login == 1 && this.data.list.length == 0){
                    this.setData({
                        is_order:true
                    })
                }else {
                    this.setData({
                        is_order:false
                    })
                }
                wx.stopPullDownRefresh()
                wx.hideNavigationBarLoading()
            })
        })

    },

    into_business_details:function (e) {
            wx.navigateTo({
                url: `../index/business_details/business_details?merchant_id=${e.currentTarget.dataset.merchant_id}`
            })
    },
    into_order_details:function (e) {
      var order_no =e.currentTarget.dataset.order_no
        console.log(order_no)
        wx.navigateTo({
            url: `./order_details/order_details?order_no=${order_no}&index=${e.currentTarget.dataset.index}`
        })
    },
    evaluated:function (e) {
        wx.navigateTo({
            url: `./no_evaluated/no_evaluated?index=${e.currentTarget.dataset.index}&type=${e.currentTarget.dataset.type}&order_no=${e.currentTarget.dataset.order_no}`
        })
    },
    reserve_card:function (e) {
        wx.navigateTo({
            url: `../index/bar_details/bar_details?type=1&merchant_id=${e.currentTarget.dataset.merchant_id}`
        })
    },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
      console.log('下拉刷新')
      wx.showNavigationBarLoading()
      this.onLoad()
      index = 1
  },

    // 上拉触底
    onReachBottom:function () {
        if(this.data.whether_login == 1 && this.data.list.length != 0){
            this.setData({
                isHiddenBottom_loading:false
            })
            var member = storage()
            var MD5 = md5()
            var timestamp = MD5.timestamp
            var str_md5 = MD5.str_md5
            http(`${baseUrl}/v1/Order/myOrderList`, {token:member.token,client:'xcx',member_id:member.member_id,page:++index,page_size:8,sign:str_md5,timestamp:timestamp}, (res) => {
                console.log(res)
                if(res.code == 200){
                    this.data.list = this.data.list.concat(res.data.list)
                    this.data.isHiddenBottom_loading = true
                    this.setData(this.data)
                }



            })
        }


    },
    pay:function (e) {
        wx.navigateTo({
            url: `../index/confirm_order/confirm_order?status=1&created_time=${e.currentTarget.dataset.created_time}&order_no=${e.currentTarget.dataset.order_no}&pay_price=${e.currentTarget.dataset.pay_price}&date=${e.currentTarget.dataset.date}&begin_time_time=${e.currentTarget.dataset.begin_time_time}`
        })
    },
    into_waiter_details:function (e) {
        wx.navigateTo({
            url: `../index/waiter_details/waiter_details?employee_id=${e.currentTarget.dataset.employee_id}&type=1`
        })
    }



})