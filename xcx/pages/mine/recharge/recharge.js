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
      list:[
          {
              // recharge_money:500,
              // give_money:30,
              // flag:true
          }
      ],
      cur:{} , //当前选中
      type:""  //1是从我的主页进入的，2是从钱包进来的
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      // toast组件实例
      var app = getApp();
      new app.ToastPannel();
      new app.ShowModalPannel();

      wx.setNavigationBarTitle({
          title:'充值'
      });
      this.setData({
          type:options.type
      })
      // 获取充值金额列表
      var member = storage()
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      http(`${baseUrl}/v1/goods/recharge`,{token:member.token,client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
          console.log(res)
          if(res.code == 200){
              this.setData({
                  list:res.data
              })
              this.data.list.forEach((item)=>{
                  item.flag = false
              })
              this.data.list[0].flag = true
              this.data.cur = this.data.list[0]
              this.setData(this.data)
          }
      })
  },
    cur_choose:function (e) {
        var index = e.currentTarget.dataset.index;
        this.data.list.forEach((item)=>{
            item.flag = false
        })
        this.data.list[index].flag = true
        this.data.cur = this.data.list[index]
        this.setData(this.data)
    },
    into_recharge_agreement:function () {
        wx.navigateTo({
            url: '../recharge_agreement/recharge_agreement'
        })

    },
    login:function () {
        wx.login({
            success:  (res) =>{
                wx.getUserInfo({
                    success:  (user)=> {
                        if (res.code) {
                            //发起网络请求
                            var MD5 = md5()
                            var timestamp = MD5.timestamp
                            var str_md5 = MD5.str_md5
                            http(`${baseUrl}/v1/member/wxlogin`,{code: res.code, iv: user.iv, encryptedData: encodeURIComponent(user.encryptedData),sign:str_md5,timestamp:timestamp},(res)=>{
                                console.log(res)
                                wx.hideLoading()
                                var jsondata = JSON.stringify(res.data)
                                wx.setStorageSync('member', jsondata)

                            })
                        }else {
                            console.log("code不存在")
                        }
                        console.log(res.code)

                    },
                    fail: ()=> {
                        console.log('获取接口调用失败' + res.errMsg + res)
                        // wx.showModal({
                        //     content: '监测到您没开打空瓶子的用户信息权限，是否去设置打开？',
                        //     confirmText:'确认',
                        //     success: (res) =>{
                        //         if (res.confirm) {
                        //             wx.hideLoading()
                        //             this.openSetting()
                        //         } else if (res.cancel) {
                        //             wx.hideLoading()
                        //             console.log('用户点击取消')
                        //         }
                        //     }
                        // })
                        this.modal({
                            content:"监测到您没开打空瓶子的用户信息权限，是否去设置打开？",
                            confirm:()=>{
                                wx.openSetting()
                            }
                        })
                    }
                });
            }
        });

    },

    recharge:function () {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        wx.showLoading({
            title: '加载中',
            mask:true
        })

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
                    this.login()
                }else {
                    console.log('登录状态未失效')
                    http(`${baseUrl}/v1/member/verifyBindPhoneNumber`,{token:member.token,client: 'xcx',unionid:member.unionid,sign:str_md5,timestamp:timestamp},(res)=>{
                        console.log(res)
                        if(res.code != 200){
                            wx.hideLoading()
                            // wx.showModal({
                            //     title: '提示',
                            //     content: '监测到您还未绑定手机号',
                            //     showCancel:false,
                            //     confirmText:'去绑定',
                            //     success: (res) =>{
                            //         if (res.confirm) {
                            //             console.log('用户点击确定')
                            //             wx.navigateTo({
                            //                 url: `../../index/bind_phone/bind_phone`
                            //             })
                            //         }
                            //     }
                            // })
                            this.modal({
                                content:"监测到您还未绑定手机号",
                                showCancel:false,
                                confirmText:'去绑定',
                                confirm:()=>{
                                    wx.navigateTo({
                                        url: `../../index/bind_phone/bind_phone`
                                    })
                                }
                            })
                        }else {

                            http(`${baseUrl}/wxpay/payment`,{
                                uid:member.uid,
                                token:member.token,
                                client: 'xcx',
                                member_id:member.member_id,
                                pay_money:this.data.cur.recharge_money,
                                payment:2,
                                openid:member.xcx_openid,
                                sign:str_md5,
                                timestamp:timestamp,
                                pay_type:2
                            },(res)=>{
                                console.log(res)
                                if(res.code == 200){
                                    wx.hideLoading()
                                    wx.requestPayment({
                                        'timeStamp': res.data.timeStamp.toString(),
                                        'nonceStr': res.data.nonceStr,
                                        'package': res.data.package,
                                        'signType': res.data.signType,
                                        'paySign': res.data.paySign,
                                        'success':(res)=>{
                                            console.log(res)
                                            if(this.data.type == 1){
                                                wx.redirectTo({
                                                    url: `../my_purse/my_purse`
                                                })
                                            }else {
                                                var pages = getCurrentPages();
                                                var currPage = pages[pages.length - 1];  //当前页面
                                                var prevPage = pages[pages.length - 2]; //上一个页面
                                                prevPage.setData({
                                                    show:false
                                                })
                                                prevPage.onLoad()
                                                wx.navigateBack();
                                            }


                                        },
                                        'fail':(res)=>{
                                            console.log(res)
                                        },
                                    })
                                }else {
                                    wx.hideLoading()
                                    this.show({
                                        content:res.msg,
                                        // duration:3000
                                    });
                                }
                                // paySign = MD5(appId=wxd678efh567hg6787&nonceStr=5K8264ILTKCH16CQ2502SI8ZNMTM67VS&package=prepay_id=wx2017033010242291fcfe0db70013231072&signType=MD5&timeStamp=1490840662&key=qazwsxedcrfvtgbyhnujmikolp111111) = 22D9B4E54AB1950F51E0649E8810ACD6
                            })

                        }
                    })

                }
            })
        }else {
            this.login()
        }




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