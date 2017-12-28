var util = require('../../../utils/util.js');
var http = util.http;
var storage = util.storage;
var md5 = util.hexMD5;
var {
    globalData
} = getApp()
var baseUrl = globalData.baseUrl;
    Page({
        data: {
            type:"",  //为1是从选择卡座页面进来的，为空是商品详情进来的
            merchant_id:null,
            outdated:false,  //是否已经营业
            scrolly:true,
            count: "",   //显示月的列表数,自动添加不固定
            days: "",   //能选择的天数
            start:null,
            months: [],
            dates: [],
            zh: {
                split: "-",
            },
            festivaltag: {
                "1-1": ["元旦"],
                "2-14": ["情人节"],
                "3-8": ["妇女节"],
                "4-4": ["清明"],
                "5-1": ["劳动节"],
                "6-1": ["儿童节"],
                "8-1": ["建军"],
                "9-10": ["教师节"],
                "10-1": ["国庆"],
                "12-24": ["平安夜"],
                "12-25": ["圣诞节"]
            },
            cnfestivaltag: {
                "2016-2-7": ["除夕"],
                "2016-2-8": ["春节"],
                "2016-2-22": ["元宵节"],
                "2016-5-1": ["劳动节"],
                "2016-6-9": ["端午节"],
                "2016-6-19": ["父亲节"],
                "2016-7-1": ["建党"],
                "2016-8-9": ["七夕"],
                "2016-8-17": ["中元节"],
                "2016-9-15": ["中秋节"],
                "2017-10-28": ["重阳节"],
                "2016-10-31": ["万圣节"],
                "2016-11-24": ["感恩节"],
                "2017-1-5": ["腊八"],
                "2017-1-23": ["小年"],
                "2017-1-27": ["除夕"],
                "2017-2-11": ["元宵节"]
            },

            scrollViewHeight: 600, //scroll-view默认高度

        },

        onLoad: function(options) {
            // toast组件实例
            var app = getApp();
            new app.ToastPannel();

              this.setData({
                  merchant_id:options.merchant_id
              })
          if(options.type){
                this.setData({
                    type:1
                })
          }

            var MD5 = md5()
            var timestamp = MD5.timestamp
            var str_md5 = MD5.str_md5
            // 获取当前时间和商家营业时间判断时候营业无法预定今天的
            http(`${baseUrl}/v1/merchant/serverTime`, {client: 'xcx',merchant_id:options.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
                console.log(res)
                console.log(new Date(res.data.now_time*1000))
                this.setData({
                    start:new Date(res.data.now_time*1000)
                })
                if(res.code == 200){
                    if(res.data.now_time < res.data.begin_time){
                        this.setData({
                            outdated:false
                        })
                    }else {
                        this.setData({
                            outdated:true
                        })
                    }
                // 获取商家预定周期时间
                    http(`${baseUrl}/v1/merchant/preordainCycle`, {client: 'xcx',merchant_id:options.merchant_id,sign:str_md5,timestamp:timestamp}, (res) => {
                        console.log(res)
                        if(res.code == 200){
                            console.log(res.data.preordain_cycle)
                            this.setData({
                                days:res.data.preordain_cycle
                            })
                            this.do_data()
                        }
                    })
                }
            })




            wx.setNavigationBarTitle({
                title:'选择日期'
            });


        },
        do_data:function () {
            var _this = this,
                _today = this.data.start,
                _dates = [],
                _months = []
            var day = _today.getDate();
            var nDays = new Date(_today.getFullYear(), _today.getMonth() + 1, 0).getDate(); //当前月份的天数
            var nDays2 = new Date(_today.getFullYear(), _today.getMonth() + 2, 0).getDate();//下个月份的天数
            var nDays3 = new Date(_today.getFullYear(), _today.getMonth() + 3, 0).getDate();//第三月份的天数
            var nDays4 = new Date(_today.getFullYear(), _today.getMonth() + 4, 0).getDate();//第四月份的天数
            var nDays5 = new Date(_today.getFullYear(), _today.getMonth() + 4, 0).getDate();//第五月份的天数
            var curMonthUseday = nDays - day +1;
            if(this.data.days <= curMonthUseday){
                this.setData({
                    count:1,
                    scrolly:false
                })
            }else if(this.data.days - curMonthUseday <= nDays2 ){
                this.setData({
                    count:2,
                    scrolly:true
                })
            }else if(this.data.days - curMonthUseday <=nDays2 + nDays3 ){
                this.setData({
                    count:3,
                    scrolly:true
                })
            }else if(this.data.days - curMonthUseday <= nDays2 + nDays3 + nDays4){
                this.setData({
                    count:4,
                    scrolly:true
                })
            }else if(this.data.days - curMonthUseday <= nDays2 + nDays3 + nDays4 + nDays5){
                this.setData({
                    count:5,
                    scrolly:true
                })
            }

            //     {
            //     this.setData({
            //         count:Math.ceil((this.data.days - (nDays - day + 1))/30) + 1
            //     })
            // }
            // data.dates压栈
            for (var i = 0; i < _this.data.count; i++) {
                var _newDate = new Date(_today.getFullYear(), _today.getMonth() + i, 1)
                _months.push(_newDate.getFullYear() + '年' + (_newDate.getMonth() + 1) + '月')
                _dates.push(_this.createDate(_newDate))
            }
            // console.log(_dates)
            _this.setData({
                dates: _dates,
                months: _months
            })
        },
        select: function(e) {
            // var day = e.target.dataset.value;
            if(e.currentTarget.dataset.classnames == "outdated"){
                wx.hideLoading()
                this.show({
                    content:'已到营业时间不能预定',
                    // duration:3000
                });
            }
            if(e.currentTarget.dataset.classnames != "enable"){
                       return
            }
            var value = e.target.dataset.value;
            if(this.data.type == 1){
                wx.redirectTo({
                    url: `../select_card/select_card?date=${value}&merchant_id=${this.data.merchant_id}`
                })
            }else {
                var pages = getCurrentPages();
                var currPage = pages[pages.length - 1];  //当前页面
                var prevPage = pages[pages.length - 2]; //上一个页面
                prevPage.setData({
                    date2:value
                })
                wx.navigateBack();
            }




        },
        getShowDate: function(index, tempDateStr) {
           var _today = this.data.start
            var txt = new Date(tempDateStr);
            var festival;
            if (!txt) {
                return;
            }
            festival = this.getFestivaltag([txt.getFullYear(), txt.getMonth() + 1, txt.getDate()].join('-'));
            for (var p=0;p< 3; p++){
                var curDate = new Date(_today.getFullYear(), _today.getMonth() , _today.getDate()+p)
            if(this.getDateString(curDate) == tempDateStr){
                switch(p)
                {
                    case 0:
                        festival="今天"
                        break;
                    case 1:
                        festival="明天"
                        break;
                    case 2:
                        festival="后天"
                        break;
                }
            }
        }
            return festival || txt.getDate();
        },
         formatNumber:function(n) {
                n = n.toString()
                return n[1] ? n : '0' + n
       },
        getDateString: function(date, split) {
            split = split || this.data.zh.split;
            var tempArr = [date.getFullYear(),this.formatNumber(date.getMonth() + 1) ,this.formatNumber(date.getDate())];
            return tempArr.join(split);
        },
        getDay: function(tempDate, tempDateStr, day) {
            var fest = this.data.festivaltag[tempDateStr] || "";
            var select = this.select;
            var ret = "";
            ret = day;
            return ret;
        },
        getFestivaltag: function(date) {
            var md = [date.split('-')[1], date.split('-')[2]].join('-');
            return this.data.festivaltag[md] || this.getCnfestivaltag(date);
        },
        getCnfestivaltag: function(date) {
            return this.data.cnfestivaltag[date];
        },
        getItemClass: function(tempDateStr) {
            var _today = this.data.start
            for (var p=0;p< this.data.days; p++){
              var curDate = new Date(_today.getFullYear(), _today.getMonth() , _today.getDate()+p)
              if(this.getDateString(curDate) == tempDateStr){

                  return "enable"
              }
            }
        },
        createDate: function(date) {
            var returnValue = [];
            var day = date.getDate();
            var beginDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
            var nDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            var pushObj = {
                day: "",
                value: "",
                showDay: ""
            };

            var len = 43 - (42 - nDays - beginDay);
            for (var i = 1; i < len; i++) {
                var tempDate = new Date(date.getFullYear(), date.getMonth(), (i - beginDay));
                var tempDateStr = this.getDateString(tempDate);
                if (i > beginDay && i <= nDays + beginDay) {
                    // console.log(tempDateStr)

                    var _class = this.getItemClass(tempDateStr);
                    pushObj = {
                        value: tempDateStr,
                        showDay: this.getShowDate(i,tempDateStr),  //展示给页面的内容，比如是今天或者是3号
                        classNames: _class,
                    };
                    if(tempDateStr == this.getDateString(this.data.start) && this.data.outdated){
                        pushObj.classNames = "outdated"
                    }
                }
                returnValue.push(pushObj);
            }
            return returnValue;
        },

    });

