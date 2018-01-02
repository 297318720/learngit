var olddate
var total_micro_second
var nowdate
var Timeout
var util = require('../../../utils/util.js');
var http = util.http
var storage = util.storage
var md5 = util.hexMD5;
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
var http_paymentResult;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      countdown_min:"",  //倒计时的分钟数
      flag:1, //1确认订单页面，2支付方式,
      disabled:false, //支付页面的支付按钮
      disabled1:false, //确认订单页面的提交订单按钮
      submit:true,  //提交订单，true能提交，false不能提交
 // 卡座特有的数据
          // 订座信息
          message:{
              // merchant_id: 1,
              // title: "中雅",
              // max_people: 8,
              // floor_price: 2000,
              // set_price: 398,
              // seat_number: 4,
              // floor: 1,
              // status : 1,
          },
         value:"" , //备注信息
         employee_id:"",  //员工ID
         number_of_people:null, //到店人数
         avatar:"",   //服务员头像，通过HTTP请求拿
         is_offer:null,  //是否显示客户经理,0不显示，1显示


// 套餐特有的数据
        delayed:"", //卡套的能逾期的时间
         goodspack:{
             // id: 1,
             // image: "/goods/20170803/jdsf83jidfs8934njd9.jpg",
             // title: "吴系挂",
             // price: 2.00 ,
             // description: "套餐的类型优惠套餐还是卡座套餐",
             // type : 1,
             // stock:20,
             // type:1
         },

 // 所有状态都有的数据
    begin_time:null,  //到店日期时间戳
      begin_time_date:"",//下单的日期年月日
      begin_time_time:"", //到店日期时分
      // 联系人信息
      contact:{
          // realname:"",
          // sex:0,
          // tel:"",
      },
         merchant_id:"",
         date:"",   // //到店的日期年月日
         title:"维纳斯酒吧",  //通过HTTP请求拿
         discount_money:0, //优惠的钱
         total:"",  //总价
         order_type:null , //当前页面是1卡座 2卡套 3散套



      // 支付页面数据
      order_no:'',
      payment_mode: 1,//默认支付方式 余额支付支付
      isFocus: false,//控制input 聚焦
      balance:null,//余额
      pay_price:null,//待支付
      wallets_password_flag:false,//密码输入遮罩
      wallets_password:"",  //输入的余额密码
      inputvalue:"",  //输入Input的值

      clock:"",  //倒计时的时间

      status:'', //1是从订单的去支付跳转到支付页面，2是从续酒跳转到支付页面
      order_id:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

      var app = getApp();
      // toast组件实例
      new app.ToastPannel();
      new app.ShowModalPannel();

      wx.setNavigationBarTitle({
          title:"确认订单"
      });

      this.setData({
          merchant_id:options.merchant_id,
          order_no:options.order_no,
          begin_time:parseInt(options.begin_time)

      })
      this.format_begin_time()

      var member = storage()
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      // 获取用户的余额
      http(`${baseUrl}/v1/member/capital`,{token:member.token,member_id:member.member_id,client: 'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
          console.log(res)
          if(res.code == 200){
              this.setData({
                  balance:res.data.money
              })
          }
      })

     // 点去支付转到的该支付页面的逻辑
      if(options.status != undefined){
          console.log(options.pay_price)
          this.setData({
              status:options.status
          })
          if(options.status == 1){
              this.setData({
                  flag:2,
                  pay_price:this.returnFloat(options.pay_price),
                  date:options.date,
                  begin_time_time:options.begin_time_time,
              })
          }else {
              this.setData({
                  flag:2,
                  pay_price:this.returnFloat(options.pay_price),
                  order_id:options.order_id
              })
          }

          // 拿当前时间戳
          http(`${baseUrl}/v1/merchant/serverTime`,{client: 'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
              console.log(res)
               this.setData({
                   countdown_min:res.data.order_overtime/60
               })
              // 初始化倒计时
              olddate = res.data.now_time
              total_micro_second = res.data.order_overtime;
              nowdate = total_micro_second - Math.floor(olddate - options.created_time)
              this.count_down()
          })
      }
      // 点提交订单进入此支付页面的逻辑
     if (options.type != undefined){
         if(options.type ==1){
             var data =JSON.parse( options.data)
             data.contact.sex = parseInt(data.contact.sex)
             this.setData({
                 date:data.date,
                 message:data.message,
                 contact:data.contact,
                 value:data.value,
                 number_of_people:data.number_of_people,
                 order_type:options.type,
                 total:data.message.set_price,
                 pay_price:this.returnFloat(data.pay_price),
                 discount_money:data.discount_money,

             })
             //获取客户经理头像
             this.get_avatar()
         }else {
             console.log(options.date)
             this.setData({
                 date:options.date,
                 order_type:options.type,
                 total:JSON.parse(options.item).price,
                 goodspack:JSON.parse(options.item)
             })
             this.setData({
                 pay_price:this.returnFloat(this.data.goodspack.price - this.data.discount_money)
             })
             this.do_santao()
         }
     }

     // 如果是卡套的确认订单页面，调取用户能逾期的天数
      if(options.type == 2){
          http(`${baseUrl}/v1/member/vipInfo`,{token:member.token,member_id:member.member_id,client: 'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
              if(res.code == 200){
                  this.setData({
                      delayed:res.data.delayed
                  })
              }
          })
      }




  },
     // 给数字精确到小数后两位
     returnFloat:function(value){
        var value = Math.round(parseFloat(value)*100)/100;
        var xsd=value.toString().split(".");
        if(xsd.length==1){
            value=value.toString()+".00";
            return value;
        }
        if(xsd.length>1){
            if(xsd[1].length<2){
                value=value.toString()+"0";
            }
            return value;
        }
    },
    // 格式化年月日时分
    format_begin_time:function () {

        this.setData({
            begin_time_date:this.getDateString(new Date(this.data.begin_time)),
            begin_time_time:this.getDateTimeString(new Date(this.data.begin_time))
        })
        console.log(this.data.begin_time_date)
        console.log(this.data.begin_time_time)
    },
    //获取客户经理头像
    get_avatar:function () {
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/Employee/employeeList`,{client: 'xcx',merchant_id:this.data.merchant_id,type:4,sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
            if(res.code == 200){
                this.setData({
                    is_offer:res.data.is_offer
                })
                if(res.data.is_offer == 1){
                    this.setData({
                        employee_id:parseInt(wx.getStorageSync('employee_id')),
                    })
                    http(`${baseUrl}/v1/Employee/employeeInfo`,{client: 'xcx',employee_id:this.data.employee_id,sign:str_md5,timestamp:timestamp},(res)=>{
                        console.log(res)
                        this.setData({
                            avatar:res.data.avatar
                        })
                    })
                }
            }

        })

    },
    // 处理散套信息
    do_santao:function () {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        // 获取默认联系人
        http(`${baseUrl}/v1/contacts/contactsList`, {client: 'xcx',member_id:member.member_id,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            res.data.list.forEach((item)=>{
                if(item.is_default == 1){
                    this.setData({
                        contact:item
                    })
                }
            })
        })


    },
    // 判断是否为空对象
    isEmptyObject:function (obj) {
        for(var key in obj){
            return false
        };
        return true
    },
    into_contacts_message:function () {
        wx.navigateTo({
            url: '../contacts_message/contacts_message'
        })
    },
    into_payment:function () {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
      if(this.data.order_type != 1){
          if(this.isEmptyObject(this.data.contact)){
              wx.hideLoading()
              this.show({
                  content:'请选择联系人',
                  // duration:3000
              });
              return
          }
          this.setData({
              disabled1:true,
          })
          //判断之前订过这个优惠套餐或者卡套没
          http(`${baseUrl}/v1/goods/checkStock`,{date:this.data.date,token:member.token,merchant_id:this.data.merchant_id,member_id:member.member_id,type:this.data.order_type == 3?1:2,sign:str_md5,timestamp:timestamp},(res)=>{
              console.log(res)
              if(res.code == 200){
                      // 弹出提示框
                  wx.hideLoading()
                  if(this.data.order_type == 3){  //散套
                      // wx.showModal({
                      //     confirmText:"确认提交",
                      //     title: '重要说明',
                      //     content: "1、本套餐必须在"+this.data.date+" "+this.data.begin_time_time+"到店消费，逾期作废将不退还费用\r\n2、套餐内包含指定酒水和一张小圆桌。",
                      //     success: (res)=> {
                      //         if (res.confirm) {
                      //             this.http_buyPackGoods()
                      //         } else if (res.cancel) {
                      //             console.log('用户点击取消')
                      //         }
                      //     }
                      // })
                      this.modal({
                          title: '重要说明',
                          confirmText:"确认提交",
                          content:"1、本套餐必须在"+this.data.date+" "+this.data.begin_time_time+"到店消费，逾期作废将不退还费用\r\n2、套餐内包含指定酒水和一张小圆桌。",
                          confirm:()=>{
                              this.http_buyPackGoods()
                          }
                      })
                  }else {  //卡套
                      http(`${baseUrl}/v1/merchant/closeTime`, {merchant_id:this.data.merchant_id,client: 'xcx',sign:str_md5,timestamp:timestamp}, (res) => {
                          console.log(res)
                          if(res.code == 200){
                              // wx.showModal({
                              //     confirmText:"确认提交",
                              //     title: '重要说明',
                              //     content: res.data.tips_msg,
                              //     success: (res)=> {
                              //         if (res.confirm) {
                              //             this.http_buyPackGoods()
                              //         } else if (res.cancel) {
                              //             console.log('用户点击取消')
                              //         }
                              //     }
                              // })
                              this.modal({
                                  title: '重要说明',
                                  confirmText:"确认提交",
                                  content:res.data.tips_msg,
                                  confirm:()=>{
                                      this.http_buyPackGoods()
                                  }
                              })
                          }
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
          // 提交卡座订单
      }else {
          wx.showLoading({
              title: '加载中',
              mask:true
          })
          this.setData({
              disabled1:true,
          })
          wx.hideLoading()
          // wx.showModal({
          //     confirmText:"确认提交",
          //     title: '重要说明',
          //     content: "1、本套餐必须在"+this.data.date+" "+this.data.begin_time_time+"到店消费，逾期作废将不退还费用\r\n2、您可在消费前联系酒吧或者客户经理做进一步的沟通。",
          //     success: (res)=> {
          //         if (res.confirm) {
          //             this.http_buySeatGoods()
          //         } else if (res.cancel) {
          //             console.log('用户点击取消')
          //         }
          //     }
          // })
          this.modal({
              title: '重要说明',
              confirmText:"确认提交",
              content:"1、本套餐必须在"+this.data.date+" "+this.data.begin_time_time+"到店消费，逾期作废将不退还费用\r\n2、您可在消费前联系酒吧或者客户经理做进一步的沟通。",
              confirm:()=>{
                  this.http_buySeatGoods()
              }
          })
      }
    },
    // 提交卡套或者优惠套餐订单
    http_buyPackGoods:function () {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/order/buyPackGoods`,
            {
                uid:member.uid,
                token:member.token,
                sign:str_md5,
                timestamp:timestamp,
                client: 'xcx',
                merchant_id:this.data.merchant_id,
                member_id:member.member_id,
                contacts_realname:this.data.contact.realname,
                contacts_tel:this.data.contact.tel,
                contacts_sex:this.data.contact.sex,
                total_price:this.data.goodspack.price,
                pay_price:this.data.goodspack.price - this.data.discount_money,
                discount_money:this.data.discount_money,
                order_type:this.data.order_type,
                description:"",
                arrives_time:this.data.date,
                goods_pack_id:this.data.goodspack.id
            }, (res) => {
                console.log(res)
                if(res.code == 200){
                    wx.hideLoading()
                    this.setData({
                        order_no:res.data.order_no
                    })
                    this.setData({
                        flag:2
                    })
                    if(this.data.balance < this.data.pay_price){
                        this.setData({
                            payment_mode: 2
                        })
                    }

                    // 初始化倒计时
                    http(`${baseUrl}/v1/merchant/serverTime`,{client:'xcx',sign:str_md5,timestamp:timestamp},(res1)=>{
                        olddate = res.data.now_time
                        total_micro_second = res1.data.order_overtime;
                        this.setData({
                            countdown_min: res1.data.order_overtime/60
                        })
                        nowdate = total_micro_second - Math.floor(olddate - res.data.created_time)
                        this.count_down()
                    })


                    wx.setNavigationBarTitle({
                        title:"支付方式"
                    });
                }else {
                    wx.hideLoading()
                    this.show({
                        content:res.msg,
                        // duration:3000
                    });
                }
            })


    },
// 提交卡座订单
    http_buySeatGoods:function () {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/order/buySeatGoods`,
            {
                uid:member.uid,
                token:member.token,
                sign:str_md5,
                timestamp:timestamp,
                client: 'xcx',
                merchant_id:this.data.merchant_id,
                member_id:member.member_id,
                contacts_realname:this.data.contact.realname,
                contacts_tel:this.data.contact.tel,
                contacts_sex:this.data.contact.sex,
                total_price:this.data.message.set_price,
                pay_price:this.data.pay_price,
                discount_money:this.data.discount_money,
                order_type:this.data.order_type,
                description:this.data.value,
                arrives_time:this.data.date,
                goods_seat_id:this.data.message.seat_id,
                employee_id:this.data.employee_id,
                total_people:this.data.number_of_people
            }, (res) => {
                console.log(res)
                if(res.code == 200){
                    wx.hideLoading()
                    this.setData({
                        order_no:res.data.order_no
                    })
                    this.setData({
                        flag:2
                    })
                    if(this.data.balance < this.data.pay_price){
                        this.setData({
                            payment_mode: 2
                        })
                    }
                    // 初始化倒计时
                    http(`${baseUrl}/v1/merchant/serverTime`,{client:'xcx',sign:str_md5,timestamp:timestamp},(res1)=>{
                        olddate = res.data.now_time
                        total_micro_second = res1.data.order_overtime;
                        this.setData({
                            countdown_min: res1.data.order_overtime/60
                        })
                        nowdate = total_micro_second - Math.floor(olddate - res.data.created_time)
                        this.count_down()
                    })
                    // // 初始化倒计时
                    // olddate = res.data.now_time
                    // total_micro_second = 30 * 60;
                    // nowdate = total_micro_second - Math.floor(olddate - res.data.created_time)
                    // this.count_down()
                    wx.setNavigationBarTitle({
                        title:"支付方式"
                    });
                }else {
                    wx.hideLoading()
                    this.show({
                        content:res.msg,
                        // duration:3000
                    });
                }
            })


    },
     update_password_success_toast:function(){
         wx.hideLoading()
         this.show({
             content:'密码修改成功',
             // duration:3000
         });
     },


 // 支付方式的逻辑
    wx_pay() {//转换为微信支付
        this.setData({
            payment_mode: 2
        })
    },
    wallet_pay() {
        this.setData({//转换为钱包支付
            payment_mode: 1
        })
    },
    pay:function () {
        var member = storage()
        console.log(member)
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5

        if(this.data.payment_mode == 1){
            if(this.data.balance < this.data.pay_price){
                wx.hideLoading()
                this.show({
                    content:'您的空瓶子账户可用余额不足',
                    // duration:3000
                });
                this.setData({
                    payment_mode:2
                })
            }else {
                // 是否设置支付密码
                http(`${baseUrl}/v1/member/capital`, {token: member.token, client: 'xcx',member_id:member.member_id,sign:str_md5,timestamp:timestamp}, (res) => {
                    console.log(res)
                    if(res.code == 200){
                        if(res.data.is_password == 0){
                            // wx.showModal({
                            //     title: '需要您设置支付密码',
                            //     confirmText:'去设置',
                            //     success: (res) =>{
                            //         if (res.confirm) {
                            //             wx.navigateTo({
                            //                 url: '../../mine/setpassword/setpassword?type=1'
                            //             })
                            //         }
                            //     }
                            // })
                            this.modal({
                                content:"需要您设置支付密码",
                                confirmText:'去设置',
                                confirm:()=>{
                                    wx.navigateTo({
                                        url: '../../mine/setpassword/setpassword?type=1'
                                    })
                                }
                            })
                       }else {
                            this.setData({
                                wallets_password_flag:true,
                                isFocus: true
                            })
                     }
                    }

                })



            }
            // 微信支付
        }else {
            if(this.data.pay_price == 0){
                wx.hideLoading()
                this.show({
                    content:'支付金额为0元时请用空瓶子余额支付',
                    // duration:3000
                });
                this.setData({
                    payment_mode:1
                })
                return
            }

            wx.showLoading({
                title: '加载中',
                mask:true
            })

            http(`${baseUrl}/v1/order/payment`,{
                uid:member.uid,
                token:member.token,
                client: 'xcx',
                order_no:this.data.order_no,
                member_id:member.member_id,
                pay_money:this.data.pay_price,
                payment:2,
                openid:member.xcx_openid,
                sign:str_md5,
                timestamp:timestamp,
                pay_type:1
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
                           // 订单是否已完成支付状态确定
                           clearInterval(http_paymentResult); // 防止多次点击开启多个定时器.
                           this.paymentResult();
                           http_paymentResult = setInterval(()=>{
                               this.paymentResult()
                           },3000)

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
    },
    paymentResult:function () {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/order/paymentResult`, {order_no:this.data.order_no,client: 'xcx',token:member.token,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            if(res.code == 200){
                if(res.data.pay_status == 1){
                    console.log('订单状态已改变')
                    clearInterval(http_paymentResult)
                    if(this.data.status == 2){ // 如果是续酒，则跳到续酒详情
                        wx.redirectTo({
                            url: `../../order/order_details/order_details?order_no=${this.data.order_no}`
                        })
                    }else {  //你是续酒跳到订单详情
                        wx.redirectTo({
                            url: `../../wine/wine_details/wine_details?order_id=${this.data.order_id}`
                        })
                    }

                }
            }
        })
    },
    set_Focus() {//聚焦input
        this.setData({
            isFocus: true
        })
    },
    set_wallets_password(e) {//获取钱包密码
        this.setData({
            wallets_password: e.detail.value
        });
        if (this.data.wallets_password.length == 6) {//密码长度6位时，自动验证钱包支付结果
            // 发送HTTP支付
            // 如果支持成功
            this.setData({
                wallets_password_flag:false,
                isFocus: false,
            })
            wx.showLoading({
                title: '余额支付中',
            })
            var member = storage()
            var MD5 = md5()
            var timestamp = MD5.timestamp
            var str_md5 = MD5.str_md5
            http(`${baseUrl}/v1/member/verifyPayPassword`, {token: member.token, client: 'xcx',member_id:member.member_id,password:this.data.wallets_password,sign:str_md5,timestamp:timestamp}, (res) => {
                console.log(res)
                this.setData({
                    wallets_password:"",
                    inputvalue:""
                })
                if(res.code == 200){
                    if(res.data.is_success == 1){
                         // 密码输入正确后请求服务器提交支付
                        http(`${baseUrl}/v1/order/payment`,{
                            uid:member.uid,
                            token:member.token,
                            client: 'xcx',
                            order_no:this.data.order_no,
                            member_id:member.member_id,
                            pay_money:this.data.pay_price,
                            payment:1,
                            openid:member.xcx_openid,
                            sign:str_md5,
                            timestamp:timestamp,
                            pay_type:1
                        },(res)=>{
                            if(res.code == 200){
                                wx.hideLoading()
                                wx.redirectTo({
                                    url: `../../payment/pay_success/pay_success?pay_price=${this.data.pay_price}&date=${this.data.date} ${this.data.begin_time_time}&status=${this.data.status}`
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
                        // wx.showModal({
                        //     title: '支付密码错误，请重试',
                        //     confirmText:'重试',
                        //     cancelText:"忘记密码",
                        //     success: (res) =>{
                        //         wx.hideLoading()
                        //         if (res.confirm) {
                        //             wx.hideLoading()
                        //             this.setData({
                        //                 wallets_password_flag:true,
                        //                 isFocus: true
                        //             })
                        //         } else if (res.cancel) {
                        //             wx.hideLoading()
                        //             wx.navigateTo({
                        //                 url: '../../mine/update_password/update_password?type=1'
                        //             })
                        //         }
                        //     }
                        // })
                        this.modal({
                            cancelText:"忘记密码",
                            content:"支付密码错误，请重试",
                            confirmText:'重试',
                            confirm:()=>{
                                wx.hideLoading()
                                this.setData({
                                    wallets_password_flag:true,
                                    isFocus: true
                                })
                            },
                            cancel:()=>{
                                wx.hideLoading()
                                wx.navigateTo({
                                    url: '../../mine/update_password/update_password?type=1'
                                })
                            },
                        })
                    }
                }
            })

            // if(this.data.wallets_password == "826358"){
            //     setTimeout(()=>{
            //         wx.hideLoading()
            //         this.setData({
            //             wallets_password:"",
            //             inputvalue:"",
            //             wallets_password_flag:false,
            //             isFocus: false
            //         })
            //         wx.redirectTo({
            //             url: `../../payment/pay_success/pay_success`
            //         })
            //     },1500)
            // }else {
            //     setTimeout(()=>{
            //         wx.hideLoading()
            //         this.setData({
            //             wallets_password:"",
            //             inputvalue:"",
            //         })
            //         wx.showModal({
            //             title: '支付密码错误，请重试',
            //             confirmText:'重试',
            //             cancelText:"忘记密码",
            //             success: (res) =>{
            //                 if (res.confirm) {
            //                     this.setData({
            //                         wallets_password_flag:true,
            //                         isFocus: true
            //                     })
            //                 } else if (res.cancel) {
            //                     wx.navigateTo({
            //                         url: '../../mine/update_password/update_password?type=1'
            //                     })
            //                 }
            //             }
            //         })
            //     },1500)
            //
            // }

        }
    },
    close_wallets_password () {//关闭钱包输入密码遮罩
        this.setData({
            isFocus: false,//失去焦点
            wallets_password_flag: false,
        })
        // wx.showModal({
        //     title: '您已取消支付',
        //     showCancel:false,
        //     success: (res) =>{
        //         if (res.confirm) {
        //             wx.redirectTo({
        //                 url: `../../order/order_details/order_details?order_no=${this.data.order_no}`
        //             })
        //         }
        //     }
        // })
        this.modal({
            content:"您已取消支付",
            confirmText:"确定",
            showCancel:false,
            confirm:()=>{
                wx.redirectTo({
                    url: `../../order/order_details/order_details?order_no=${this.data.order_no}`
                })
            },
        })
    },
    onUnload:function(){
        clearTimeout(Timeout)
    },
    // onHide:function () {
    //     clearTimeout(Timeout)
    // },
    // onShow:function () {
    //     olddate = 1504857664338
    //     total_micro_second = 30 * 60;
    //     nowdate = total_micro_second - Math.floor((new Date().getTime() - olddate)/1000)
    //     this.count_down()
    // },
    /* 毫秒级倒计时 */
    count_down:function(){
        // 渲染倒计时时钟
        this.setData({
            clock: this.date_format(nowdate)
        });

        if (nowdate<= 0) {
            this.setData({
                clock: "已经截止",
                disabled:true
            });

            // timeout则跳出递归
            return;
        }
        Timeout = setTimeout( ()=> {
            // 放在最后--
            nowdate -= 1;
            this.count_down();
        }, 1000)

    },
    // 时间格式化输出，如03:25:19 86。每10ms都会调用一次
    date_format:function(nowdate) {
        // 秒数
        // var second = Math.floor(micro_second / 1000);
        // 小时位
        // var hr = Math.floor(second / 3600);
        // 分钟位
        var min = this.fill_zero_prefix(Math.floor(nowdate / 60));
        // 秒位
        var sec = this.fill_zero_prefix(nowdate - min * 60 );// equal to => var sec = second % 60;
        // 毫秒位，保留2位
        // var micro_sec = fill_zero_prefix(Math.floor((micro_second % 1000) / 10));

        return  min + ":" + sec ;
    },
    // 位数不足补零
    fill_zero_prefix:function(num) {
        return num < 10 ? "0" + num : num
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
})