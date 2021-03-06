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
        // 联系人信息
        contact:{
            // realname:"袁康",
            // sex:1,
            // tel:"15184454658",
        },
        goods: {
               // pack_id: "1",
               // merchant_id: "1",
               // pack_title: "精选洋酒套餐",
               // type: "1",
               // price: "400.00",
               // pack_image: "http://oxmze6own.bkt.clouddn.com/goods_2017_fwr1510542154wnrp505.jpg",
               // pack_description: "精选洋酒限量套餐,先到先得",
               // market_price: "500.00",
               // purchase_price: "300.00",
               // pack_stock: "9"
            },
        order_no:'',
        order_id:'',
        sum:0,
        value:'', //备注信息
        goods_pack_id:'',
        // sit_of_number:'' //座位号
    },
    onLoad:function (options) {
        var app = getApp();
        // toast组件实例
        new app.ToastPannel();
        new app.ShowModalPannel();
        new app.LoadingPannel();
        wx.setNavigationBarTitle({
            title:"确认订单"
        });
        this.setData({
            goods:JSON.parse(options.item),
            order_no:options.order_no,
            order_id:options.order_id,
            goods_pack_id:options.goods_pack_id,
        })
        this.setData({
            'goods.discount_money':this.returnFloat(this.data.goods.market_price - this.data.goods.price)
        })
        console.log(this.data.goods)
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        var member = storage()
        // 获取订单联系人
        http(`${baseUrl}/v1/Order/orderDetail`,{client: 'xcx',token:member.token,order_no:this.data.order_no,sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
         this.setData({
             'contact.realname':res.data.contacts_realname,
             'contact.sex':res.data.contacts_sex,
             'contact.tel':res.data.contacts_tel
         })
        })
    },
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
    commit_wine_order:function () {
       // if(this.data.sit_of_number == ''){
       //     this.show({
       //         content:'请填写桌号',
       //         // duration:3000
       //     })
       //     return
       // }
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        var member = storage()
        //用户续酒下单
        http(`${baseUrl}/v1/renew/createWineOrder`,{
            // desk_number:this.data.sit_of_number,
            goods_pack_id:this.data.goods_pack_id,order_id:this.data.order_id,description:this.data.value,sign:str_md5,timestamp:timestamp},(res)=>{
            console.log(res)
            if(res.code == 200){
                wx.showLoading({
                    title: '加载中',
                    mask:true
                })
                wx.redirectTo({
                    url: `../../index/confirm_order/confirm_order?status=2&created_time=${res.data.created_time}&order_no=${res.data.order_no}&order_id=${res.data.order_id}&pay_price=${this.data.goods.price}&buy_type=2&top_order_id=${this.data.order_id}`
                })
            }else {
                this.show({
                    content:res.msg,
                    // duration:3000
                });
            }
        })
    },
    input: function (e) {
        this.setData({
            sum: e.detail.value.length,
            value: e.detail.value
        })

    },
    sit_number: function (e) {
        console.log(e.detail.value)
            this.setData({
                sit_of_number: e.detail.value
            })
    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }



})