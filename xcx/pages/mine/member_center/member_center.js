var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage
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
        // avatar: "/assets/forthemoment/bar_photo@2x.png", //用户头像
        // nickname: "",  //用户昵称
        // level: "",   //用户会员等级
        // delayed: 30,  //逾期保护期限
        // birthday: 1,  //是否有生日特权 0无 1有
        // birthday_content: "",  //生日特权内容描述
        // coin: 100,  //赠送K币数量
        // free_seat: 0,  //卡座订座免预定金 0无 1有
        // title: "",  //会员等级名称
        // consume_money: "0.00",  //用户累计消费金额
        // overdue: 10,  //逾期卡数量
        // next_vip_title: "",  //下一会员等级名称
        // diff_money: 3000,   //距离下一等级需要的消费金额
        // vip_image: ""  //会员展示图片
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {


        wx.setNavigationBarTitle({
            title: "会员中心"
        });
        this.setData({
            level: options.level,

        })

        var member = storage()
        this.data.avatar = member.avatar
        this.data.nickname = member.nickname
        this.userinfo(member)
        this.vipList(member)
        this.setData(this.data)
        this.setData({
            vip_image: this.do_vip_image(parseInt(this.data.level))
        })

    },
    // 获取用户会员信息
    userinfo: function (get_member) {
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/vipInfo`, {
            token: get_member.token,
            client: 'xcx',
            member_id: get_member.member_id,
            sign:str_md5,
            timestamp:timestamp
        }, (res) => {
            console.log(res)
            this.setData({
                consume_money:res.data.consume_money ,
                diff_money: res.data.diff_money,
                next_vip_title: res.data.next_vip_title,
            })
            console.log(this.data.consume_money)


        })
    },
    vipList: function (get_member) {
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/vipList`, {token: get_member.token, client: 'xcx',sign:str_md5,timestamp:timestamp}, (res) => {
            console.log(res)
            var index = parseInt(this.data.level)
            var cur_vip_message = res.data[index-1]
            this.setData({
                birthday: cur_vip_message.birthday,
                birthday_content: cur_vip_message.birthday_content,
                coin: cur_vip_message.coin,
                delayed: cur_vip_message.delayed,
                free_seat:cur_vip_message.free_seat,
                overdue: cur_vip_message.overdue,
                title: cur_vip_message.title,

            })

        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    do_vip_image: function (a) {
        switch (a) {
            case 1:
                return "/assets/mine_image/ordinary@2x.png";
            case 2:
                return "/assets/mine_image/silver@2x.png";
            case 3:
                return "/assets/mine_image/gold@2x.png";
            case 4:
                return "/assets/mine_image/wh@2x.png";
            case 5:
                return "/assets/mine_image/diamond@2x.png";
            case 6:
                return "/assets/mine_image/bl@2x.png";
        }
    },
    into_vip_rules: function () {
        wx.navigateTo({
            url: '../vip_rules/vip_rules'
        })

    },
    into_member_level: function () {
        wx.navigateTo({
            url: `../members_level/members_level?level=${this.data.level}`
        })
    },

})