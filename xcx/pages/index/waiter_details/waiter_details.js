var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage;
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
      // 通过employee_id用HTTP请求获取
      my_message:{
          // employee_id: 123,
          // realname: "李一凡",
          // sex: 2,
          // tel: "18723689862",
          // average: "4.9",
          // image: [
          //     "../../../assets/forthemoment/photoone.png",
          //     "../../../assets/forthemoment/photoone.png",
          //     "../../../assets/forthemoment/photoone.png",
          //     "../../../assets/forthemoment/photoone.png",
          //     "../../../assets/forthemoment/photoone.png",
          //     "../../../assets/forthemoment/photoone.png",
          //     "../../../assets/forthemoment/photoone.png",
          //     "../../../assets/forthemoment/photoone.png",
          // ],
          // avatar:"/employee/20170620/jdsf83jidfs8934njd9.jpg",
          // type: null,
      },
      employee_id:"",
      index:-1,
      curchoose:-1,
      is_show:null, //是否显示选TA服务，true显示，false不显示
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

      if(options.type){
          this.data.employee_id = options.employee_id;
          this.data.is_show = false
      }else {
          this.data.index = options.index;
          this.data.curchoose = options.curchoose;
          this.data.employee_id = options.employee_id;
          this.data.is_show = true
      }
      // 初始化服务员信息
      var MD5 = md5()
      var timestamp = MD5.timestamp
      var str_md5 = MD5.str_md5
      console.log(options.employee_id)
      http(`${baseUrl}/v1/Employee/employeeInfo`,{client: 'xcx',employee_id:options.employee_id,sign:str_md5,timestamp:timestamp},(res)=>{
          console.log(res)
          this.setData({
              my_message:res.data
          })
      })
    this.setData(this.data)
      wx.setNavigationBarTitle({
          title:'客户经理'
      });
  },
    call:function () {
        wx.makePhoneCall({
            phoneNumber: this.data.my_message.tel //仅为示例，并非真实的电话号码
        })
    },
    previewImage:function (e) {
        wx.getSystemInfo({
            success: (res)=> {
                console.log(res)
               if(res.brand == 'vivo' || res.brand == 'samsung' || res.brand == 'Xiaomi'){
                    return
               }else {
                   var curimage = e.currentTarget.dataset.image;
                   console.log(curimage)
                   wx.previewImage({
                       current:curimage, // 当前显示图片的http链接
                       urls:this.data.my_message.image // 需要预览的图片http链接列表
                   })
               }
            }
        })

    },
    choose_it:function () {

        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];  //当前页面
        var prevPage = pages[pages.length - 2]; //上一个页面

      if(this.data.index !== this.data.curchoose){
              prevPage.data.manager_list.forEach((item)=>{
                  item.curchoose = false
              })
              prevPage.data.manager_list[this.data.index].curchoose = true;
              prevPage.setData({
                  manager_list:prevPage.data.manager_list,
                  cur_choose_manager:this.data.index,
                  choose_id:this.data.employee_id
              })
      }else {
              prevPage.data.manager_list.forEach((item)=>{
                  item.curchoose = false
              })
              prevPage.setData({
                  manager_list:prevPage.data.manager_list,
                  cur_choose_manager:-1,
                  choose_id:""
              })
      }

        wx.navigateBack();
    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }


})