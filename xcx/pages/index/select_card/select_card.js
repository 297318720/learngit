var olddistance = 0;  //这个是上一次两个手指的距离
var newdistance;      //本次两手指之间的距离，两个一减咱们就知道了滑动了多少，以及放大还是缩小（正负嘛）
var oldscale = 1;     //这个是上一次动作留下的比例
var diffdistance;     //这个是新的比例，新的比例一定是建立在旧的比例上面的，给人一种连续的假象
var baseHeight;       //上一次触摸完之后的高
var baseWidth;        //上一次触摸完之后的宽
var windowWidth = 0;  //咱们屏幕
var windowHeight = 0; //咱们屏幕的的宽高
var  util = require('../../../utils/util.js')
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
var storage = util.storage
var http = util.http
var md5 = util.hexMD5;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        mb:false,  //是否为安卓
        // 展示平面图列表
        list: [
            // {
            //     axis_x: 789,
            //     axis_y: 742,
            //     compartment: "0",
            //     floor: "1",
            //     floor_price: "600",
            //     max_people: "3",
            //     rotate: "180",
            //     seat_number: "1",
            //     set_price: "198",
            //     title: "V",
            // },
        ], //一楼
        list_two: [
            // {
            //     axis_x: 831,
            //     axis_y: 595,
            //     compartment: "0",
            //     floor: "2",
            //     floor_price: "0",
            //     max_people: "3",
            //     rotate: "180",
            //     seat_number: "1",
            //     set_price: "98",
            //     title: "K"
            // },
        ],
        image_list: [
            // {
            //     floor: "1",
            //     image: "/assets/forthemoment/one_get@2x.png",
            //     flag: true
            // },
            // {
            //     floor: "2",
            //     image: "/assets/forthemoment/two_get@2x.png",
            //     flag: false
            // }
        ],
        imgid: "",
        baseWidth: "",
        baseHeight: "",
        newScale: 1,
        // 预定的日期
        date: "",
        // 后台拿到的总数据卡座列表的长度length
        list_length: null,
        // 最低消费2000内
        list1: [],
        // 最低消费2000-4000
        list2: [],
        // 最低消费4000+
        list3: [],
        // 下面的选择座位信息展示
        choose_it_message: {},
        flag: 1, //选座1，卡座预定2
        // 联系人信息
        contact: {
            // realname:"",
            // sex:0,
            // tel:"",
        },
        value: "", //备注信息
        number_of_people: null,
        sum: 0,
        merchant_id:null,
        order_no:"",
        begin_time:"",  //营业时间戳
        huawei:""  //兼容华为
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
       // 安卓的卡座列表样式兼容
        wx.getSystemInfo({
            success: (res)=> {
                if(res.system.indexOf("Android") != -1){
                   this.setData({
                       mb:true
                   })
                }
            }
        })

        // toast组件实例
        var app = getApp();
        // toast/showModal组件实例
        new app.ToastPannel();
        new app.ShowModalPannel();
        new app.LoadingPannel();

        wx.setNavigationBarTitle({
            title: "选择卡座"
        })
        this.setData({
            merchant_id:options.merchant_id,
            date: options.date
        })
        this.get_begin_time()  //得到营业时间戳
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        // 获取商家平面图
        http(`${baseUrl}/v1/goods/seatMap`, {client: 'xcx',merchant_id:options.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            res.data.forEach((item)=>{
                item.flag = false
            })
            res.data[0].flag = true
            if(res.code == 200){
                this.setData({
                    image_list:res.data
                })
            }
            // 获取商家卡座列表
            http(`${baseUrl}/v1/goods/seatList`, {client: 'xcx',merchant_id:options.merchant_id,date:options.date,sign:str_md5,timestamp:timestamp}, (res) => {
                console.log(res)
                if(res.code == 200){
                    res.data.forEach((item)=>{
                        item.axis_x = parseInt(item.axis_x)
                        item.axis_y = parseInt(item.axis_y)
                        if(item.floor == 1){
                            this.data.list.push(item)
                        }else if(item.floor == 2){
                            this.data.list_two.push(item)
                        }
                    })
                    this.setData(this.data)
                }
                // 拿到卡座列表数据后进行处理
                this.do_data()
            })
        })



        this.huawei()

        // 关于缩放图片的
        var res = wx.getSystemInfoSync();  //获取系统信息的同步方法，我用了异步里面提示我this.setData错了
        windowWidth = res.windowWidth;
        windowHeight = res.windowHeight;
        //那就给前面的图片进行赋值，高，宽以及路劲
    },
    get_begin_time:function () {
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        // 获取营业时间的时间戳
        http(`${baseUrl}/v1/merchant/serverTime`, {client: 'xcx',merchant_id:this.data.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res.data)
            this.setData({
                begin_time: res.data.begin_time * 1000
            })
        })
    },
    // 兼容华为
    huawei:function (e) {
        wx.getSystemInfo({
            success: (res)=> {
                console.log(res)
                if(res.brand == 'HUAWEI'){
                    this.setData({
                        huawei:"pb100"
                    })
                }
            }
        })
    },
    selectstat: function (e) {
        var key = e.currentTarget.dataset.key
        this.setData({
            key: key
        })
    },
    imgload: function (e) {
        var originalWidth = e.detail.width;//图片原始宽
        var originalHeight = e.detail.height;//图片原始高

        var originalScale = originalHeight / originalWidth;//图片高宽比
        var windowscale = windowHeight / windowWidth;//屏幕高宽比

        if (originalScale < windowscale) {//图片高宽比小于屏幕高宽比
            //图片缩放后的宽为屏幕宽
            baseWidth = windowWidth;

            baseHeight = windowWidth * originalScale
        } else {//图片高宽比大于屏幕高宽比
            //图片缩放后的高为屏幕高
            // baseHeight = windowHeight;
            // baseWidth = windowHeight / originalScale;
            baseWidth = windowWidth;

            baseHeight = windowWidth * originalScale
        }
        this.setData({
            baseWidth: baseWidth*1.2,
            baseHeight: baseHeight*1.2
        })

    },
    //两手指进行拖动了
    movetap: function (event) {
        // event.preventDefault()
        var e = event;


        if (e.touches.length == 2) {
            var xMove = e.touches[1].clientX - e.touches[0].clientX;
            var yMove = e.touches[1].clientY - e.touches[0].clientY;
            var distance = Math.sqrt(xMove * xMove + yMove * yMove);//两手指之间的距离
            if (olddistance == 0) {
                olddistance = distance; //要是第一次就给他弄上值，什么都不操作
            }
            else {
                newdistance = distance; //第二次就可以计算它们的差值了
                diffdistance = newdistance - olddistance;
                olddistance = newdistance; //计算之后更新
                var newScale = oldscale + 0.005 * diffdistance;  //比例
                if (newScale > 2) {
                    newScale = 2
                }
                if (newScale < 1) {
                    newScale = 1
                }


                //刷新.wxml
                this.setData({
                    newScale: newScale,

                })
                oldscale = newScale;
                //更新比例

            }
        }
    },
    endtap: function (event) {
        olddistance = 0;


    },
    starttap: function (event) {
        // console.log("触摸开始")


    },
    left: function () {
        var curindex;
        this.data.image_list.forEach((item, index) => {
            if (item.flag) {
                curindex = index;
                return
            }
        })
        this.data.image_list[curindex].flag = false;
        var next = curindex - 1;

        if (next < 0) {
            next = this.data.image_list.length - 1
        }

        this.data.image_list[next].flag = true;
        this.setData({
            image_list: this.data.image_list,
            scaleHeight: baseHeight,
            scaleWidth: baseWidth,
            newScale: 1
        })
        oldscale = 1


    },
    right: function () {
        var curindex;
        this.data.image_list.forEach((item, index) => {
            if (item.flag) {
                curindex = index;
                return
            }
        })
        this.data.image_list[curindex].flag = false;
        var next = curindex + 1;
        if (next > this.data.image_list.length - 1) {
            next = 0
        }
        this.data.image_list[next].flag = true;
        this.setData({
            image_list: this.data.image_list,
            scaleHeight: baseHeight,
            scaleWidth: baseWidth,
            newScale: 1
        })
        oldscale = 1

    },
    select_date: function () {
            wx.redirectTo({
              url: `../selectDate/selectDate?merchant_id=${this.data.merchant_id}&type=1`
        })
    },
    do_data: function () {
        var num = 0
        this.data.list.forEach((item)=>{
            if(item.is_lock == 0){
                num++
            }
        })
        this.setData({
            list_length: num
        })
        if (this.data.list.length == 0) {
            return
        }
        this.data.image_list.forEach((item)=>{
            item.flag = false
        })
        this.data.image_list[0].flag = true
        // 处理一楼二楼的数据再放入列表里
        this.data.list.forEach((item, index) => {
            if(item.rotate != 0 && item.rotate != 180){
                item.axis_x = item.axis_x - 28
                item.axis_y = item.axis_y + 28
            }

            item.id = index
            item.imgid = 'img' + index
            item.curchoose = false
            if (parseInt(item.floor_price) < 2000 && item.is_lock == 0) {
                this.data.list1.push(item)
            } else if (parseInt(item.floor_price) >= 2000 && parseInt(item.floor_price) < 4000 && item.is_lock == 0) {
                this.data.list2.push(item)
            } else if(item.is_lock == 0){
                this.data.list3.push(item)
            }

        })
            if(this.data.image_list.length >= 2){
                this.data.list_two.forEach((item, index) => {
                    if(item.rotate != 0 && item.rotate != 180){
                        item.axis_x = item.axis_x - 28
                        item.axis_y = item.axis_y + 28
                    }
                    item.id = 100 + index

                    item.imgid = 'img' + (index + 100)
                    // item.seat_number = formatNumber(item.seat_number)
                    item.curchoose = false
                    if (parseInt(item.floor_price) < 2000 && item.is_lock == 0) {
                        this.data.list1.push(item)
                    } else if (parseInt(item.floor_price) >= 2000 && parseInt(item.floor_price) < 4000 && item.is_lock == 0) {
                        this.data.list2.push(item)
                    } else if(item.is_lock == 0){
                        this.data.list3.push(item)
                    }
                })
            }


        // 默认选中第一个
        if (this.data.list1.length != 0) {
            this.data.list1[0].curchoose = true
            var id = this.data.list1[0].id
            this.setData({choose_it_message: this.data.list1[0]})
        } else if (this.data.list2.length != 0) {
            this.data.list2[0].curchoose = true
            var id = this.data.list2[0].id
            this.setData({choose_it_message: this.data.list2[0]})
        } else if(this.data.list3.length != 0){
            this.data.list3[0].curchoose = true
            var id = this.data.list3[0].id
            this.setData({choose_it_message: this.data.list3[0]})
        }
        this.data.list.forEach((item, index) => {
            if (item.id == id) {
                item.curchoose = true
                setTimeout(() => {
                    this.setData({
                        imgid: item.imgid
                    })
                }, 200)
            }
        })
        if(this.data.image_list.length >= 2){
            this.data.list_two.forEach((item, index) => {
                if (item.id == id) {
                    item.curchoose = true
                    this.data.image_list[0].flag = false
                    this.data.image_list[1].flag = true
                    this.setData({
                        image_list: this.data.image_list,
                    })
                    setTimeout(() => {
                        this.setData({
                            imgid: item.imgid
                        })
                    }, 200)
                }
            })
        }

        // 更新数据
        this.setData(this.data)
    },
    choose_it: function (e) {
        console.log(e.currentTarget.dataset.item)
        var id = e.currentTarget.dataset.id
        var type = e.currentTarget.dataset.type
        var is_lock = e.currentTarget.dataset.is_lock
        var floor = e.currentTarget.dataset.item.floor
        if(is_lock == 1){
            return
        }
        // console.log(id)
        // console.log(floor)
        // 自动切换楼层
        if(this.data.image_list.length == 2){
            if (floor == 1) {
                this.data.image_list[0].flag = true
                this.data.image_list[1].flag = false

            } else {
                this.data.image_list[0].flag = false
                this.data.image_list[1].flag = true
            }
            // 这个更新必须写前面，不然定位在切换页面的时候如果事先上下拖动，定位的时候上下拖动的距离会保持导致定位不到
            this.setData({
                image_list: this.data.image_list
            })
          }



        // 选中1楼卡座
        this.data.list.forEach((item) => {
            item.curchoose = false
        })
        this.data.list.forEach((item) => {
            if (item.id == id) {
                item.curchoose = true
                this.data.imgid = item.imgid
            }
        })
        if(this.data.image_list.length >= 2) {
            // 选中2楼卡座
            this.data.list_two.forEach((item) => {
                item.curchoose = false
            })
            this.data.list_two.forEach((item) => {
                if (item.id == id) {
                    item.curchoose = true
                    this.data.imgid = item.imgid
                }
            })
        }


        // 清空所有的选中状态
        this.data.list1.forEach((item) => {
            item.curchoose = false
        })
        this.data.list2.forEach((item) => {
            item.curchoose = false
        })
        this.data.list3.forEach((item) => {
            item.curchoose = false
        })

        // 选中下面卡座点击的那一个
        this.data.list1.forEach((item) => {
            if (item.id == id) {
                item.curchoose = true
            }
        })
        this.data.list2.forEach((item) => {
            if (item.id == id) {
                item.curchoose = true
            }
        })
        this.data.list3.forEach((item) => {
            if (item.id == id) {
                item.curchoose = true
            }
        })
        // 更新数据
        this.setData({
            choose_it_message: e.currentTarget.dataset.item,
            list1: this.data.list1,
            list2: this.data.list2,
            list3: this.data.list3,
            list: this.data.list,
            list_two: this.data.list_two,
            imgid: this.data.imgid,

        })
        // 如果点下面的卡座就把缩放弄到1倍
        if (type == 2) {
            this.setData({
                newScale: 1
            })
            oldscale = 1
        }

    },

    // 卡座预定的JS
    into_contacts_message: function () {
        wx.navigateTo({
            url: '../contacts_message/contacts_message'
        })
    },
    input: function (e) {
        this.setData({
            sum: e.detail.value.length,
            value: e.detail.value
        })

    },
    into_confirm_order: function () {
        if (!this.data.number_of_people) {
            wx.hideLoading()
            this.show({
                content:'请填写到店人数',
                // duration:3000
            });
            return
        }
        if (this.isEmptyObject(this.data.contact)) {
            wx.hideLoading()
            this.show({
                content:'请选择联系人',
                // duration:3000
            });
            return
        }

        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        var obj = {
            merchant_id:this.data.merchant_id,
            member_id:member.member_id,
            seat_id:this.data.choose_it_message.seat_id,
            client:'xcx',
            sign:str_md5,
            timestamp:timestamp
        }
        console.log(obj)
        // 卡座确认订单时显示优惠金额
        http(`${baseUrl}/v1/goods/discount`,{
            merchant_id:this.data.merchant_id,
            member_id:member.member_id,
            seat_id:this.data.choose_it_message.seat_id,
            client:'xcx',
            sign:str_md5,
            timestamp:timestamp
        },(res)=>{
            console.log(res)
            if(res.code == 200){
                var data = {}
                data.date = this.data.date
                data.message = this.data.choose_it_message
                data.contact = this.data.contact
                data.value = this.data.value
                data.number_of_people = this.data.number_of_people
                data.pay_price = res.data.pay_price
                data.discount_money = res.data.discount_money
                data = JSON.stringify(data)
                wx.navigateTo({
                    url: `../confirm_order/confirm_order?data=${data}&type=1&order_no=${this.data.order_no}&merchant_id=${this.data.merchant_id}&begin_time=${this.data.begin_time}`
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
    // 判断是否为空对象
    isEmptyObject: function (obj) {
        for (var key in obj) {
            return false
        }
        ;
        return true
    },
    person_number: function (e) {
        console.log(e.detail.value)
        if(e.detail.value > 20){
            this.setData({
                number_of_people:20
            })
        }else if(e.detail.value === "0"){
            this.setData({
                number_of_people:1
            })
        }else {
            this.setData({
                number_of_people: e.detail.value
            })
        }

    },

    login:function () {
        wx.login({
            success:  (res) =>{
                wx.getUserInfo({
                    success:  (user)=> {
                        wx.showLoading({
                            title: '正在登陆',
                        })
                        if (res.code) {
                            //发起网络请求
                            var MD5 = md5()
                            var timestamp = MD5.timestamp
                            var str_md5 = MD5.str_md5
                            http(`${baseUrl}/v1/member/wxlogin`,{code: res.code, iv: user.iv, encryptedData: encodeURIComponent(user.encryptedData),sign:str_md5,timestamp:timestamp},(res)=>{
                                console.log(res)
                                wx.hideLoading()
                                var jsondata = JSON.stringify(res.data)
                                wx.setStorageSync('member', jsondata)

                            })
                        }else {
                            wx.hideLoading()
                            console.log("code不存在")
                        }
                        console.log(res.code)

                    },
                    fail: ()=> {
                        console.log('获取接口调用失败' + res.errMsg + res)
                        // wx.showModal({
                        //     content: '监测到您没开打空瓶子的用户信息权限，是否去设置打开？',
                        //     confirmText:'确认',
                        //     success: (res) =>{
                        //         if (res.confirm) {
                        //             wx.hideLoading()
                        //             this.openSetting()
                        //         } else if (res.cancel) {
                        //             wx.hideLoading()
                        //             console.log('用户点击取消')
                        //         }
                        //     }
                        // })
                        this.modal({
                            content:"监测到您没开打空瓶子的用户信息权限，是否去设置打开？",
                            confirm:()=>{
                                this.openSetting()
                            }
                        })
                    }
                });
            }
        });

    },
    openSetting:function () {
        wx.openSetting({
            success: (res) => {
                setTimeout(()=>{
                    wx.getSetting({
                        success: (res) => {
                            if(res.authSetting["scope.userInfo"]){
                                wx.showLoading({
                                    title: '正在登陆',
                                    mask:true
                                })
                                this.login()
                            }
                        }
                    })
                },300)

            },

        })
    },
    submit:function (e) {
        wx.showLoading({
            title: '加载中',
            // mask:true
        })
        var JSONmember = wx.getStorageSync('member')
        if(JSONmember != ""){
            var member = JSON.parse(JSONmember)
            console.log('不为空')
            var MD5 = md5()
            var timestamp = MD5.timestamp
            var str_md5 = MD5.str_md5
            http(`${baseUrl}/v1/Member/verifyToken`,{token:member.token,sign:str_md5,timestamp:timestamp},(res)=>{
                console.log(res)
                if(res.code != 200){
                    console.log('登录状态失效')
                    this.login()
                }else {
                    console.log('登录状态未失效')
                    http(`${baseUrl}/v1/member/verifyBindPhoneNumber`,{token:member.token,client: 'xcx',unionid:member.unionid,sign:str_md5,timestamp:timestamp},(res)=>{
                        console.log(res)
                        if(res.code != 200){
                            // wx.showModal({
                            //     title: '提示',
                            //     content: '需要您绑定手机号并验证',
                            //     showCancel:false,
                            //     confirmText:'去绑定',
                            //     success: (res) =>{
                            //         if (res.confirm) {
                            //             console.log('用户点击确定')
                            //             wx.hideLoading()
                            //             wx.navigateTo({
                            //                 url: `../bind_phone/bind_phone`
                            //             })
                            //         }
                            //     }
                            // })
                            this.modal({
                                content:"需要您绑定手机号并验证",
                                showCancel:false,
                                confirmText:'去绑定',
                                confirm:()=>{
                                    wx.navigateTo({
                                        url: `../bind_phone/bind_phone`
                                    })
                                }
                            })

                        }else {
                            //判断之前订过这个卡座没
                           var id = this.data.choose_it_message.seat_id
                            var obj = {client: 'xcx',token:member.token,merchant_id:this.data.merchant_id,member_id:member.member_id,seat_id:id,date:this.data.date,sign:str_md5,timestamp:timestamp}
                            console.log(obj)
                            http(`${baseUrl}/v1/goods/checkSeat`,{client: 'xcx',token:member.token,merchant_id:this.data.merchant_id,member_id:member.member_id,seat_id:id,date:this.data.date,sign:str_md5,timestamp:timestamp},(res)=>{
                                console.log(res)
                                if(res.code == 200){
                                    wx.hideLoading()
                                    this.card_yuding()
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

                }
            })
        }else {
            this.login()
        }



    },
    // 卡座预定页面初始化
    card_yuding:function () {
        this.setData({
            flag: 2
        })
        wx.setNavigationBarTitle({
            title: "卡座预定"
        });
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        // 获取默认联系人
        http(`${baseUrl}/v1/contacts/contactsList`, {client: 'xcx',member_id:member.member_id,sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            if(res.code == 200){
                res.data.list.forEach((item)=>{
                    if(item.is_default == 1){
                        this.setData({
                            contact:item
                        })
                    }
                })
            }

        })

    },
    onUnload:function () {
        console.log('选座页面被销毁')
        // var MD5 = md5()
        // var timestamp = MD5.timestamp
        // var str_md5 = MD5.str_md5
        // http(`${baseUrl}/v1/goods/releaseGoods`, {str: '你好',sign:str_md5,timestamp:timestamp}, (res) => {
        //     console.log(res)
        //
        // })
    },
    onHide:function () {
        setTimeout(()=>{
            wx.hideLoading()
        },500)
    }


})