var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage;
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
      is_click:false,
      // 商户ID
      merchant_id:null,
      is_offer:null,  //是否显示客户经理,0不显示，1显示
     // 优惠套餐，卡座预定，卡座套餐的切换
     show:[{flag:true,name:'优惠套餐',zhu:false},{flag:false,name:'卡座套餐',zhu:false},{flag:false,name:'卡座预定',zhu:false}],
      // 商户简略数据
      merchantDetail:{
          // merchant_id: 1,
          // logo:"images/20160921/tooopen_sy_179583447187.jpg",
          // title: "维纳斯酒吧",
          // avg_consume: 3000,
          // distance: "1562" ,
          // average: 4.8,
          // begin_time: "21:00",
          // end_time  : "09:00"
      },
      // 优惠套餐列表
      favourable_list:[
          // {
          //     image: "/assets/forthemoment/picture@2x.png",
          // title: "2-4人进口洋酒套餐",
          // price: 3000 ,
          // description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
          // stock:20
          // },
          // {
          //     image: "/assets/forthemoment/picture@2x.png",
          // title: "2-4人进口洋酒套餐",
          // price: 3000 ,
          // description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
          // stock:0
          // }
      ],
      // 客户经理列表
      manager_list:[
          // {average:'4.8',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:1,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:2,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:3,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:4,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:5,type:4},
          // {average:'4.8',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:1,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:2,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:3,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:4,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:5,type:4},
          // {average:'4.8',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:1,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:2,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:3,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:4,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:5,type:4},
          // {average:'4.8',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:1,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:2,type:4},
          // {average:'5.0',image:'/assets/forthemoment/bar_photo@2x.png',curchoose:false,employee_id:3,type:4},

                      ],

      // 卡座套餐列表
      cassette_list:[
          // {image: "/assets/forthemoment/picture@2x.png",
          // title: "卡座VIP人进口洋酒套餐",
          // price: 3000 ,
          // description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打",
          // stock:20},{image: "/assets/forthemoment/picture@2x.png",
          // title: "2-4人进口洋酒套餐",
          // price: 3000 ,
          // description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
          // stock:0}
      ],
      // 当前选中的经理的序号，-1是还未选择
      cur_choose_manager:-1,

      // 当前选中的经理的ID
      choose_id:"",

      height:140,  //客户经理滑动条高度

      type:"",
      item:'',
      
      date:"",   // 散套日期
      date1:"",   // 卡套日期
      date2:"",   //卡座日期
      nowtime:null,  //此时此刻的时间
      outdated:null,  //是否到了营业时间
      begin_time:null, //到店时间年月日时分
      start:"",
      start1:"",  //卡套的开始时间
      end:"",
      days: null,   //能选择的天数


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var app = getApp();
      // toast组件实例
      new app.ToastPannel();
      new app.ShowModalPannel();
      // 传递过来的商户ID
      console.log(this)
      this.setData({
          merchant_id:options.merchant_id
      })

      // 初始化商户简略信息
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      console.log(options.merchant_id)
      http(`${baseUrl}/v1/merchant/simpleInfo`, {client: 'xcx',merchant_id:options.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
          if(res.code == 200){
             this.setData({
                 merchantDetail:res.data
             })
              wx.setNavigationBarTitle({
                  title:this.data.merchantDetail.title
              });
              // 把酒吧名存入储存给确认订单用,写在HTTP请求后
              wx.setStorageSync('title',this.data.merchantDetail.title)
          }
      })

      // 初始化服务人员列表
      http(`${baseUrl}/v1/Employee/employeeList`,{client: 'xcx',merchant_id:options.merchant_id,type:4,sign:str_md5,timestamp:timestamp},(res)=>{
          console.log(res)
          if(res.code == 200){
             this.setData({
                 is_offer:res.data.is_offer
             })
              if(res.data.is_offer == 1){
                  res.data.list.forEach((item)=>{
                      item.curchoose = false
                  })
                  this.setData({
                      manager_list:res.data.list
                  })
                  //根据客户经理数量判断滑动的高度,写在拿到列表之后
                  this.height_y()
              }
          }

      })

      // 获取当前时间和商家营业时间判断时候营业无法预定今天的
      http(`${baseUrl}/v1/merchant/serverTime`, {client: 'xcx',merchant_id:this.data.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res.data)
          this.setData({
              nowtime:new Date(res.data.now_time*1000),
              begin_time:res.data.begin_time*1000
          })
          if(res.code == 200){
              if(res.data.now_time < res.data.begin_time){
                  this.setData({
                      outdated:false
                  })

              }else {
                  this.setData({
                      outdated:true
                  })
              }
              this.http_favourable_list()  //获取优惠套餐默认列表和卡套默认列表
              // 获取商家预定周期时间
              http(`${baseUrl}/v1/merchant/preordainCycle`, {client: 'xcx',merchant_id:this.data.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
                  console.log(res)
                  if(res.code == 200){
                      console.log(res.data.preordain_cycle)
                      this.setData({
                          days:res.data.preordain_cycle
                      })
                      // 初始化套餐的日期选择的开始和结束时间
                      var today = this.data.nowtime
                      this.setData({
                          start1:this.getDateString(today),  //卡套的开始时间
                      })
                      if(this.data.outdated){
                          // 已经过了营业时间不能定今天的
                          var tomorrow = new Date(today.getFullYear(), today.getMonth(),today.getDate()+1)
                          this.setData({
                              start:this.getDateString(tomorrow),
                              end:this.getDateString(new Date(today.getFullYear(), today.getMonth(),today.getDate()+this.data.days-1 ))
                          })
                      }else {
                          // 没过营业时间可以定今天的
                          this.setData({
                              start:this.getDateString(today),
                              end:this.getDateString(new Date(today.getFullYear(), today.getMonth(),today.getDate()+this.data.days-1 ))
                          })
                      }

                  }
              })
          }
      })








      if(options.type){
          this.data.show.forEach((item)=>{
              item.flag = false
          })
          this.data.show[2].flag = true
          this.setData(this.data)
      }

      var member = storage()
      if(member.unionid == undefined){
          member.unionid = ""
      }
  },
    // 初始化优惠套餐列表和卡套列表
    http_favourable_list:function () {
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        var today = this.getDateString(this.data.nowtime)
        if(this.data.outdated){
            var tomorrow = new Date(this.data.nowtime.getFullYear(),this.data.nowtime.getMonth(),this.data.nowtime.getDate()+1)
            this.setData({
                date:this.getDateString(tomorrow),
                date2:this.getDateString(tomorrow)  //预定卡座的默认时间
            })
        }else {
            this.setData({
                date:today,
                date2:today  //预定卡座的默认时间
            })
        }
        this.setData({
            date1:today  //卡座套餐默认时间
        })
        // 优惠套餐列表
        http(`${baseUrl}/v1/goods/packList`,{date:this.data.date,client: 'xcx',merchant_id:this.data.merchant_id,type:1,sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
            if(res.code == 200){
                    this.setData({
                        favourable_list:res.data.list
                    })
            }else {
                wx.hideLoading()
                this.show({
                    content:res.msg,
                    // duration:3000
                });
            }

        })
        // 卡座套餐列表
        http(`${baseUrl}/v1/goods/packList`,{date:this.data.date1,client: 'xcx',merchant_id:this.data.merchant_id,type:2,sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
            if(res.code == 200){
                this.setData({
                    cassette_list:res.data.list
                })
            }else {
                wx.hideLoading()
                this.show({
                    content:res.msg,
                    // duration:3000
                });
            }

        })

    },
    into_business_details:function () {
        wx.navigateTo({
            url: `../business_details/business_details?merchant_id=${this.data.merchant_id}`
        })
    },
    height_y:function () {
        var sum = this.data.manager_list.length
        if(sum < 6){
            this.setData({
                height:140
            })
        }else if(sum < 11){
            this.setData({
                height:280
            })
        }else {
            this.setData({
                height:420
            })
        }
    },
    fenshuqihuan:function (x) {
        var n = x.toString();
        return n[1]?n:n+'.0'
    },
    onShowClick:function (e) {
        this.data.show.forEach((item)=>{
          item.flag = false
        })
        var nth = e.currentTarget.dataset.index;
        this.data.show[nth].flag = true
        this.setData({
            show:this.data.show
        })
    },
    close0:function () {
        this.data.show[0].zhu = false
        this.setData({
            show:this.data.show
        })
    },
    close1:function () {
        this.data.show[1].zhu = false
        this.setData({
            show:this.data.show
        })
    },
    close2:function () {
        this.data.show[2].zhu = false
        this.setData({
            show:this.data.show
        })
    },
    open0:function () {
        this.data.show[0].zhu = true
        this.setData({
            show:this.data.show
        })
    },
    open1:function () {
        this.data.show[1].zhu = true
        this.setData({
            show:this.data.show
        })
    },
    open2:function () {
        this.data.show[2].zhu = true
        this.setData({
            show:this.data.show
        })
    },
    choose_manager:function (e) {
        var nth = e.currentTarget.dataset.index;
        var employee_id=this.data.manager_list[nth].employee_id
       console.log(employee_id)
        wx.navigateTo({
            url: `../waiter_details/waiter_details?index=${nth}&curchoose=${this.data.cur_choose_manager}&employee_id=${employee_id}`
        })

        // this.data.manager_list[nth].curchoose = true
        // this.setData({
        //     manager_list:this.data.manager_list
        // })
    },
    into_waiter_details:function () {
        wx.navigateTo({
            url: `../business_details/business_details?merchant_id=${this.data.merchant_id}`
        })
    },
    into_selectDate:function () {
          wx.navigateTo({
              url: `../selectDate/selectDate?merchant_id=${this.data.merchant_id}`
          })

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
                                wx.showLoading({
                                    title: '正在登陆',
                                    mask:true
                                })
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
    into_confirm_order:function (e) {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        // this.setData({
        //     type: e.currentTarget.dataset.type,
        //     item:JSON.stringify(e.currentTarget.dataset.item)
        // })
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
                            //     content: '需要您绑定手机号并验证',
                            //     showCancel:false,
                            //     confirmText:'去绑定',
                            //     success: (res) =>{
                            //         if (res.confirm) {
                            //             console.log('用户点击确定')
                            //             wx.navigateTo({
                            //                 url: `../bind_phone/bind_phone`
                            //             })
                            //         }
                            //     }
                            // })
                            this.modal({
                                content:"需要您绑定手机号并验证",
                                confirmText:'去绑定',
                                showCancel:false,
                                confirm:()=>{
                                    wx.navigateTo({
                                        url: `../bind_phone/bind_phone`
                                    })
                                }
                            })

                        }else {
                            var member = storage()
                            var type = e.currentTarget.dataset.type;
                            var item = JSON.stringify(e.currentTarget.dataset.item);
                            if(type == 2){
                                //判断之前订过这个卡套餐没
                                http(`${baseUrl}/v1/goods/checkStock`,{date:this.data.date1,token:member.token,merchant_id:this.data.merchant_id,member_id:member.member_id,type:2,sign:str_md5,timestamp:timestamp},(res)=>{
                                    console.log(res)
                                    if(res.code == 200){
                                        wx.hideLoading()
                                        wx.navigateTo({
                                            url: `../confirm_order/confirm_order?type=${type}&merchant_id=${this.data.merchant_id}&item=${item}&order_no=${res.data.order_no}&date=${this.data.date1}&begin_time=${this.data.begin_time}`
                                        })
                                    }else {
                                        wx.hideLoading()
                                        this.show({
                                            content:res.msg,
                                            // duration:3000
                                        });
                                    }
                                })
                            }else {
                                //判断之前订过这个优惠套餐没
                                http(`${baseUrl}/v1/goods/checkStock`,{date:this.data.date,token:member.token,merchant_id:this.data.merchant_id,member_id:member.member_id,type:1,sign:str_md5,timestamp:timestamp},(res)=>{
                                    console.log(res)
                                    if(res.code == 200){
                                        wx.hideLoading()
                                        wx.navigateTo({
                                            url: `../confirm_order/confirm_order?type=${type}&merchant_id=${this.data.merchant_id}&item=${item}&order_no=${res.data.order_no}&date=${this.data.date}&begin_time=${this.data.begin_time}`
                                        })
                                    }else {
                                        wx.hideLoading()
                                        this.show({
                                            content:res.msg,
                                            // duration:3000
                                        });
                                    }
                                })
                            }
                        }
                    })

                }
            })
        }else {
            this.login()
        }

    },

    // 日期年月日格式化
    getDateString: function(date) {
        var tempArr = [date.getFullYear(),this.formatNumber(date.getMonth() + 1) ,this.formatNumber(date.getDate())];
        return tempArr.join("-");
    },
    // 日期时分格式化
    getDateTimeString: function(date) {
        var tempArr = [this.formatNumber(date.getHours()),this.formatNumber(date.getMinutes())];
        return tempArr.join(":");
    },
    // 日期一位数前面补0
    formatNumber:function(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    },

    bindDateChange: function(e) {
      console.log('打开时期')
      var type = parseInt(e.currentTarget.dataset.type)
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        if(type == 1){
            this.setData({
                date: e.detail.value
            })
        }else {
            this.setData({
                date1: e.detail.value
            })
        }
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        // 优惠套餐和卡套列表
        http(`${baseUrl}/v1/goods/packList`,{date:e.detail.value,client: 'xcx',merchant_id:this.data.merchant_id,type:type,sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
            if(res.code == 200){
                wx.hideLoading()
                if(type == 1){
                    this.setData({
                        favourable_list:res.data.list
                    })
                }else{
                    this.setData({
                        cassette_list:res.data.list
                    })
                }
           }else {
                wx.hideLoading()
                this.show({
                    content:res.msg,
                    // duration:3000
                });
            }


        })
    },
    select:function () {
        if(this.data.is_offer == 1){
            if(this.data.choose_id != ""){
                wx.showLoading({
                    title: '加载中',
                    mask:true
                })
                wx.setStorageSync('employee_id', this.data.choose_id)
                wx.navigateTo({
                    url: `../select_card/select_card?date=${this.data.date2}&merchant_id=${this.data.merchant_id}`
                })
                setTimeout(()=>{
                    wx.hideLoading()
                },500)
            }else {
                wx.hideLoading()
                this.show({
                    content:'需要您先选择一位客户经理为您服务',
                    // duration:3000
                });
            }
        }else {
            wx.showLoading({
                title: '加载中',
                mask:true
            })
            wx.navigateTo({
                url: `../select_card/select_card?date=${this.data.date2}&merchant_id=${this.data.merchant_id}`
            })
            setTimeout(()=>{
                wx.hideLoading()
            },500)

        }

    }


})