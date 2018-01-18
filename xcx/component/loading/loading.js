/**
 * Created by Administrator on 2017/12/12.
 */
let _compData = {
    '_loading_.isHide': false,// 控制组件显示隐藏
    '_loading_.content': ''// 显示的内容
}
let loadingPannel = {
    // toast显示的方法
    showload: function(data) {
        wx.hideLoading()
        this.setData({ '_loading_.isHide': true, '_loading_.content': data.content});
    },
    hideload:function () {
        wx.hideLoading()
        this.setData({ '_loading_.isHide': false})
    }
}

function LoadingPannel() {
    // 拿到当前页面对象
    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];
    // this.__page = curPage;
    // 小程序最新版把原型链干掉了。。。换种写法
    Object.assign(curPage, loadingPannel);
    // 附加到page上，方便访问d
    // curPage.toastPannel = this;
    // console.log(this)
    // 把组件的数据合并到页面的data对象中
    curPage.setData(_compData);
    // return this;
}
module.exports = {
    LoadingPannel
}