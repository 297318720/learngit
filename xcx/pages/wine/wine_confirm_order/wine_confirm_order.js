/**
 * Created by Administrator on 2017/12/20.
 */
Page({
    data:{
        // 联系人信息
        contact:{
            realname:"袁康",
            sex:1,
            tel:"15184454658",
        },
        goods:{
            image: "/assets/forthemoment/picture@2x.png",
            title: "2-4人进口洋酒套餐",
            price: 3000 ,
            description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
            stock:20,
            market_price:2000
        }
    },
    onLoad:function (options) {
        wx.setNavigationBarTitle({
            title:"确认订单"
        });
    },
    pay:function (e) {
        wx.navigateTo({
            url: `../../index/confirm_order/confirm_order?status=1&pay_price=${this.data.goods.price}`
        })
    },



})