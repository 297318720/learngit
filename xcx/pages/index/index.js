var bmap = require('../../helper/bmap-wx.min.js');
var wxMarkerData = [];
var noChoose = [{
    up:false,
    down:false,
},{
    up:false,
    down:false,
},{
    up:false,
    down:false,
}]
var util = require('../../utils/util.js');
var http = util.http;
var storage = util.storage;
var md5 = util.hexMD5;

var {
    globalData
} = getApp()
// 调用应用实例的方法获取全局数据

var baseUrl = globalData.baseUrl;
// var md5 = require('../../helper/md5.js').hex_md5
var index = 1
Page({

  data: {
      // 轮播图
      imgUrls:[
          // {
          //     "id": "1",
          //     "title": "首页banner1",
          //     "url": "http://console.sc-csj.cn/index.php?m=Admin&amp;c=Index&amp;a=index",
          //     "img": "ad/20170822/kfi1503372142apuz571.jpg"
          // },
      ],
      chooseName:["人气","评分","消费"],
      isDistancechoose:true,  //是否用距离排序
      chooseIcon:[{   //人气，评分，消费的升降序
          up:false,
          down:false,
      },{
          up:false,
          down:false,
      },{
          up:false,
          down:false,
      }],

      list:[],  //酒吧列表
      isHiddenBottom_loading:true, //底部过渡加载效果的隐藏和显示
      showAddress:"加载中...",  //页面左上角地理位置的展示
      // 排序列表要发送的数据
      sendAddress:"",  //将要发送的地址
      latitude:"",  //纬度
      longitude:"",  //经度
      type:1,  //排序的类型 1：距离，2：人气，3：评分，4：人均消费
      sort:1,  //排序的方式 1：升序，2：降序,
      banner_show:false

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

      // wx.getSystemInfo({
      //     success: function(res) {
      //         console.log(res.system)
      //     }
      // })

      //判断用户是否授权了地理位置信息

      wx.authorize({
          scope: 'scope.userLocation',
          success:(errMsg) =>{
              // 广告位
              var MD5 = md5()
              var timestamp = MD5.timestamp
              var str_md5 = MD5.str_md5
              http(`${baseUrl}/v1/ad/advert`, {client: 'xcx',flag:'index_banner',type:1,size:5,sign:str_md5,timestamp:timestamp}, (res) => {
                  console.log(res)
                  if(res.code == 200){
                       this.setData({
                           imgUrls:res.data
                       })
                  }
              })
              this.login()
              // this.setData({
              //     list:[{average:3,hot:70},{average:4,hot:70},{average:4.5,hot:70},{average:3.7,hot:70},{average:3.2,hot:70},{average:2.5,hot:70}]
              // })


              this.loading_location()
          },
          fail:(errMsg)=>{
              wx.redirectTo({
                  url: '../location/location'
              })
          }
      })



      wx.setNavigationBarTitle({
          title:"空瓶子"
      });


  },

    login:function () {
        wx.login({
            success:  (res) =>{
                wx.getUserInfo({
                    success:  (user)=> {
                        console.log(user)
                        if (res.code) {
                            //发起网络请求
                            var MD5 = md5()
                            var timestamp = MD5.timestamp
                            var str_md5 = MD5.str_md5
                            http(`${baseUrl}/v1/member/wxlogin`,{code: res.code, iv: user.iv, encryptedData: encodeURIComponent(user.encryptedData),sign:str_md5,timestamp:timestamp},(res)=>{
                                console.log(res)
                                var jsondata = JSON.stringify(res.data)
                                wx.setStorageSync('member', jsondata)
                                this.show_tankuang()
                            })
                        }else {
                            console.log("code不存在")
                        }
                        console.log(res.code)

                    },
                    fail: ()=> {
                        console.log('获取接口调用失败' + res.errMsg + res)
                        this.modal({
                            content:"监测到您没开打空瓶子的用户信息权限，是否去设置打开？",
                            confirmColor:"#ff9933",
                            confirm:()=>{
                                this.openSetting()
                            }
                        })
                        // wx.showModal({
                        //     content: '监测到您没开打空瓶子的用户信息权限，是否去设置打开？',
                        //     confirmText:'确认',
                        //     success: (res) =>{
                        //         if (res.confirm) {
                        //             this.openSetting()
                        //         } else if (res.cancel) {
                        //             console.log('用户点击取消')
                        //
                        //         }
                        //     }
                        // })
                    }
                });
            }
        });

    },
    show_tankuang:function () {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/verifyBindPhoneNumber`,{token:member.token,client: 'xcx',unionid:member.unionid,sign:str_md5,timestamp:timestamp},(res)=> {
            console.log(res)
            if(res.code == 200){

            }else {
                this.setData({
                    banner_show:true
                })
            }
        })

    },
    openSetting:function () {
        wx.openSetting({
            success: (res) => {
                setTimeout(()=>{
                    wx.getSetting({
                        success: (res) => {
                            if(res.authSetting["scope.userInfo"]){
                                this.login()
                            }
                            /*
                             * res.authSetting = {
                             *   "scope.userInfo": true,
                             *   "scope.userLocation": true
                             * }
                             */
                        }
                    })
                },300)

            },

        })
    },

    // 百度地图定位位置信息
    loading_location:function () {
        var BMap = new bmap.BMapWX({
            ak: 'sCWDz0fzQQaRhLavVBsm7UKlbFWIdcjf'
        });

        wx.getLocation({
            type: 'wgs84',
            success: (res)=> {
                this.setData({
                    latitude:res.latitude,
                    longitude:res.longitude,
                })
                console.log(res)
                // 初始化商户列表
                var MD5 = md5()
                var timestamp = MD5.timestamp
                var str_md5 = MD5.str_md5
                http(`${baseUrl}/v1/Merchant/nearbyMerchant`, {client: 'xcx',page:1,pageSize:8,type:1,sort:1,lng:this.data.longitude,lat:this.data.latitude,sign:str_md5,timestamp:timestamp}, (res) => {
                    console.log(res)
                    if(res.code == 200){
                        this.setData({
                            list:res.data.list
                        })
                    }
                    wx.stopPullDownRefresh()
                    wx.hideNavigationBarLoading()
                })
            },
            fail: (res)=> {
                console.log("获取地理位置失败")
                this.loading_location()
            }
        })
        var success = (data) =>{
            console.log('获取地理位置成功')
            this.setData({
                showAddress:data.originalData.result.business,
                sendAddress:data.originalData.result.formatted_address,
                // latitude:data.originalData.result.location.lat,
                // longitude:data.originalData.result.location.lng,
            })
            console.log(data.originalData.result.location.lat)

        }
        var fail = (data)=> {
            console.log('获取地理位置失败')
            this.loading_location()
        };
        BMap.regeocoding({
            fail: fail,
            success: success,
        });
    },
        // showSearchInfo: function(data, i) {
        //   console.log(data)
        //     this.setData({
        //         rgcData: {
        //             address: '地址：' + data[i].address + '\n',
        //             desc: '描述：' + data[i].desc + '\n',
        //             business: '商圈：' + data[i].business
        //         }
        //     });
        // },

chooseLocation:function () {
        wx.chooseLocation({
            success:(data)=>{

              this.setData({
                  showAddress:data.name,
                  sendAddress:data.address,
                  latitude:data.latitude,
                  longitude:data.longitude
              })
                var MD5 = md5()
                var timestamp = MD5.timestamp
                var str_md5 = MD5.str_md5
                http(`${baseUrl}/v1/Merchant/nearbyMerchant`, {client: 'xcx',page:1,pageSize:8,type:1,sort:1,lng:this.data.longitude,lat:this.data.latitude,sign:str_md5,timestamp:timestamp}, (res) => {
                    console.log(res)
                    if(res.code == 200){
                        this.setData({
                            list:res.data.list
                        })
                    }
                })
            },
            fail:(data)=>{
                console.log('获取地理位置失败'+data)
            }
        })
    },
    distance_choose:function () {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
         this.setData({
             isDistancechoose:true,
             type:1,
             chooseIcon:noChoose,
             sort:1
         })
        // 距离升序请求
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/merchant/nearbyMerchant`, {client: 'xcx',pageSize:8,page:1,type:this.data.type,sort:this.data.sort,lng:this.data.longitude,lat:this.data.latitude,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            if(res.code == 200){
                this.data.list = res.data.list
                this.setData(this.data)
            }
            wx.hideLoading()


        })
    },
    choose_list:function (e) {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        var nth = e.currentTarget.dataset.index;

        for(var i=0;i<3;i++){
            if(i != nth){
                this.data.chooseIcon[i].up = false
                this.data.chooseIcon[i].down = false
            }
        }
        if(this.data.chooseIcon[nth].up == false && this.data.chooseIcon[nth].down == false){
            this.data.chooseIcon[nth].up = true;
            this.setData({
                sort:2
            })
        }else {
            this.data.chooseIcon[nth].up = !this.data.chooseIcon[nth].up
            this.data.chooseIcon[nth].down = !this.data.chooseIcon[nth].down
            this.setData({
                sort:this.data.sort == 1?2:1
            })
        }
        this.setData({
            chooseIcon:this.data.chooseIcon,
            type:nth + 2,
            isDistancechoose:false
        })
        // 请求数据
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/Merchant/nearbyMerchant`, {client: 'xcx',page:1,pageSize:8,type:this.data.type,sort:this.data.sort,lng:this.data.longitude,lat:this.data.latitude,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            if(res.code == 200){
                this.setData({
                    list:res.data.list
                })
            }
            wx.hideLoading()
        })
    },
    // 上拉触底
    onReachBottom:function () {
        // var app = getApp();
        // // toast/showModal组件实例
        // new app.ShowModalPannel();

        this.setData({
            isHiddenBottom_loading:false
        })
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/merchant/nearbyMerchant`, {client: 'xcx',pageSize:8,page:++index,type:this.data.type,sort:this.data.sort,lng:this.data.longitude,lat:this.data.latitude,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            if(res.code == 200){
                this.data.list = this.data.list.concat(res.data.list)
                this.data.isHiddenBottom_loading = true
                this.setData(this.data)
                // IOS在下拉刷新后会自动触发上拉加载事件，这个上拉加载事件又把刚加的数据清空了，下面是重新再加数据库来解决
                let _compData = {
                //     // '_showModal_.title': '提示',// 显示的标题
                    '_showModal_.showCancel': true,// 是否显示取消按钮，默认为 true
                //     '_showModal_.confirmText': "确认",// 确定按钮的文字，默认为"确定"，最多 4 个字符
                //     '_showModal_.cancelText': "取消",// 取消按钮的文字，默认为"取消"，最多 4 个字符
                }
                this.setData(_compData)
            }
        })

    },

    chooseAdress:function () {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        wx.navigateTo({
            url: `./search/search?longitude=${this.data.longitude}&latitude=${this.data.latitude}`
        })
    },
    in_bar_detail:function (e) {
        wx.showLoading({
            title: '加载中',
            mask:true
        })

        var merchant_id =e.currentTarget.dataset.id

        wx.navigateTo({
            url: `./bar_details/bar_details?merchant_id=${merchant_id}`
        })

    },
    again_data:function () {
        this.setData({
            isDistancechoose:true,
            chooseIcon:[{   //人气，评分，消费的升降序
                up:false,
                down:false,
            },{
                up:false,
                down:false,
            },{
                up:false,
                down:false,
            }],
            list:[],
            imgUrls:[],
            isHiddenBottom_loading:true, //底部过渡加载效果的隐藏和显示
            showAddress:"加载中...",  //页面左上角地理位置的展示
            // 排序列表要发送的数据
            sendAddress:"",  //将要发送的地址
            latitude:"",  //纬度
            longitude:"",  //经度
            type:1,  //排序的类型 1：距离，2：人气，3：评分，4：人均消费
            sort:1,  //排序的方式 1：升序，2：降序,

        })
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        console.log('下拉刷新')
        wx.showNavigationBarLoading()

        // wx.startPullDownRefresh()
        this.onLoad()
        this.again_data()
        index = 1
    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    },
    // kai:function () {
    //     this.showload({
    //         content:'加载中'
    //     })
    //     setTimeout(()=>{
    //         this.modal({
    //             content:'测试'
    //         })
    //     },2000)
    // },

    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
            return {
                title: '来自于按钮转发',
                success: function(res) {
                    // 转发成功
                    console.log('转发成功')
                },
                fail: function(res) {
                    // 转发失败
                }
            }
        }
        return {
            title: '来自于菜单转发',
            success: (res)=> {
                // 转发成功
               this.show({
                   content:'您已经转发成功了哦'
               })
            },
            fail: function(res) {
                // 转发失败
            }
        }
    },

    close_banner:function () {
        this.setData({
            banner_show:false
        })
    },
    into_collar_wine:function () {
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        wx.navigateTo({
            url: `./collar_wine/collar_wine`
        })
    },
    into_collar:function (e) {
        var id = e.currentTarget.dataset.id
        console.log(id)
        if(id == 1){
            wx.navigateTo({
                url: `./collar_wine/collar_wine`
            })
        }
    }

  })





