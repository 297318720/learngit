var nowdate = 60;
var Timeout;
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
     input_tel:null,
      send_tel:null,
      show:true,
      submit_show:true,
      clock: 60,
      SmsCode:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      nowdate = 60;
      var app = getApp();
      // toast/showModal组件实例
      new app.ToastPannel();
      new app.ShowModalPannel();
      new app.LoadingPannel();
      wx.setNavigationBarTitle({
          title:'绑定手机号'
      });
  },
    onUnload:function(){
        clearTimeout(Timeout)
    },
    phone_blur:function (e) {
        console.log(e.detail.value)
       this.setData({
           input_tel:e.detail.value
       })

    },
    SmsCode_blur:function (e) {
        this.setData({
            SmsCode:e.detail.value
        })
    },
    // 判断输入的手机号是否合法
    get_yz:function () {
        if(/^1[34578]\d{9}$/.test(this.data.input_tel)){
            var MD5 = md5()
            var timestamp = MD5.timestamp
            var str_md5 = MD5.str_md5
            http(`${baseUrl}/sms/sendSmsCode`, {client: 'xcx',tel:this.data.input_tel,sign:str_md5,timestamp:timestamp}, (res) => {
                console.log(res)
                if(res.code == 200){
                    this.setData({
                        show:false,
                        send_tel:this.data.input_tel,
                        submit_show:false
                    })
                    this.count_down()
                }else {
                    wx.hideLoading()
                    this.show({
                        content:res.msg,
                        // duration:3000
                    });
                }
            })


        }else {
            this.setData({
                show:true
            })
            wx.hideLoading()
            this.show({
                content:'请输入正确的手机号码',
                // duration:3000
            });

        }
    },
    count_down:function(){
        // 渲染倒计时时钟
        this.setData({
            clock: nowdate
        });

        if (nowdate<= 0) {
            nowdate = 60
            this.setData({
                show:true
            })

            // timeout则跳出递归
            return;
        }
        Timeout = setTimeout( ()=> {
            // 放在最后--
            nowdate -= 1;
            console.log(nowdate)
            this.count_down();
        }, 1000)

    },
    submit:function () {
        if(this.data.SmsCode.length !== 6){
            wx.hideLoading()
            this.show({
                content:'请输入正确的6位验证码',
                // duration:3000
            });
            return
        }
        if(/^1[34578]\d{9}$/.test(this.data.input_tel)){
            wx.showLoading({
                title:'提交中'
            })
            console.log(this.data.SmsCode)
            var MD5 = md5()
            var timestamp = MD5.timestamp
            var str_md5 = MD5.str_md5
            http(`${baseUrl}/sms/validate`, {smscode: this.data.SmsCode,tel:this.data.send_tel,sign:str_md5,timestamp:timestamp}, (res) => {
                console.log(res)
                if(res.code != 200){
                    wx.hideLoading()
                    this.show({
                        content:res.msg,
                        // duration:3000
                    });
                }else {
                    var member = storage()
                    http(`${baseUrl}/v1/member/bidPhoneNumber`, {token: member.token, client: 'xcx',unionid:member.unionid,tel:this.data.send_tel,sign:str_md5,timestamp:timestamp}, (res) => {
                        console.log(res)
                        if(res.code == 200){
                            wx.hideLoading()
                            this.show({
                                content:'手机号码绑定成功',
                                // duration:3000
                            });
                            setTimeout(()=>{
                                wx.navigateBack();
                            },700)
                        }else {
                            wx.hideLoading()
                            this.show({
                                content:res.msg,
                                // duration:3000
                            });
                        }


                    })
                }

            })
            // this.setData({
            //     submit_show:true
            // })

        }else {
            this.setData({
                show:true
            })
            wx.hideLoading()
            this.show({
                content:'请输入正确的手机号码',
                // duration:3000
            });
        }
    },

    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }


})