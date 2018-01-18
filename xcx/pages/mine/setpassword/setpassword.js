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
        isFocus1: true,//输入新密码的显示
        isFocus2: false,//再次输入密码的显示
        isFocus:true,
        wallets_password1:"",
        wallets_password2:"",
        // wallets_password_flag:false,//密码输入遮罩,
        setStatus:false,
        value:"",
        type:""


    },
    //事件处理函数
    onLoad: function (options) {
        // toast组件实例
        var app = getApp();
        new app.ToastPannel();
        new app.ShowModalPannel();
        new app.LoadingPannel();
        wx.setNavigationBarTitle({
            title:'设置支付密码'
        });

        if(options.type){
            this.setData({
                type:1
            })
        }
    },
    setpassword:function (e) {
        this.setData({
            wallets_password_flag: true,
            isFocus1: true
        })
    },
    set_wallets_password:function (e) {
        if(this.data.wallets_password1.length < 6){
            console.log(e.detail.value)
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
                    isFocus2: true,
                    value:"",


                })
                // return ""
            }
        }else {
            this.setData({
                isFocus:true
            })
            console.log(e.detail.value)
            var pages = getCurrentPages();
            var currPage = pages[pages.length - 1];  //当前页面
            var prevPage = pages[pages.length - 2]; //上一个页面
            var member = storage()
            this.setData({
                wallets_password2: e.detail.value
            });
            if (this.data.wallets_password2.length == 6) {//密码长度6位时，自动验证钱包支付结果
                if(this.data.wallets_password2 === this.data.wallets_password1){
                    wx.showLoading({
                        title: '密码提交中',
                        mask:true
                    })
                    var MD5 = md5()
                    var timestamp = MD5.timestamp
                    var str_md5 = MD5.str_md5
                    http(`${baseUrl}/v1/member/setPassword`, {token: member.token, client: 'xcx',member_id:member.member_id,password:this.data.wallets_password2,sign:str_md5,timestamp:timestamp}, (res) => {
                        console.log(res)
                        if(this.data.type == ""){
                            prevPage.data.my_purse.is_password = 1
                            prevPage.setData(prevPage.data)
                        }
                        wx.hideLoading()
                        this.show({
                            content:'密码设置成功',
                            // duration:3000
                        });
                        setTimeout(()=>{
                            wx.navigateBack();
                        },1000)
                    })
                }else {
                    // wx.showModal({
                    //     content: '两次输入密码不对',
                    //     showCancel:false,
                    //     success: (res)=> {
                    //         if (res.confirm) {
                    //             this.setData({
                    //                 isFocus1:true,
                    //                 isFocus2:false,
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
                                isFocus1:true,
                                isFocus2:false,
                                wallets_password1:"",
                                wallets_password2:"",
                                isFocus:true

                            })
                        },
                    })
                }
                this.setData({
                    value:""
                })
                // return ""
            }
        }
    },
    // set_wallets_password1(e) {//获取钱包密码
    //     this.setData({
    //         wallets_password1: e.detail.value,
    //         value:e.detail.value
    //     });
    //     console.log(this.data.value)
    //     if (this.data.wallets_password1.length == 6) {//密码长度6位时，自动验证钱包支付结果
    //         wx.showLoading({
    //             title: '',
    //         })
    //         setTimeout(()=>{
    //             wx.hideLoading()
    //         },500)
    //         this.setData({
    //             isFocus1: false,
    //             isFocus2: true,
    //         })
    //     }
    // },
    // set_wallets_password2(e) {//获取钱包密码
    //     var pages = getCurrentPages();
    //     var currPage = pages[pages.length - 1];  //当前页面
    //     var prevPage = pages[pages.length - 2]; //上一个页面
    //     this.setData({
    //         wallets_password2: e.detail.value
    //     });
    //     if (this.data.wallets_password2.length == 6) {//密码长度6位时，自动验证钱包支付结果
    //            if(this.data.wallets_password2 === this.data.wallets_password1){
    //                wx.showLoading({
    //                    title: '密码提交中',
    //                })
    //                setTimeout(()=>{
    //                    wx.hideLoading()
    //                    prevPage.data.my_purse.is_password = 1
    //                    prevPage.setData(prevPage.data)
    //                    wx.navigateBack();
    //                },1500)
    //
    //            }else {
    //                wx.showModal({
    //                    content: '两次输入密码不对',
    //                    showCancel:false,
    //                    success: (res)=> {
    //                        if (res.confirm) {
    //                            this.setData({
    //                                isFocus1:true,
    //                                isFocus2:false,
    //                                wallets_password1:null,
    //                                wallets_password2:null,
    //                            })
    //                        }
    //                    }
    //                })
    //            }
    //     }
    // },
    set_Focus1() {//聚焦input
        console.log('isFocus', this.data.isFocus)
        this.setData({
            isFocus1: true,
            isFocus2: false,
            isFocus:true
        })
    },
    set_Focus2() {//聚焦input
        console.log('isFocus', this.data.isFocus)
        this.setData({
            isFocus1: false,
            isFocus2: true,
            isFocus:true
        })
    },
    set_notFocus() {//失去焦点
        this.setData({
            isFocus: false
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
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }
    // pay() {//去支付
    //     pay(this)
    // }
})
