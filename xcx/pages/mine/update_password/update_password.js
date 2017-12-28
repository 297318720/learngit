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
    data: {
        isFocus1: true,//验证前密码的显示
        isFocus2: false,//输入新密码的显示
        isFocus3: false,//再次输入密码的显示
        isFocus4: false,//手机短信验证码的显示
        isFocus:true,   //原密码，新密码，确认密码输入框
        isFocus0:false,  //密码验证输入框
        wallets_password:"", //验证前密码
        wallets_password1:"",//输入新密码
        wallets_password2:"", //再次输入密码
        // wallets_password_flag:false,//密码输入遮罩,
        setStatus:false,
        value:"",

        // 以下是短信验证的数据
        input_tel:null,
        send_tel:null,
        show:true,
        submit_show:true,
        clock: 60,
        SmsCode:"",
        is_yanzheng:false  //是否为验证短信设置密码

    },
    //事件处理函数
    onLoad: function (options) {
        // toast组件实例
        var app = getApp();
        new app.ToastPannel();
        new app.ShowModalPannel();

        wx.setNavigationBarTitle({
            title:'修改支付密码'
        });
        if(options.type){
            this.forget_password()
        }
    },
    setpassword:function (e) {
        this.setData({
            wallets_password_flag: true,
            isFocus1: true
        })
    },
    set_wallets_password:function (e) {
        if(this.data.is_yanzheng){
            this.new_passwrod(e)
        }else {
            if(this.data.wallets_password.length < 6){
                this.setData({
                    wallets_password: e.detail.value,
                    value:e.detail.value
                });
                if (this.data.wallets_password.length == 6) {//密码长度6位时，自动验证钱包支付结果
                    var member = storage()
                    var wallets_password = this.data.wallets_password
                    console.log(this.data.wallets_password)
                    wx.showLoading({
                        title: '验证中',
                    })
                    // 提前清除，防止点击太快出现BUG
                    this.setData({
                        wallets_password:"", //验证前密码
                        value:"",
                    })
                    var MD5 = md5()
                    var timestamp = MD5.timestamp
                    var str_md5 = MD5.str_md5
                    http(`${baseUrl}/v1/member/verifyPayPassword`, {token: member.token, client: 'xcx',member_id:member.member_id,password:wallets_password,sign:str_md5,timestamp:timestamp}, (res) => {
                        console.log(res)
                        if(res.data.is_success == 1){
                            this.setData({
                                wallets_password:wallets_password,
                                isFocus1: false,
                                isFocus2: true,
                                isFocus3: false,
                                isFocus4: false,
                                isFocus:true,
                            })
                        }else{

                            wx.hideLoading()
                            this.show({
                                content:'输入密码错误',
                                // duration:3000
                            });
                            console.log(this.data.is_yanzheng)
                        }
                        wx.hideLoading()
                    })
                }
            }else{
                console.log('else')
                this.new_passwrod(e)
            }
        }
    },
    // 输入新密码和再次确认密码的验证
    new_passwrod:function (e) {
        console.log(this.data.is_yanzheng)
        var member = storage()
        if(this.data.wallets_password1.length < 6){

            this.setData({
                wallets_password1: e.detail.value,
                value:e.detail.value
            });
            if (this.data.wallets_password1.length == 6) {//密码长度6位时，自动验证钱包支付结果
                // 安卓机有BUG
                // wx.showLoading({
                //     title: '',
                // })
                // setTimeout(()=>{
                //     wx.hideLoading()
                // },500)
                this.setData({
                    isFocus1: false,
                    isFocus2: false,
                    isFocus3: true,
                    value:"",
                })

            }
        } else {
            console.log(e.detail.value)
            this.setData({
                isFocus:true
            })
            this.setData({
                wallets_password2: e.detail.value
            });
            if (this.data.wallets_password2.length == 6) {//密码长度6位时，自动验证钱包支付结果
                if(this.data.wallets_password2 === this.data.wallets_password1){
                    wx.showLoading({
                        title: '密码提交中',
                    })
                    var MD5 = md5()
                    var timestamp = MD5.timestamp
                    var str_md5 = MD5.str_md5
                    http(`${baseUrl}/v1/member/setPassword`, {token: member.token, client: 'xcx',member_id:member.member_id,password:this.data.wallets_password2,sign:str_md5,timestamp:timestamp}, (res) => {
                        console.log(res)
                        wx.hideLoading()
                        this.show({
                            content:'密码修改成功',
                            // duration:3000
                        });
                        this.setData({
                            isFocus:false
                        })
                        setTimeout(()=>{
                            wx.navigateBack();
                        },700)
                    })

                }else {
                    // wx.showModal({
                    //     content: '两次输入密码不对',
                    //     showCancel:false,
                    //     success: (res)=> {
                    //         if (res.confirm) {
                    //             this.setData({
                    //                 isFocus1:false,
                    //                 isFocus2:true,
                    //                 isFocus3: false,
                    //                 // wallets_password:"",
                    //                 wallets_password1:"",
                    //                 wallets_password2:"",
                    //                 isFocus:true
                    //
                    //             })
                    //         }
                    //     }
                    // })
                    this.modal({
                        content:"两次输入密码不对",
                        showCancel:false,
                        confirm:()=>{
                            this.setData({
                                isFocus1:false,
                                isFocus2:true,
                                isFocus3: false,
                                // wallets_password:"",
                                wallets_password1:"",
                                wallets_password2:"",
                                isFocus:true

                            })
                        }
                    })
                }
                this.setData({
                    value:""
                })
                // return ""
            }
        }
    },
    set_Focus() {//聚焦input
        this.setData({
            isFocus:true
        })
    },
    close_wallets_password () {//关闭钱包输入密码遮罩
        this.setData({
            isFocus1: false,//失去焦点
            isFocus2: false,//失去焦点
            wallets_password1:null,
            wallets_password2:null,
            wallets_password_flag: false,
        })
    },
    // pay() {//去支付
    //     pay(this)
    // }
   // 以下是关于短信验证的逻辑
    onUnload:function(){
        clearTimeout(Timeout)
    },
    phone_blur:function (e) {
        console.log(typeof e.detail.value)
        this.setData({
            input_tel:e.detail.value
        })

    },
    SmsCode_blur:function (e) {
        console.log(e.detail.value)
        this.setData({
            SmsCode:e.detail.value
        })
    },
    // 判断输入的手机号是否合法
    get_yz:function () {
        var member = storage()
            this.setData({
                show:false,
                submit_show:false,
                isFocus0:true
            })
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/sendCode`, {token: member.token, client: 'xcx',member_id:member.member_id,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)

        })
            this.count_down()

    },
    count_down:function(){
        // 渲染倒计时时钟
        this.setData({
            clock: nowdate
        });

        if (nowdate<= 0) {
            nowdate = 60
            this.setData({
                show:true,
                submit_show:true
            })
            // timeout则跳出递归
            return;
        }
        Timeout = setTimeout( ()=> {
            // 放在最后--
            nowdate -= 1;
            this.count_down();
        }, 1000)

    },
    submit:function () {
        var member = storage()
        if(this.data.SmsCode.length !== 6){
            wx.hideLoading()
            this.show({
                content:'请输入正确的6位验证码',
                // duration:3000
            });
            return
        }
        // 发送HTTP请求
        wx.showLoading({
            title:'验证中'
        })
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/validateCode`, {token: member.token, client: 'xcx',member_id:member.member_id,smscode:this.data.SmsCode,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            if(res.code == 200){
                wx.hideLoading()
                this.setData({
                    isFocus:true,
                    isFocus1: false,//验证前密码的显示
                    isFocus2: true,//输入新密码的显示
                    isFocus3: false,//再次输入密码的显示
                    isFocus4: false,//手机短信验证码的显示
                })
            }else {
                wx.hideLoading()
                this.show({
                    content:'验证码输入错误',
                    // duration:3000
                });
            }
        })

    },
    forget_password:function () {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/verifyBindPhoneNumber`, {token: member.token, client: 'xcx',unionid:member.unionid,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
           if(res.code != 200){
               // wx.showModal({
               //     title: '提示',
               //     confirmText:'去绑定',
               //     content: '您未绑定手机号码',
               //     success: function(res) {
               //         if (res.confirm) {
               //             console.log('用户点击确定')
               //             wx.navigateTo({
               //                 url: '../../index/bind_phone/bind_phone'
               //             })
               //         } else if (res.cancel) {
               //             console.log('用户点击取消')
               //         }
               //     }
               // })
               this.modal({
                   content:"您未绑定手机号码",
                   confirmText:'去绑定',
                   confirm:()=>{
                       wx.navigateTo({
                           url: '../../index/bind_phone/bind_phone'
                       })
                   }
               })
           }else{
               this.setData({
                   isFocus:false,
                   isFocus1: false,//验证前密码的显示
                   isFocus2: false,//输入新密码的显示
                   isFocus3: false,//再次输入密码的显示
                   isFocus4: true,//手机短信验证码的显示
                   is_yanzheng:true,
                   value:""
               })
           }

        })

    },
})
