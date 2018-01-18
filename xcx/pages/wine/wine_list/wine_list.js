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
           // {
           //     pack_image: "/assets/forthemoment/picture@2x.png",
           // pack_title: "2-4人进口洋酒套餐",
           // market_price:5000,
           // price: 3000 ,
           // pack_description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
           // pack_stock:20
           // },
           // {
           //     pack_image: "/assets/forthemoment/picture@2x.png",
           // pack_title: "2-4人进口洋酒套餐",
           // market_price:5000,
           // price: 3000 ,
           // pack_description: "青岛特醇一打、果盘一份、小吃一份、虎牌啤酒一打、喜力一打",
           // pack_stock:0
           // }
       ],
        merchant_id:'',
        order_id:'',
        order_type:'',
        order_no:'',

    },
    onLoad:function (options) {
        var app = getApp();
        // toast组件实例
        new app.ToastPannel();
        new app.ShowModalPannel();
        new app.LoadingPannel();
        wx.setNavigationBarTitle({
            title:"续酒"
        });
        this.setData({
            merchant_id:options.merchant_id,
            order_id:options.order_id,
            order_type:options.order_type,
            order_no:options.order_no
        })
        // 初始化续酒列表
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/renew/winePackList`, {client:'xcx',order_id:this.data.order_id,merchant_id:this.data.merchant_id,order_type:this.data.order_type,page:1,page_size:1000,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            this.setData({
                list:res.data.list
            })
        })

    },
    buy:function (e) {
        wx.showLoading({
            title: '加载中',
            mask:true
    })
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        var member = storage()
        //点击购买时验证续酒套餐库存是否充足
        http(`${baseUrl}/v1/renew/checkWinePack`,{client:'xcx',order_id:this.data.order_id,pack_type:this.data.order_type ==3?1:2,merchant_id:this.data.merchant_id,token:member.token,sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
            if(res.code == 200){
                wx.hideLoading()
                var item =JSON.stringify(e.currentTarget.dataset.item)
                wx.showLoading({
                    title: '加载中',
                    mask:true
                })
                wx.navigateTo({
                    url: `../wine_confirm_order/wine_confirm_order?item=${item}&order_no=${this.data.order_no}&order_id=${this.data.order_id}&goods_pack_id=${e.currentTarget.dataset.goods_pack_id}`
                })
            }else {
                this.show({
                    content:res.msg,
                    // duration:3000
                });
            }
        })
    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }



})