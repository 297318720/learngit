var md5 = require('../helper/md5.js').hex_md5

function formatTime(date) {
  var year = date.getFullYear()

  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatDate(date) {
    var year = date.getFullYear()

    var month = date.getMonth() + 1
    var day = date.getDate()

    return [year, month, day].map(formatNumber).join('-')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function http(url,data,callback){
    wx.request({
        url,
        data,
        method:'POST',
        header: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        success: (res) => {
            callback(res.data)
        },
        fail:(res)=>{
            wx.hideLoading()
            // callback_fail(res)
            wx.showModal({
                title: res.errMsg,
                showCancel:false,
                success: function(res) {
                    if (res.confirm) {
                        // wx.navigateBack();
                    }
                }
            })
        }
    })
}
//网路错误弹框
function error_bomb(msg) {
    wx.showModal({
        title: msg,
        showCancel:false,
        success: function(res) {
            if (res.confirm) {
                // wx.navigateBack();
            }
        }
    })
}

// 获取储存的登录数据
function storage() {
    var JSONmember = wx.getStorageSync('member')
    if(JSONmember == ""){
        return {}
    }else {
        var member = JSON.parse(JSONmember)
        return member
    }

}
// MD5签名
function hexMD5() {
    var timestamp = parseInt(new Date().getTime()/1000).toString()
    var str_md5 = md5(timestamp + '3516' + md5(md5(timestamp) + timestamp) + 'qYSBThsYaZRidJxBCe')
    return {
        timestamp,
        str_md5
    }
}


module.exports = {
    formatNumber,
  formatTime,
    formatDate,
    http,
    error_bomb,
    storage,
    hexMD5
}
