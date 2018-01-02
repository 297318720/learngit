
var util = require('../../utils/util.js');
var http = util.http;
var storage = util.storage
var md5 = util.hexMD5;
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
var formId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      whether_login:0,  //0未登陆 1已登陆
      // 用户余额，K币，卡卷信息
      asset:{
          // money:"0",
          // member_coin:"0",
          // overdue_card:"0",
          // level:""
      },
      member:{
          // avatar:"",
          // nickname:""
      },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      // toast组件实例
      var app = getApp();
      new app.ToastPannel();
      new app.ShowModalPannel();
      // 要判断登录状态是否过期，如果过期了，就把whether_login设置为0。没过期的话就请求用户数据，把whether_login设置为1

      wx.setNavigationBarTitle({
          title:'我的'
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
                  this.login()
             }else {
                 console.log('登录状态未失效')
                 this.setData({
                     whether_login:1,
                     member:{
                         avatar:member.avatar,
                         nickname:member.nickname
                     }
                 })
                 this.userinfo(member)
             }

          })

      }else {
          this.login()
      }

  },
    login:function () {
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
                                wx.hideLoading()
                                var jsondata = JSON.stringify(res.data)
                                wx.setStorageSync('member', jsondata)
                                  this.setData({
                                      member:{
                                          avatar:res.data.avatar,
                                          nickname:res.data.nickname
                                      }
                                  })
                                this.setData({
                                    whether_login:1,
                                })
                                this.userinfo(res.data)

                            })
                        }else {
                            console.log("code不存在")
                        }
                        console.log(res.code)

                    },
                    fail: ()=> {
                        console.log('获取接口调用失败' + res.errMsg + res)
                        wx.stopPullDownRefresh()
                        wx.hideNavigationBarLoading()
                        // wx.showModal({
                        //     content: '监测到您没开打空瓶子的用户信息权限，是否去设置打开？',
                        //     success: (res) =>{
                        //         if (res.confirm) {
                        //             this.openSetting()
                        //         } else if (res.cancel) {
                        //             console.log('用户点击取消')
                        //             wx.hideLoading()
                        //             wx.stopPullDownRefresh()
                        //             wx.hideNavigationBarLoading()
                        //         }
                        //     }
                        // })
                        this.modal({
                            content:"监测到您没开打空瓶子的用户信息权限，是否去设置打开？",
                            confirm:()=>{
                                this.openSetting()
                            },
                            cancel:()=>{
                                wx.stopPullDownRefresh()
                                wx.hideNavigationBarLoading()
                            },
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
            // fail:(res)=>{
            //     console.log(res)
            //     this.setData({
            //         shi:res.authSetting["scope.userLocation"]
            //     })
            // }
        })
    },
    // 获取用户会员信息
    userinfo:function (get_member) {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/vipInfo`,{token:get_member.token,client:'xcx',member_id:get_member.member_id,sign:str_md5,timestamp:timestamp},(res)=>{
              console.log(res)
            wx.hideLoading()
            this.setData({
                asset:{
                    money:res.data.money,
                    member_coin:res.data.member_coin,
                    overdue_card:res.data.overdue_card,
                    level:res.data.level,
                }
            })
            wx.stopPullDownRefresh()
            wx.hideNavigationBarLoading()
        })
    },
    into_my_purse:function () {
        if(this.data.whether_login == 0){
            wx.hideLoading()
            this.show({
                content:'请先登录',
                // duration:3000
            });
          return
        }
        wx.navigateTo({
            url: './my_purse/my_purse'
        })
    },
    into_card_coupons:function () {
        if(this.data.whether_login == 0){
            wx.hideLoading()
            this.show({
                content:'请先登录',
                // duration:3000
            });
            return
        }
        wx.navigateTo({
            url: './card_coupons/card_coupons'
        })
    },
    into_kb:function () {
        if(this.data.whether_login == 0){
            wx.hideLoading()
            this.show({
                content:'请先登录',
                // duration:3000
            });
            return
        }
        wx.hideLoading()
        this.show({
            content:'还未开通，敬请期待~',
            // duration:3000
        });

    },
    into_member_center:function () {
        if(this.data.whether_login == 0){
            wx.hideLoading()
            this.show({
                content:'请先登录',
                // duration:3000
            });
            return
        }
        wx.navigateTo({
            url: `./member_center/member_center?level=${this.data.asset.level}`
        })
    },
    into_recharge:function () {
        if(this.data.whether_login == 0){
            wx.hideLoading()
            this.show({
                content:'请先登录',
                // duration:3000
            });
            return
        }
        wx.navigateTo({
            url: './recharge/recharge?type=1'
        })
    },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      wx.setNavigationBarTitle({
          title:"我的"
      });
  },
  into_contacts_message:function () {
      if(this.data.whether_login == 0){
          wx.hideLoading()
          this.show({
              content:'请先登录',
              // duration:3000
          });
          return
      }
      wx.navigateTo({
          url: '../index/contacts_message/contacts_message?type=1'
      })
  },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        console.log('下拉刷新')
        wx.showNavigationBarLoading()
            this.onLoad()
    },
    into_operating_guide:function () {
        wx.navigateTo({
            url: './userguide/userguide'
        })
        // wx.miniProgram.navigateTo({url: 'https://member.app.sc-csj.com/html/manual/index.html'})
    },

    //
    // formSubmit:function (e) {
    //     console.log(wx.getStorageSync('access_token'))
    //     formId = e.detail.formId
    //     var oldtime = wx.getStorageSync('access_token_oldtime')
    //     if(oldtime == "" || oldtime + 60*60*2*1000 <= new Date().getTime()){
    //         http(`https://api.weixin.qq.com/cgi-bin/token`, {
    //             grant_type:'client_credential',
    //             appid:'wxe7eb76f1aa81417a',
    //             secret:'40daeb889167f846d68ca96adbd1eb06'
    //         }, (res) => {
    //             console.log(res)
    //             wx.setStorageSync('access_token',res.access_token)
    //             wx.setStorageSync('access_token_oldtime',new Date().getTime())
    //             this.send_template()
    //         })
    //     }else {
    //         this.send_template()
    //     }
    //
    //
    // },
    // // 发送模板
    // send_template:function () {
    //     var member = storage()
    //     http("https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send",{
    //         access_token:wx.getStorageSync('access_token'),
    //         touser:member.openid,
    //         template_id:"udzk3T_vWdE8xOgONDD2Jwg5gmdCpw_qHquQeLaQh4Y",
    //         form_id:formId,
    //         data:{
    //             "keyword1": {
    //                 "value": "339208499",
    //                 "color": "#173177"
    //             },
    //             "keyword2": {
    //                 "value": "2015年01月05日 12:30",
    //                 "color": "#173177"
    //             },
    //             "keyword3": {
    //                 "value": "粤海喜来登酒店",
    //                 "color": "#173177"
    //             } ,
    //             "keyword4": {
    //                 "value": "广州市天河区天河路208号",
    //                 "color": "#173177"
    //             }
    //         }
    //
    // },(res)=>{
    //         console.log(res)
    //     })
    // }

})