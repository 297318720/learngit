/**
 * Created by Administrator on 2017/12/18.
 */
let _compData = {
    '_showModal_.isHide': false,// 控制组件显示隐藏
    '_showModal_.content': undefined,// 显示的内容
    '_showModal_.title': '提示',// 显示的标题
    '_showModal_.showCancel': true,// 是否显示取消按钮，默认为 true
    '_showModal_.confirmText': undefined,// 确定按钮的文字，默认为"确定"，最多 4 个字符
    '_showModal_.cancelText': undefined,// 取消按钮的文字，默认为"取消"，最多 4 个字符
    '_showModal_.confirmColor': undefined,// 确定按钮的文字的颜色,默认是“#ff8027”


}
let showModalPannel = {
    // toast显示的方法
    modal: function(data) {
        wx.hideLoading()
        let self = this;
        this.setData({
            '_showModal_.isHide': true,
            '_showModal_.content': data.content,
            '_showModal_.title': data.title,
            '_showModal_.showCancel': data.showCancel,
            '_showModal_.confirmText': data.confirmText,
            '_showModal_.cancelText': data.cancelText,
            '_showModal_.confirmColor': data.confirmColor,
        });
        this.cancel =  ()=> {
            wx.hideLoading()
          // 次组件一调用，原数据_showModal_就成了未定义了，没找到原因，解决办法是下面重新setData加载一起
            console.log(_compData)
            this.setData(
                _compData
            )
            this.setData({
                '_showModal_.isHide':false
            })
            console.log(this.data)
            if(data.cancel){
                data.cancel()
            }


        }
        this.confirm = ()=>{
            wx.hideLoading()
            // 次组件一调用，原数据_showModal_就成了未定义了，没找到原因，解决办法是下面重新setData加载一起
            this.setData(
                _compData
            )
            this.setData({
                '_showModal_.isHide':false
            })
            data.confirm()
        }

    }
}
function ShowModalPannel() {
    // 拿到当前页面对象
    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];

    // this.__page = curPage;

    // 小程序最新版把原型链干掉了。。。换种写法
    Object.assign(curPage, showModalPannel);
    // 附加到page上，方便访问d
    // curPage.showModalPannel = this;
    // console.log(this)
    // 把组件的数据合并到页面的data对象中
    // console.log(_compData)
    curPage.setData(_compData);
    // console.log(curPage)

}
module.exports = {
    ShowModalPannel
}