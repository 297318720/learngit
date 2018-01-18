//app.js
var mta= require('./helper/mta_analysis')
import { ToastPannel } from './component/toast/toast'
import { ShowModalPannel } from './component/showModal/showModal'
import { LoadingPannel } from './component/loading/loading'
App({
    ToastPannel,
    ShowModalPannel,
    LoadingPannel,
  onLaunch: function () {
    // 小程序用户行为分析设置
      mta.App.init({
          "appID":"500501488",
          "eventID":"500501524", // 高级功能-自定义事件统计ID，配置开通后在初始化处填写
          "statPullDownFresh":true, // 使用分析-下来刷新次数/人数，必须先开通自定义事件，并配置了合法的eventID
          "statShareApp":true, // 使用分析-分享次数/人数，必须先开通自定义事件，并配置了合法的eventID
          "statReachBottom":true // 使用分析-页面触底次数/人数，必须先开通自定义事件，并配置了合法的eventID
      });

    //调用API从本地缓存中获取数据
    //   var logs = wx.getStorageSync('logs') || []
    //   logs.unshift(Date.now())
    //   wx.setStorageSync('logs', logs)

  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口

        {
            errcode:40029
            errmsg:"invalid code, hints: [ req_id: 4UTkAA0..... ]"
        }
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              // console.log(res)
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null,
      baseUrl:"https://member.api.kongpingzi.net",
      attachmentUrl : 'http://attachment.app.sc-csj.com/',
  }
})