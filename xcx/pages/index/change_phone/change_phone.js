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
       this.setData({
           send_tel:options.tel
       })
        wx.setNavigationBarTitle({
            title:'更换手机号码'
        });
    },
    onUnload:function(){
        clearTimeout(Timeout)
    },
    SmsCode_blur:function (e) {
        this.setData({
            SmsCode:e.detail.value
        })
    },
    // 获取验证码
    get_yz:function () {
            var MD5 = md5()
            var timestamp = MD5.timestamp
            var str_md5 = MD5.str_md5
        console.log(this.data.send_tel)
            http(`${baseUrl}/sms/sendSmsCode`, {client: 'xcx',tel:this.data.send_tel,sign:str_md5,timestamp:timestamp}, (res) => {
                console.log(res)
                if(res.code == 200){
                    this.setData({
                        show:false,
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

            var MD5 = md5()
            var timestamp = MD5.timestamp
            var str_md5 = MD5.str_md5
        console.log(this.data.SmsCode)
        console.log(this.data.send_tel)
            http(`${baseUrl}/sms/validate`, {smscode: this.data.SmsCode,tel:this.data.send_tel,sign:str_md5,timestamp:timestamp}, (res) => {
                console.log(res)
                if(res.code != 200){
                    wx.hideLoading()
                    this.show({
                        content:res.msg,
                        // duration:3000
                    });
                }else {
                    wx.navigateTo({
                        url: './submit_phone/submit_phone'
                    })
                }

            })

    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }


})