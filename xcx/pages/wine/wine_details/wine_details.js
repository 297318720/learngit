/**
 * Created by Administrator on 2017/12/20.
 */
var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage;
var md5 = util.hexMD5;

var {
    globalData
} = getApp()
// 调用应用实例的方法获取全局数据
var shuaxin = true;
var baseUrl = globalData.baseUrl;
Page({
    data:{
       list:[
           // {
           //     pack_image: "/assets/forthemoment/picture@2x.png",
           //     pack_title: "2-4人进口洋酒套餐",
           //     market_price:5000,
           //     pack_price: 3000 ,
           //     total_price: 3000 ,
           //     pay_price: 3000 ,
           //     pack_description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
           //     stock:20,
           //     created_time:"2017-12-20 16:09",
           //     payment:1,
           //     description:'这是一个备注信息萨达刚发的是分散大时代发斯蒂芬阿斯蒂芬'
           // },
           // {
           //     pack_image: "/assets/forthemoment/picture@2x.png",
           //     pack_title: "2-4人进口洋酒套餐",
           //     market_price:5000,
           //     pack_price: 3000 ,
           //     total_price: 3000 ,
           //     pay_price: 3000 ,
           //     pack_description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
           //     stock:20,
           //     format_time:"2017-12-20 16:09",
           //     payment:1,
           //     description:'这是一个备注信息'
           // }
       ],
        order_id:''
    },
    onLoad:function (options) {
        shuaxin = false

        var app = getApp();
        // toast组件实例
        new app.ToastPannel();
        new app.ShowModalPannel();
        new app.LoadingPannel();
        wx.setNavigationBarTitle({
            title:"续酒信息"
        });

            this.setData({
                order_id:options.order_id
            })

        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        var member = storage()
        //初始化续酒详情列表
        http(`${baseUrl}/v1/renew/orderList`,{order_id:this.data.order_id,member_id:member.member_id,page:1,page_size:1000,sign:str_md5,timestamp:timestamp},(res)=>{
            shuaxin = true
             if(res.code == 200){
                this.do_data(res.data.list)
             }
        })
    },
    onShow:function () {
        if(shuaxin){
            wx.startPullDownRefresh()
        }

    },
    // 处理下拿到的数据
    do_data:function (list) {
         list.forEach((item,index)=>{
             console.log(item.payment)
             item.created_time_format = this.getDateString(new Date(item.created_time*1000))+" "+this.getDateTimeString(new Date(item.created_time*1000))
             switch (item.payment){
                 case '1':
                     item.payment = '余额支付'
                     break;
                 case '2':
                     item.payment = '微信支付'
                     break;
                 case '0':
                     item.payment = '未支付'
             }
         })
        this.setData({
            list:list
        })
    },
    pay:function (e) {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        wx.navigateTo({
            url: `../../index/confirm_order/confirm_order?status=2&created_time=${e.currentTarget.dataset.created_time}&order_no=${e.currentTarget.dataset.order_no}&order_id=${e.currentTarget.dataset.order_id}&pay_price=${e.currentTarget.dataset.pay_price}&buy_type=2&top_order_id=${this.data.order_id}`
        })
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

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        console.log('下拉刷新')
        wx.showNavigationBarLoading()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        var member = storage()
        //初始化续酒详情列表
        http(`${baseUrl}/v1/renew/orderList`,{order_id:this.data.order_id,member_id:member.member_id,page:1,page_size:1000,sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
            wx.stopPullDownRefresh()
            wx.hideNavigationBarLoading()
            if(res.code == 200){
                this.do_data(res.data.list)
            }
        })

    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }



})