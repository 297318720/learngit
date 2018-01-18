var util = require('../../../utils/util.js');
var http = util.http;
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
      isShowdel: true,  //是否显示清空输入框的图标是否显示
      no_resultShow:true,  //是否显示无商品页面
      // 热门搜索列表
      hot_search: [
          // "维纳斯酒吧", "兰桂坊", "维纳斯", "酒吧", "SPACE酒吧", "千百度酒吧", "维纳斯", "酒吧",
      ],
      history_search: [],
      sendName: "",  //发送的关键字
      // 搜索的结果
      search_result: [],
      isHiddenhot_history:false,
      //模拟搜索后返回的数据
      fake_data:[],
      latitude:"",  //纬度
      longitude:"",  //经度

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var app = getApp();
      // toast/showModal组件实例
      new app.ToastPannel();
      new app.ShowModalPannel();
      new app.LoadingPannel();
      wx.setNavigationBarTitle({
          title:"搜索"
      });
      this.setData({
          latitude:parseFloat(options.latitude),
          longitude:parseFloat(options.longitude),
      })
      console.log(this.data.latitude)
      var storage = wx.getStorageSync('history_search')
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      http(`${baseUrl}/v1/ad/advert`, {client: 'xcx',flag:'search_text',type:2,size:6,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
          if(res.code == 200){
              this.setData({
                  hot_search:res.data
              })
          }
      })
      if(storage){

          this.setData({
              history_search:storage
          })
      }else {

          wx.setStorage({
              key:"history_search",
              data:[]
          })
      }
  },
    in_bar_detail:function (e) {
        var merchant_id =e.currentTarget.dataset.id
        wx.redirectTo({
            url: `../bar_details/bar_details?merchant_id=${merchant_id}`
        })
    },
    search_input:function (e) {
         this.setData({
             sendName:e.detail.value,
         })
        if(e.detail.value == ""){
             this.empty()
        }else {
            this.setData({
                isShowdel:false
            })
        }


    },
    search:function () {
      if(this.data.sendName == ""){
          return
      }
      this.setStorage()
        this.send()
    },
    search_item:function (e) {

        this.setData({
            sendName:e.currentTarget.dataset.name,
            isShowdel:false
        })

        this.send()
    },
    setStorage:function () {
        var isStore = true;
        var arr = this.data.history_search;
        var sendName = this.data.sendName;
        arr.forEach((item)=>{
            if(item == sendName){
                isStore = false
            }
        })
        console.log(isStore)
        if(isStore){
            arr.push(sendName)
            this.setData({
                history_search:arr
            })
            wx.setStorage({
                key:"history_search",
                data:arr
            })
        }
    },
    // 发送搜索请求数据
    send:function () {
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/merchant/nearbyMerchant`, {client: 'xcx',keyword:this.data.sendName,page:1,pageSize:8,type:1,sort:1,lng:this.data.longitude,lat:this.data.latitude,sign:str_md5,timestamp:timestamp}, (res) => {
          console.log(res)
            if(res.code == 200){
                this.setData({
                    search_result:res.data.list,
                    //成功返回数据的话
                    isHiddenhot_history:true
                })
            }
            if(this.data.search_result.length == 0){
                this.setData({
                    no_resultShow:false,
                    isHiddenhot_history:true
                })
            }

        })



    },
    // 清空输入框
    empty:function () {
        this.setData({
            sendName:"", //输入框清空
            isShowdel:true,  //隐藏清空图标
            isHiddenhot_history:false, //显示热门和历史记录搜索
            search_result:[],  //清空搜索返回的列表数据
            no_resultShow:true,  //关闭无商品页面
        })

    },
    // 清空历史记录
    empty_history:function () {
        // wx.showModal({
        //     title: '清除历史记录',
        //     success: (res)=> {
        //         if (res.confirm) {
        //             wx.removeStorage({
        //                 key: 'history_search',
        //                 success: (res) =>{
        //                     this.setData({
        //                         history_search:[]
        //                     })
        //                 }
        //             })
        //         } else if (res.cancel) {
        //             console.log('用户点击取消')
        //         }
        //     }
        // })
        this.modal({
            content:"清除历史记录",
            confirm:()=>{
                wx.removeStorage({
                    key: 'history_search',
                    success: (res) =>{
                        this.setData({
                            history_search:[]
                        })
                    }
                })
            }
        })

    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }


})