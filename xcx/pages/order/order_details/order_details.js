var olddate
var total_micro_second
var nowdate
var Timeout
var util = require('../../../utils/util.js');
var http = util.http
var md5 = util.hexMD5;
var storage = util.storage
var error_bomb = util.error_bomb
var formatNumber = util.formatNumber
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
var attachmentUrl = globalData.attachmentUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
      disabled:false,
      //当前总数据
      cur_message:{
          // order_no:"201708032564157268625",
          // merchant_title:"维纳斯酒吧",
          // merchant_id:1,
          // logo:"/assets/order_image/order_arrow@2x.png",
          // total_price: 2000.00,
          // arrives_time: "2017-09-06"
          // format_time: "2017-08-03 12:00:00",
          // created_time: 1532644645,  //秒
          // status:0,
          // order_type:2
      },
      index:"",    //当前订单详情对应的订单列表的index
      status_message_title:""  ,  //显示在页面订单状态的文字title
      title_color:"f5912c",   //订单状态title文字颜色
      status_message:"",     //订单状态的文字描述


      // 卡座信息数据
      card_data: {
          // order_no        : "订单编号",
          // title           : "大雅",
          // merchant_id     : "1",
          // merchant_title  : "酒吧名称",
          // seat_number     : "2",
          // max_people      : "8",
          // floor_price     : "1200",
          // set_price       : "298",
          // employee_id     : "25",
          // avatar          : "/assets/forthemoment/order_yuan@2x.png",
          // arrives_time    : "2017-08-03 15:00:00",
          // total_people    : "7",
          // note            : "请帮我们准备几个小凳子",
          // total_price     : "2100",
          // // 逾期卡套信息，没有的就就无以下字段
          // overdue_order: {
          //     order_no: "1170830172821772558031",
          //     pack_title: "2-4人进口洋酒套餐",
          //     pack_image: "/assets/forthemoment/order_labelling.png",
          //     pack_price: 300
          // },
      },
      // 卡套或者优惠套餐数据
      packages:{
          // goods_pack_id   : "12",
          // title           : "18782909930",
          // logo            : "images/20160921/tooopen_sy_179583447187.jpg",
          // image           : "/assets/forthemoment/order_labelling.png",
          // goods_pack_title: "优惠套餐",
          // describe:        "2-4人进口洋酒套餐",
          // price          : "300",
          // total_price     : "2100",
},
      // 订单基本信息（包括客人信息和订单信息）
       order_message:{
           // order_no: "订单号",
           // created_time : "2017-08-03 14:00:00",
           // payment      : "微信支付",
           // contacts_realname     : "李浩",
           // contacts_sex          : 1,
           // contacts_tel  : "18782909930",
           // arrives_time : "2017-08-03 14:00:00"
       }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log(new Date().getTime())
      var app = getApp();
      // toast/showModal组件实例
      new app.ToastPannel();
      new app.ShowModalPannel();
      new app.LoadingPannel();
      wx.setNavigationBarTitle({
          title:"订单详情"
      });
      this.data.cur_message.order_no = options.order_no
      var member = storage()
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5

      //主动修改未支付订单状态
      http(`${baseUrl}/v1/order/updateSingleStatus`,{order_no:this.data.cur_message.order_no,client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
          console.log(res)
      })

         //订单详情
          http(`${baseUrl}/v1/Order/orderDetail`,{client: 'xcx',token:member.token,order_no:this.data.cur_message.order_no,sign:str_md5,timestamp:timestamp},(res)=>{
              console.log(res)
             this.card_data(res)  //卡座数据处理
              //显示在页面订单状态的信息文字
              this.status_message_title()

              //处理数据
              if(this.data.cur_message.order_type == 1){
                  this.do_card_data()
              }
              if(res.data.status == 1){
                    // 初次渲染倒计时
                  http(`${baseUrl}/v1/merchant/serverTime`,{client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
                      console.log(res)
                      olddate = parseInt(this.data.cur_message.created_time)
                      total_micro_second = res.data.order_overtime;

                      nowdate = total_micro_second - Math.floor(res.data.now_time - olddate)
                      this.count_down()
                  })
              }

          })

      if(options.index){
          this.setData({
              index:options.index
          })
      }
  },
    into_bar_details:function () {
        wx.redirectTo({
            url: `../../index/bar_details/bar_details?type=1&merchant_id=${this.data.cur_message.merchant_id}`
        })
    },
    into_business_details:function () {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        wx.navigateTo({
            url: `../../index/business_details/business_details?merchant_id=${this.data.cur_message.merchant_id}`
        })
    },
    // 处理卡座或套餐的数据
    card_data:function (res) {
        if(res.code == 200) {
            var card = {}
            card.created_time = res.data.created_time
            switch (res.data.payment){
                case 1:
                    card.payment = '余额支付';
                    break;
                case 2:
                    card.payment = '微信支付';
                    break;
                case 3:
                    card.payment = '支付宝支付';
                    break;
                case 4:
                    card.payment = '银联支付';
                    break;
                case 0:
                    card.payment = '未支付';
                    break;
            }
            card.contacts_realname = res.data.contacts_realname
            card.contacts_sex = res.data.contacts_sex
            card.contacts_tel = res.data.contacts_tel
            card.arrives_time = res.data.arrives_time
            card.order_no = res.data.order_no
            card.format_time = res.data.format_time
            card.begin_time = res.data.begin_time
            this.data.cur_message.merchant_title = res.data.merchant_title
            this.data.cur_message.merchant_id = res.data.merchant_id
            this.data.cur_message.arrives_time = res.data.arrives_time
            this.data.cur_message.begin_time = res.data.begin_time
            this.data.cur_message.created_time = res.data.created_time
            this.data.cur_message.format_time = res.data.format_time
            this.data.cur_message.logo = res.data.logo
            this.data.cur_message.total_price = res.data.total_price
            this.data.cur_message.pay_price = res.data.pay_price
            this.data.cur_message.status = res.data.status
            this.data.cur_message.order_type = res.data.order_type
            this.data.cur_message.incr_time = res.data.incr_time
            this.data.cur_message.is_comment = res.data.is_comment
            this.data.cur_message.merchant_tel = res.data.merchant_tel
            this.data.cur_message.order_qrcode = res.data.order_qrcode
            this.data.cur_message.cancel_reason = res.data.cancel_reason
            this.setData(this.data)
        }
        if(this.data.cur_message.order_type == 1){
            this.setData({
                order_message:card,
                card_data:res.data
            })
        }else {
            this.setData({
                order_message:card,
                packages:res.data
            })
        }








    },
    //显示在页面订单状态的信息文字
    status_message_title:function () {
        switch(this.data.cur_message.status) {
            case 0: //已取消
                this.setData({
                    status_message_title: "订单已取消",
                    status_message: "很遗憾！您的订单超时未完成支付，系统已为您自动取消。",
                    title_color: "c5c5c5"
                })
                break;
            case 1: //未支付
                this.setData({
                    status_message_title: "等待支付",
                    // status_message: `请您于${this.data.countdown_min}分钟内完成支付，超时订单将自动取消。`,
                    title_color: "f5912c"
                })
                // 获取倒计时分钟
                var member = storage()
                var MD5 = md5()
                var timestamp = MD5.timestamp
                var str_md5 = MD5.str_md5
                http(`${baseUrl}/v1/merchant/serverTime`,{client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
                    this.setData({
                        status_message: `请您于${res.data.order_overtime/60}分钟内完成支付，超时订单将自动取消。`,
                    })
                })
                break;
            case 2: //待接单(已支付)
                // if(this.data.cur_message.incr_time == 0){
                this.setData({
                    status_message_title: "订单已支付，等待商家接单",
                    title_color: "f5912c"
                })
                switch (this.data.cur_message.order_type) {
                    case 1:
                        this.setData({
                            status_message: "卡座预定支付成功！请等待商家确认。"
                        })
                        break;
                    case 2:
                        this.setData({
                            status_message: "卡座套餐支付成功！请等待商家确认。"
                        })
                        break;
                    case 3:
                        this.setData({
                            status_message: "优惠套餐支付成功！请等待商家确认。"
                        })
                        break;
                }
                // }
                // else {
                //     this.setData({
                //         status_message_title:"订单延时",
                //         title_color:"dc5946"
                //     })
                //     this.setData({
                //         status_message:`已为您预定的卡座延时${this.data.cur_message.incr_time}分钟，请您在${this.data.cur_message.incr_time}分钟内到店消费，过时订单自动作废并不退还套餐费用。`
                //     })
                //
                // }

                break;
            case 3: //已逾期
                this.setData({
                    status_message_title: "订单逾期",
                    status_message: `您购买的卡座套餐已经逾期，系统将为您保留该套餐${this.data.packages.overdue_day}日，您须再次预定卡座到店消费；若超过${this.data.packages.overdue_day}日未到店消费，该套餐将自动作废并不退还套餐费用。`,
                    title_color: "c5c5c5"
                })
                break;
            case 4: //完成
                this.setData({
                    status_message_title: "订单已完成",
                    status_message: "您的订单已完成，期待再次为您服务。",
                    title_color: "g46d680"
                })
                break;
            case 5: //已作废
                this.setData({
                    status_message_title: "订单作废",
                    title_color: "c5c5c5"
                })
                switch (this.data.cur_message.order_type) {
                    case 1:
                        this.setData({
                            status_message: "很抱歉！您预定的卡座已作废，定金不予退还，期待您的再次预定~"
                        })
                        break;
                    case 2:
                        this.setData({
                            status_message: `很抱歉！您购买的卡座套餐未在${this.data.packages.overdue_day}日内完成消费，订单自动作废并不退还套餐费用，下次请在规定时间内完成消费哦~`
                        })
                        break;
                    case 3:
                        this.setData({
                            status_message: "很抱歉！您购买的优惠套餐已经作废，订单自动作废并不退还套餐费用，下次请在规定时间内完成消费哦~"
                        })
                        break;
                }
                break;
            case 6: //已拒绝
                this.setData({
                    status_message_title: "订单已拒绝",
                    title_color: "f5912c"
                })
                switch (this.data.cur_message.order_type) {
                    case 1:
                        this.setData({
                            status_message: `${this.data.cur_message.cancel_reason}。系统将自动退还您的预订金，欢迎下次预定~`
                        })
                        break;
                    case 2:
                        this.setData({
                            status_message: `${this.data.cur_message.cancel_reason}。系统将自动退还您的预订金，欢迎下次预定~`
                        })
                        break;
                    case 3:
                        this.setData({
                            status_message: `${this.data.cur_message.cancel_reason}。系统将自动退还您的预订金，欢迎下次预定~`
                        })
                        break;
                }
                break;
            case 7: //已接单
                if(this.data.cur_message.incr_time == 0){
                this.setData({
                    status_message_title: "商家已接单",
                    title_color: "f5912c"
                })
                switch (this.data.cur_message.order_type) {
                    case 1:
                        this.setData({
                            status_message: `卡座预定成功！请于${this.data.cur_message.arrives_time} ${this.data.cur_message.begin_time}准时到店消费，逾期将不退还定金。`
                        })
                        break;
                    case 2:
                        this.setData({
                            status_message: `卡座套餐购买成功！请于${this.data.cur_message.arrives_time} ${this.data.cur_message.begin_time}准时到店消费；逾期系统将为您保留该套餐${this.data.packages.overdue_day}日，您须再次预定卡座到店消费；若超过${this.data.packages.overdue_day}日未到店消费，该套餐将自动作废并不退还套餐费用。`
                        })
                        break;
                    case 3:
                        this.setData({
                            status_message: `优惠套餐购买成功！请于${this.data.cur_message.arrives_time} ${this.data.cur_message.begin_time}准时到店消费，逾期将不退还该套餐费用。`
                        })
                        break;
                }
        } else {
                    this.setData({
                        status_message_title:"订单延时",
                        title_color:"dc5946"
                    })
                    this.setData({
                        status_message:`已为您预定的卡座延时${this.data.cur_message.incr_time}分钟，请您在${this.data.cur_message.incr_time}分钟内到店消费，过时订单自动作废并不退还套餐费用。`
                    })
                }
                break;
            default:

        }
    },
    // 处理卡座数据
    do_card_data:function () {
       this.data.card_data.seat_number = formatNumber(this.data.card_data.seat_number)

        this.setData(this.data)
    },
    // 关于倒计时的功能
    onUnload:function(){
        clearTimeout(Timeout)
    },
    // onHide:function () {
    //     clearTimeout(Timeout)
    // },
    // onShow:function () {
    //     if(this.data.cur_message.created_time != undefined  && this.data.cur_message.status == 1){
    //         var MD5 = md5()
    //         var timestamp = MD5.timestamp
    //         var str_md5 = MD5.str_md5
    //         http(`${baseUrl}/v1/merchant/serverTime`,{client:'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
    //             console.log(res)
    //             olddate = parseInt(this.data.cur_message.created_time)
    //             total_micro_second = 30 * 60;
    //             nowdate = total_micro_second - Math.floor(res.data.now_time - olddate)
    //             this.count_down()
    //
    //         })
    //     }
    //
    //
    // },
  /* 毫秒级倒计时 */
    count_down:function(){
        // 渲染倒计时时钟
        this.setData({
            clock: this.date_format(nowdate)
        });

        if (nowdate<= 0) {
          if(this.data.cur_message.status == 1){
              this.data.cur_message.status = 0
              this.setData({
                  status_message_title:"订单已取消",
                  status_message:"很遗憾！您的订单超时未完成支付，系统已为您自动取消。",
                  title_color:"c5c5c5",
                  cur_message:this.data.cur_message
              })
              this.setData({
                  clock: "已经截止",
                  disabled:true
              });
          }

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
    // 去评价
    evaluated:function (e) {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        wx.navigateTo({
            url: `../no_evaluated/no_evaluated?type=${e.currentTarget.dataset.type}&order_no=${this.data.cur_message.order_no}`
        })
    },
    //进入已评价页面
    into_evaluated:function () {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        wx.navigateTo({
            url: `../is_evaluated/is_evaluated?order_no=${this.data.cur_message.order_no}`
        })
    },
    // 查看卡套的逾期订单
    look_order:function (e) {
        wx.redirectTo({
            url: `./order_details?order_no=${e.currentTarget.dataset.order_no}`
        })
    },
    pay:function (e) {
        wx.redirectTo({
            url: `../../index/confirm_order/confirm_order?status=1&created_time=${e.currentTarget.dataset.created_time}&pay_price=${e.currentTarget.dataset.pay_price}&order_no=${e.currentTarget.dataset.order_no}&date=${e.currentTarget.dataset.date}&begin_time_time=${e.currentTarget.dataset.begin_time_time}`
        })
    },
    into_waiter_details:function (e) {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        wx.navigateTo({
            url: `../../index/waiter_details/waiter_details?employee_id=${e.currentTarget.dataset.employee_id}&type=1`
        })
    },
    call:function (e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.tel
        })
    },
    kpz_call:function () {
        wx.makePhoneCall({
            phoneNumber: '4008885186'
        })
    },
    previewImage:function (e) {
         wx.previewImage({
             // current:curimage, // 当前显示图片的http链接
             urls:[this.data.cur_message.order_qrcode] // 需要预览的图片http链接列表
         })
    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }


})

