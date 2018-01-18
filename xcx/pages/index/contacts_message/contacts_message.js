var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage
var md5 = util.hexMD5;
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
var list=[
    // {
    //     id:2,
    //     realname:"和尚",
    //     sex:1,  //性别 1男 2女
    //     tel:"13566245236",
    //     member_id:1,
    //     is_default:0  //1默认联系人 0非默认联系人
    // },
    // {
    //     id:2,
    //     realname:"杨思童",
    //     sex:1,
    //     tel:"15184454658",
    //     member_id:1,
    //     is_default:1  //1默认联系人 0非默认联系人
    // },
    // {
    //     id:2,
    //     realname:"雪莲妹儿",
    //     sex:2,
    //     tel:"15486548568",
    //     member_id:1,
    //     is_default:0  //1默认联系人 0非默认联系人
    // },
]
// 定义一个清空保存的数据
var  empty_data = {
        id:null,
        realname:"",
        sex:1,
        tel:"",
        is_default:0  //1默认联系人 0非默认联系人
    }
Page({

  /**
   * 页面的初始数据
   */
  data: {
     contacts_list:[],
      // 页面切换
      show:{
         flag1:true,   //联系人列表
         flag2:false,   //添加页面
      },

      // 需要保存的联系人数据
      save:{
          id:null,
          realname:"",
          sex:1, //1男 2女
          tel:"",
          is_default:0  //1默认联系人 0非默认联系人
      },
      // 修改联系人所在列表的index
      index:null,
      // 打开的是添加还是修改
      add_or_update:null,  //true是添加 false是修改

      type:""  //从我的进入到这个页面的type为1,点联系人不会跳转上一页
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var app = getApp();
      // toast组件实例
      new app.ToastPannel();
      new app.ShowModalPannel();
      new app.LoadingPannel();
      console.log(this.data)


      if(options.type){
          this.setData({
              type:options.type
          })
      }

      wx.setNavigationBarTitle({
          title:"联系人信息"
      });
      // 初始化加载联系人列表
      this.contact_list()
  },
    contact_list:function () {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/contacts/contactsList`, {client: 'xcx',member_id:member.member_id,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            list = res.data.list
            list.forEach((item)=>{
                if(item.is_default == 1){
                    this.data.contacts_list.unshift(item)
                }else {
                    this.data.contacts_list.push(item)
                }
            })
            this.setData({
                contacts_list:this.data.contacts_list
            })
        })
    },
    // 选择一个联系人
    choose_it:function (e) {
       if(this.data.type == 1){
           return
       }

        var item = e.currentTarget.dataset.item;
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];  //当前页面
        var prevPage = pages[pages.length - 2]; //上一个页面
        prevPage.setData({
            contact:item
        })
        wx.navigateBack();
    },
    // 选择默认联系人
    setDefaultContact:function (e) {
        var index = e.currentTarget.dataset.index;
        var id = e.currentTarget.dataset.id;
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/contacts/setDefaultContact`, {uid:member.uid,client: 'xcx',member_id:member.member_id,contact_id:id,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            if(res.code == 200){
                this.data.contacts_list.forEach((item)=>{
                    item.is_default = 0
                })

                this.data.contacts_list[index].is_default = 1;
                this.setData({
                    contacts_list:this.data.contacts_list
                })
            }else {
                wx.hideLoading()
                this.show({
                    content:res.msg,
                    // duration:3000
                });
            }

        })

    },
    // 删除联系人
    del_item:function (e) {
        var index = e.currentTarget.dataset.index;
        var is_default = e.currentTarget.dataset.is_default;
        var id = e.currentTarget.dataset.id;
        // wx.showModal({
        //     title: '确定要删除该联系人吗？',
        //     success: (res)=> {
        //       // 下面写请求接口删除
        //       //   代码。。。
        //         if (res.confirm) {
        //             var member = storage()
        //             wx.showLoading({
        //                 title: '删除中',
        //                 mask:true
        //             })
        //             var MD5 = md5()
        //             var timestamp = MD5.timestamp
        //             var str_md5 = MD5.str_md5
        //             http(`${baseUrl}/v1/contacts/deleteContacts`, {uid:member.uid,token: member.token, client: 'xcx',member_id:member.member_id,contact_id:id,sign:str_md5,timestamp:timestamp}, (res) => {
        //                 console.log(res)
        //
        //                 if(res.code == 200){
        //                     this.data.contacts_list.splice(index,1)
        //                     if(this.data.contacts_list.length != 0){
        //                         if(is_default == 1){
        //                             // 把列表的第一个设为默认，发送请求
        //                             http(`${baseUrl}/v1/contacts/setDefaultContact`, {client: 'xcx',member_id:member.member_id,contact_id:this.data.contacts_list[0].id,sign:str_md5,timestamp:timestamp}, (res2) => {
        //                                 console.log(res2)
        //                                 if(res2.code == 200){
        //                                     this.data.contacts_list[0].is_default = 1;
        //                                 }else {
        //                                     wx.hideLoading()
        //                                     this.show({
        //                                         content:res2.msg,
        //                                         // duration:3000
        //                                     });
        //                                 }
        //                                 this.setData(this.data)
        //                             })
        //
        //                         }
        //                     }
        //                     this.setData(this.data)
        //
        //                     wx.hideLoading()
        //                     this.show({
        //                         content:'删除成功',
        //                         // duration:3000
        //                     });
        //                 }else {
        //                     wx.hideLoading()
        //                     this.show({
        //                         content:res.msg,
        //                         // duration:3000
        //                     });
        //                 }
        //             })
        //
        //
        //
        //         } else if (res.cancel) {
        //             console.log('用户点击取消')
        //         }
        //     }
        // })
        this.modal({
            content: "确定要删除该联系人吗？",
            confirm: () => {
                var member = storage()
                wx.showLoading({
                    title: '删除中',
                    mask:true
                })
                var MD5 = md5()
                var timestamp = MD5.timestamp
                var str_md5 = MD5.str_md5
                http(`${baseUrl}/v1/contacts/deleteContacts`, {uid:member.uid,token: member.token, client: 'xcx',member_id:member.member_id,contact_id:id,sign:str_md5,timestamp:timestamp}, (res) => {
                    console.log(res)
                    if(res.code == 200){
                        this.data.contacts_list.splice(index,1)
                        if(this.data.contacts_list.length != 0){
                            if(is_default == 1){
                                // 把列表的第一个设为默认，发送请求
                                http(`${baseUrl}/v1/contacts/setDefaultContact`, {uid:member.uid,client: 'xcx',member_id:member.member_id,contact_id:this.data.contacts_list[0].id,sign:str_md5,timestamp:timestamp}, (res2) => {
                                    console.log(res2)
                                    if(res2.code == 200){
                                        this.data.contacts_list[0].is_default = 1;
                                    }else {
                                        wx.hideLoading()
                                        this.show({
                                            content:res2.msg,
                                            // duration:3000
                                        });
                                    }
                                    this.setData(this.data)
                                })

                            }
                        }
                        this.setData(this.data)

                        wx.hideLoading()
                        this.show({
                            content:'删除成功',
                            // duration:3000
                        });
                    }else {
                        wx.hideLoading()
                        this.show({
                            content:res.msg,
                            // duration:3000
                        });
                    }
                })


            }
        })

    },
    // 切换到添加联系人页面
    add_contact:function () {
      this.data.show.flag1 = false
      this.data.show.flag2 = true
        this.setData({
            show:this.data.show,
            add_or_update:true
        })
    },
    input_realname:function (e) {
        this.data.save.realname = e.detail.value
    },
    input_tel:function (e) {
        this.data.save.tel = e.detail.value

    },
    choose_boy:function () {
        this.data.save.sex = 1;
        this.setData({
            save:this.data.save
        })
    },
    choose_girl:function () {
        this.data.save.sex = 2;
        this.setData({
            save:this.data.save
        })
    },
    // 添加或者修改后的保存
    save:function () {
        var member = storage()

       var status = this.Form_Validation()
        if(!status){
           return
        }
        wx.showLoading({
            title: '保存中',
            mask:true
        })
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
            // 添加联系人
            if(this.data.add_or_update){
                http(`${baseUrl}/v1/contacts/createContacts`, {uid:member.uid,token: member.token, client: 'xcx',member_id:member.member_id,realname:this.data.save.realname,sex:this.data.save.sex,tel:this.data.save.tel,sign:str_md5,timestamp:timestamp}, (res) => {
                    console.log(res)
                    if(res.code == 200){
                        this.data.save.id = res.data.id
                        if(this.data.contacts_list.length == 0){
                            this.data.contacts_list.push(this.data.save);
                            // 如果添加的第一个则设为默认
                            http(`${baseUrl}/v1/contacts/setDefaultContact`, {uid:member.uid,client: 'xcx',member_id:member.member_id,contact_id:res.data.id,sign:str_md5,timestamp:timestamp}, (res2) => {
                                console.log(res2)
                                if(res2.code == 200){
                                    this.data.contacts_list[0].is_default = 1;
                                    this.setData(this.data)
                                }
                            })
                        }else {
                            this.data.contacts_list.splice(1, 0,this.data.save);
                        }
                        this.data.show.flag1 = true
                        this.data.show.flag2 = false
                        this.data.save = empty_data


                        this.setData(this.data)
                        wx.hideLoading()
                    }else {

                        wx.hideLoading()
                        this.show({
                            content:res.msg,
                            // duration:3000
                        });

                    }

                })
            // 修改联系人
            }else {
                http(`${baseUrl}/v1/contacts/updateContacts`, {uid:member.uid,token: member.token, client: 'xcx',member_id:member.member_id,contact_id:this.data.save.id,realname:this.data.save.realname,sex:this.data.save.sex,tel:this.data.save.tel,sign:str_md5,timestamp:timestamp}, (res) => {
                    console.log(res)
                    if(res.code == 200){

                        this.data.contacts_list.splice(this.data.index, 1);
                        // 判断，默认联系人放第一个，不是默认放第二个
                        if(this.data.save.is_default == 1){
                            this.data.contacts_list.unshift(this.data.save);
                        }else {
                            this.data.contacts_list.splice(1, 0,this.data.save);
                        }
                        this.data.show.flag1 = true
                        this.data.show.flag2 = false
                        this.data.save = empty_data
                        this.setData(this.data)
                        wx.hideLoading()
                    }else {

                        wx.hideLoading()
                        this.show({
                            content:res.msg,
                            // duration:3000
                        });
                    }
                })
            }


    },
    // 进入修改联系人页面
    update_item:function (e) {
        var item = e.currentTarget.dataset.item;
        var index = e.currentTarget.dataset.index;
        // 切换到添加联系人页面
        this.data.show.flag1 = false
        this.data.show.flag2 = true
        this.setData({
            show:this.data.show,
            save:item,
            index:index,
            add_or_update:false
        })
    },
    // 表单验证
    Form_Validation:function () {
        var regu = "^[a-zA-Z\u4e00-\u9fa5]+$";
        var re = new RegExp(regu);
        if(this.data.save.realname == ""){
            wx.hideLoading()
            this.show({
                content:'用户名不能为空',
                // duration:3000
            });
            return false
        }else if(!re.test(this.data.save.realname) || this.getByteLen(this.data.save.realname) > 10){
            wx.hideLoading()
            this.show({
                content:'姓名只能是中英文组成的1-10位字符',
                // duration:3000
            });
            return false
        }else if(!/^1[34578]\d{9}$/.test(this.data.save.tel)){
            wx.hideLoading()
            this.show({
                content:'请填写正确的电话号码',
                // duration:3000
            });
            return false
        }
        return true
    },
    // 判断当前多少字符
    getByteLen: function (val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        var a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null)
        {
            len += 2;
        }
        else
        {
            len += 1;
        }
    }
    return len;
},
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }



})