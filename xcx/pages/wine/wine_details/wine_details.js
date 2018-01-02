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

var baseUrl = globalData.baseUrl;
Page({
    data:{
       list:[
           {
               pack_image: "/assets/forthemoment/picture@2x.png",
               pack_title: "2-4人进口洋酒套餐",
               market_price:5000,
               pack_price: 3000 ,
               total_price: 3000 ,
               pay_price: 3000 ,
               pack_description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
               stock:20,
               created_time:"2017-12-20 16:09",
               payment:1,
               description:'这是一个备注信息萨达刚发的是分散大时代发斯蒂芬阿斯蒂芬'
           },
           {
               pack_image: "/assets/forthemoment/picture@2x.png",
               pack_title: "2-4人进口洋酒套餐",
               market_price:5000,
               pack_price: 3000 ,
               total_price: 3000 ,
               pay_price: 3000 ,
               pack_description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
               stock:20,
               format_time:"2017-12-20 16:09",
               payment:1,
               description:'这是一个备注信息'
           }
       ]
    },
    onLoad:function (options) {
        var app = getApp();
        // toast组件实例
        new app.ToastPannel();
        new app.ShowModalPannel();

        wx.setNavigationBarTitle({
            title:"续酒信息"
        });
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        var member = storage()
        //初始化续酒详情列表
        http(`${baseUrl}/v1/renew/orderList`,{order_id:this.data.order_id,member_id:member.member_id,page:1,page_size:1000,sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
             if(res.code == 200){
                this.do_data(res.data.list)
             }
        })

    },
    // 处理下拿到的数据
    do_data:function (list) {
         list.forEach((item,index)=>{
             item.created_time = this.getDateString(new Date(item.created_time))+" "+this.getDateTimeString(new Date(item.created_time))

         })
        this.setData({
            list:list
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



})