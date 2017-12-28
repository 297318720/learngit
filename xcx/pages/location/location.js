var num = 1
var num1 = 1
var num2 = 1
Page({

  /**
   * 页面的初始数据
   */
  data: {
      cheng:null,
      shi:null,
      tishi:"",
      tishi1:"",
      tishi2:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
    openSetting:function () {
        wx.openSetting({
            success: (res) => {
                this.setData({
                    tishi:'打开调用openSetting成功'+num++
                })
                setTimeout(()=>{
                    wx.getSetting({
                        success: (res) => {
                            // console.log(res)
                            // this.setData({
                            //     tishi1:'getSetting调用成功'+num1++,
                            //     tishi2:''+res.authSetting["scope.userLocation"]
                            // })
                            if(res.authSetting["scope.userLocation"]){
                                wx.switchTab({
                                    url: '../index/index'
                                })
                            }
                            /*
                             * res.authSetting = {
                             *   "scope.userInfo": true,
                             *   "scope.userLocation": true
                             * }
                             */
                        },
                        fail:(res)=>{
                            // this.setData({
                            //     tishi1:'getSetting调用失败'+num1++,
                            //     tishi2:''+res.authSetting["scope.userLocation"]
                            // })
                        }
                    })
                },200)

            },
            // fail:(res)=>{
            //     console.log(res)
            //     this.setData({
            //         shi:res.authSetting["scope.userLocation"]
            //     })
            // }
        })
    }



})