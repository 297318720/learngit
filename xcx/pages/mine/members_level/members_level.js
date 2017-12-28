var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage
var md5 = util.hexMD5;
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
Page({
    data: {
        imgUrls:[
          "/assets/mine_image/members_ordinary@2x.png",
          "/assets/mine_image/members_silver@2x.png",
          "/assets/mine_image/members_gold@2x.png",
          "/assets/mine_image/members_wh@2x.png",
          "/assets/mine_image/members_diamond@2x.png",
          "/assets/mine_image/members_bl@2x.png",
        ],
        index:"",  //当前展示的级别，从0开始
        cur_lever:"", //该用户的当前会员级别,从1开始

        cur_data:[{
            // level: 1,   用户会员等级
            // overdue: 0,  逾期保护次数
            // delayed: 30,  逾期保护期限
            // birthday: 0,  是否有生日特权 0无 1有
            // birthday_content: "",  生日特权内容描述
            // coin: 0,  赠送K币数量
            // free_seat: 0,  卡座订座免预定金 0无 1有
            // quota: "3000", 级别对应累计消费金额
        }]
    },
    onLoad: function (options) {



        wx.setNavigationBarTitle({
            title:"会员级别"
        })
        this.setData({
            index:parseInt(options.level) -1,
            cur_lever:options.level,
        })
        var member = storage()
        var MD5 = md5()
        var timestamp = MD5.timestamp
        var str_md5 = MD5.str_md5
        http(`${baseUrl}/v1/member/vipList`,{token: member.token, client: 'xcx',sign:str_md5,timestamp:timestamp},(res)=>{
          this.setData({
              cur_data:res.data
          })
            console.log(res)
        })
    },
    change:function (e) {
        this.setData({
            index:e.detail.current
        })
    }


})