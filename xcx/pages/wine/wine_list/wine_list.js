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
           stock:20
           },
           {
               image: "/assets/forthemoment/picture@2x.png",
           title: "2-4人进口洋酒套餐",
           market_price:5000,
           price: 3000 ,
           description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
           stock:0
           }
       ]
    },
    onLoad:function (options) {
        wx.setNavigationBarTitle({
            title:"续酒"
        });
    }



})