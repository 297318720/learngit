/**
 * Created by Administrator on 2017/12/20.
 */
Page({
    data:{
       list:[
           {
               image: "/assets/forthemoment/picture@2x.png",
               title: "2-4人进口洋酒套餐",
               market_price:5000,
               price: 3000 ,
               description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
               stock:20,
               format_time:"2017-12-20 16:09",
               payment:"余额支付"
           },
           {
               image: "/assets/forthemoment/picture@2x.png",
               title: "2-4人进口洋酒套餐",
               market_price:5000,
               price: 3000 ,
               description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
               stock:20,
               format_time:"2017-12-20 16:09",
               payment:"余额支付"
           }
       ]
    },
    onLoad:function (options) {
        wx.setNavigationBarTitle({
            title:"续酒信息"
        });
    },
    pay:function (e) {
        wx.navigateTo({
            url: `../../index/confirm_order/confirm_order?status=1&pay_price=${this.data.goods.price}`
        })
    },



})