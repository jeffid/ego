/* Slider 轮播图 ******************************************/
(function (App) {
    function Slider(options) {
        _.extend(this, options); // 继承container、图片链接组
        this.createTemplate();
        this.sliderItems = [].slice.call(this.sliderList.children);
        this.indicatorBtns = [].slice.call(this.sliderIndicator.children);
        // 上一个索引
        this.lastIndex = null;
        // 当前索引
        this.index = 0; //默认第一个
        // 定时器 指针
        this.timer = null;
        this.interval = 5000;

        this.autoPlay();
        // 暂停轮播条件侦听
        this.sliderList.addEventListener("mouseenter", function () {
            //console.log("MOUSEENTER: stop");
            //console.log(this.stopPlay);
            this.stopPlay();
        }.bind(this));
        // 重启轮播侦听
        this.sliderList.addEventListener("mouseleave", function () {
            //console.log("MOUSELEAVE: play");
            this.autoPlay();
        }.bind(this));
        // 根据点击的指示器跳转到指定的图片
        this.indicatorBtns.forEach(function (item, idx) {
            //IE9+
            var that = this;
            item.addEventListener("click", function () {
                //console.log("CLICK:",idx);
                that.shift(idx); //已经在闭包里了
            });
            /*
             // 这里是鼠标hover也进行跳转，非项目要求
             item.addEventListener("mouseover", function () {
             //var idx = Number(e.target.dataset.index);
             that.shift(idx);
             });
             */
        }.bind(this));
    }

    Slider.prototype.createTemplate = function () {
        //console.log("生成html")
        this.mSlider = document.createElement("div");
        // 图片容器
        this.sliderList = document.createElement("ul");
        // 指示器容器
        this.sliderIndicator = document.createElement("div");
        var items = "",
            btns = "";
        //console.log(this.imgList.length)

        for (var i = 0; i < this.imgList.length; i++) {
            // 单项图片html结构
            items += '<li class="slider_item"><a href="' + i + '" class="slider_item_lk"><img src="' + this.imgList[i] + '" alt="" class="slider_item_img"></a></li>';
            // 单项指示器html结构
            btns += '<i class="slider_indicator_btn" data-index="' + i + '"></i>';
        }
        this.sliderList.innerHTML = items;
        this.sliderIndicator.innerHTML = btns;
        /* 加入样式名 */
        this.mSlider.className = "m-slider";
        this.sliderList.className = "slider_list";
        this.sliderIndicator.className = "slider_indicator";
        /* 加入到文档节点 */
        this.mSlider.appendChild(this.sliderList);
        this.mSlider.appendChild(this.sliderIndicator);
        this.container.appendChild(this.mSlider);
    };
    Slider.prototype.next = function () {
        /* 得到下个循环索引 */
        this.index = ++this.index % this.sliderItems.length;

    };
    Slider.prototype.fade = function () {
        /* 图片显隐切换 */
        // 将上一个显示的图片隐藏
        if (this.lastIndex !== null) {
            //不全等于null，即初始化时不执行
            //this.sliderItems[this.lastIndex].style.opacity = "0";
            _.delClassname(this.sliderItems[this.lastIndex], "z-active");
        }
        // 显示当前图片
        //this.sliderItems[this.index].style.opacity = "1";
        _.addClassname(this.sliderItems[this.index], "z-active"); //层叠在最上，以便点击
    };
    Slider.prototype.setActiveIndicatorBtn = function () {
        /* 指示按钮显隐切换 */
        if (this.lastIndex !== null) {
            _.delClassname(this.indicatorBtns[this.lastIndex], "z-active");
        }
        _.addClassname(this.indicatorBtns[this.index], "z-active");
    };
    Slider.prototype.turn = function () {
        /* 一次切换的完整流程 */
        // 切换图片
        this.fade();
        // 切换指示器
        this.setActiveIndicatorBtn();
        // 改写最近一次索引值
        this.lastIndex = this.index;
        // 获取下次索引值
        this.next();
    };
    Slider.prototype.autoPlay = function () {
        var that = this;
        clearInterval(this.timer);
        // 首次加载即进行一次切换
        that.turn();
        // 循环切换
        that.timer = setInterval(function () {
            that.turn();
        }, that.interval);
    };
    Slider.prototype.stopPlay = function () {
        //console.log("timer:",this.timer);
        //console.log("interval:",this.interval);
        //console.log("this:",this);
        clearTimeout(this.timer);
    };
    Slider.prototype.shift = function (idx) {
        /* 指示器触发时调用的单张切换方法 */
        this.index = idx;
        this.autoPlay();
    };

    App.Slider = Slider;
})(window.App);

/** StarList 明日之星列表 *****************************************/
(function (App) {

    function StarList(container, data) {
        this.container = container;
        this.starsDataArr = data;
        this.btnConfig = [
            {
                btnClass: "z-unfollow u-btn-default",
                text: "关注",
                iconClass: "u-icon-unfollow"
            },
            {
                btnClass: "z-follow u-btn-primary",
                text: "已关注",
                iconClass: "u-icon-follow"
            }
        ];
        this.render(this.starsDataArr);
        this.followHandler();

    }

    StarList.prototype.render = function (starsDataArr) {
        var html = "";
        // 明星数组循环代入字串
        starsDataArr.forEach(function (item) {
            html += this.renderItem(item);
        }.bind(this));
        // 加入文档节点
        this.container.innerHTML = html;

        //this.followHandler(); //若是这个位置侦听，会会出现重复事件，单击变双击~


    };
    StarList.prototype.renderItem = function (itemData) {
        var btnConfig = this.btnConfig[Number(!!itemData.isFollow)];
        var context = {
            id: itemData.id,
            nickname: itemData.nickname,
            workCount: itemData.workCount,
            followCount: itemData.followCount,
            btnClass: btnConfig.btnClass,
            text: btnConfig.text,
            iconClass: btnConfig.iconClass
        };
        var source = '<li class="section_item m-card f-middlefix" data-starid="{{id}}"><img src="../res/images/null1.png" alt="" class="section_item_img card_avatar"><p class="card_info"><a href="#" class="name">{{nickname}}</a>作品&nbsp;<span>{{workCount}}</span>&nbsp;&nbsp;粉丝&nbsp;<span>{{followCount}}</span></p><button class="{{btnClass}} u-btn"><i class="u-icon {{iconClass}}"></i>{{text}}</button></li>';
        return _.renderItem(source, context);
    };

    StarList.prototype.follow = function (starItem, idx) {
        var that = this;
        _.ajax({
            url: "/api/users?follow",
            method: "POST",
            data: {id: Number(starItem.dataset.starid)},
            success: function () {
                //console.log(" 关注事件");
                // 更改数据
                that.starsDataArr[idx].followCount += 1;
                that.starsDataArr[idx].isFollow = true;
                // 替换原来li项
                starItem.outerHTML = that.renderItem(that.starsDataArr[idx]);
            }
        })
    };
    StarList.prototype.unfollow = function (starItem, idx) {
        var that = this;
        _.ajax({
            url: "/api/users?unfollow",
            method: "POST",
            data: {id: Number(starItem.dataset.starid)},
            success: function () {
                //console.log("取消关注");
                // 更改数据
                that.starsDataArr[idx].followCount -= 1;
                that.starsDataArr[idx].isFollow = false;
                // 替换原来li项
                starItem.outerHTML = that.renderItem(that.starsDataArr[idx]);
            }
        })
    };
    StarList.prototype.followHandler = function () {
        var that = this;
        // 事件代理到列表容器上
        this.container.addEventListener("click", function (e) {
            var it = e.target;
            // 阻止重复触发
            //e.stopImmediatePropagation();
            // 只在目标是按钮时进行操作
            if (it.classList.contains("u-btn")) {
                // 明星项，数组列表,每次点击会更新获取节点
                that.starItems = [].slice.call(that.container.children);
                // 当前列表项的索引
                var idx = that.starItems.indexOf(it.parentNode);
                console.log(idx, it.parentNode);
                // 有用户信息，即已登录的情况
                if (!!App.user) {
                    // 有关注状态的进行取关操作
                    if (it.classList.contains("z-follow")) {
                        that.unfollow(it.parentNode, idx);
                    }
                    else {
                        that.follow(it.parentNode, idx);
                    }
                }
                // 还没登录的情况下的反应
                else {
                    console.log("关注前没登录，弹出一个登录框");
                    // 给document 一个 goLogin事件
                    _.emitEvent(document, "goLogin");
                }
            }
        });
    };
    /*
     * 页头加载完后可获得登录与否信息，此时初始化明日之星
     *
     * 未登录时从服务器获取数据，加载默认列表
     * 未登录时点关注弹出登录登录框
     *
     * 登录状态下获取的数据，应根据登录用户显示关注情况
     * 登录时点关注，发送数据，修改本地数据，并更新整个明星状态
     * 登录时点取关，发送数据，修改本地数据，并更新整个明星状态
     *
     * */
    /*******************************************/
    App.StarList = StarList;
})(window.App);

/* Modal*************/
(function (App) {
    // 这个Modal的功能仅限用于登录、注册模块的关闭和显示错误信息
    function Modal() {
    }

    Modal.prototype.show = function () {
        this.container.classList.remove("f-dn");//在继承原型的原型的 实例中定义container
    };
    Modal.prototype.hide = function () {
        this.container.classList.add("f-dn");//在继承原型的原型的实例中定义container
    };
    Modal.prototype.showCurtain = function () {
        !!this.curtain && this.curtain.classList.remove("f-dn");
    };
    Modal.prototype.hideCurtain = function () {
        !!this.curtain && this.curtain.classList.add("f-dn");
    };
    Modal.prototype.init = function () {
        var that = this;
        /* 隐藏 ****/
        this.curtain.addEventListener("click", function () {
            that.hide();
            that.hideCurtain(); //单独处理的背景遮罩隐藏

        });
        this.nClose.addEventListener("click", function () {
            that.hide();
            that.hideCurtain();
        });
    };
    // 显示错误信息
    Modal.prototype.showError = function (text) {
        this.nErrBar.parentNode.classList.remove("f-dn");
        this.nErrBar.innerText = text;
    };
    App.Modal = Modal;
})(window.App);

/* 获得日期数据 genCalendar ***********/
(function (App) {
    function genCalendar(start, end) {
        var calendar = [];
        var start = (start !== undefined) ? start : 1970,
            end = (end !== undefined) ? end : new Date().getFullYear();
        /* 循环年 */
        for (var y = start; y <= end; y++) {
            var yArr = [];
            yArr[2] = [];
            yArr[0] = y.toString();
            yArr[1] = y + "年";

            /* 循环月 */
            for (var m = 1; m <= 12; m++) {
                var mArr = [];
                mArr[2] = [];
                mArr[0] = m.toString();
                mArr[1] = m + "月";

                /* 循环日 */
                /* 获得当月天数 */
                var days = new Date(y, m, 0).getDate();
                //console.log(days);
                for (var d = 1; d <= days; d++) {
                    var dArr = [];
                    //var dArr[2]=[];
                    dArr[0] = d.toString();
                    dArr[1] = d + "日";
                    mArr[2].push(dArr);
                } // deep3
                yArr[2].push(mArr);
            }  // deep2
            calendar.push(yArr);
        } // deep1
        //console.log(calendar);
        return calendar;
    }

    App.genCalendar = genCalendar;
})(window.App);
/**********************************/


/* 登录 **********************/
(function (App) {

    function Login() {
        var that = this;
        // 登录框背后的幕布
        this.curtain = _.$(".u-curtain");
        // 整个登录框的容器
        this.container = _.$("#login_panel");
        // 关闭按钮
        this.nClose = _.$("#login_panel .close");
        // 错误信息提示框
        this.nErrBar = _.$("#login_panel .error_msg");
        // 页头中跳转到登录界面的按钮
        this.nLoginBtn = _.$("#login");
        // 跳到注册界面的按钮
        this.nRegister = _.$("#login_panel .register_lk");

        // 登录表单
        this.nForm = document.forms["login"];
        this.nUsername = this.nForm["username"];
        this.nPassword = this.nForm["password"];
        this.nRemember = this.nForm["remember"];


        this.init();
        /* 响应监听，显示弹窗*/
        document.addEventListener("goLogin", function () {
            that.show();
            that.showCurtain();
        });

        /* 切换到注册面板时，关闭弹窗*/
        document.addEventListener("goRegister", function () {
            that.hide();//
        });
        document.addEventListener("ok", function () {
            that.hide();//
            that.hideCurtain();
        });

        // 发出跳到登录界面事件
        this.nLoginBtn.addEventListener("click", function () {
            _.emitEvent(document, "goLogin");
        });
        // 发出跳到注册界面事件
        this.nRegister.addEventListener("click", function () {
            _.emitEvent(document, "goRegister");
        });

        /* 提交处理 */
        this.nForm.addEventListener("submit", function (e) {
            e.preventDefault();
            that.submit();
        })
    }

    // 继承Modal上的关闭方法
    Login.prototype = Object.create(App.Modal.prototype);
    // 检查输入值是否合法
    Login.prototype.check = function () {
        var username = this.nUsername.value,
            password = this.nPassword.value;
        // 检查用户名，非法边框变红
        var isValid = App.validator.isFill(username) && App.validator.isPhone(username);
        if (!isValid) {
            _.addClassname(this.nUsername, "z-error");
            return false
        }
        // 检查密码，非法边框变红
        isValid = App.validator.isFill(password);
        if (!isValid) {
            _.addClassname(this.nPassword, "z-error");
            return false
        }
        return isValid;

    };
    Login.prototype.submit = function () {
        var that = this;
        if (!this.check()) return;
        //console.log("登录验证通过");
        var data = {
            username: that.nUsername.value,
            password: hex_md5(that.nPassword.value),
            remember: !!that.nRemember.checked
        };
        //console.log(data);
        _.ajax({
            url: "/api/login",
            method: "POST",
            data: data,
            success: function (response) {
                console.log("得到返回", response.code);
                if (response.code === 200) {
                    // 发出ok事件，后续会执行关闭登录框操作
                    _.emitEvent(document, "ok");
                    // 重载页头
                    App.header.initLoginStatus();
                    //App.header.initUserInfo(response.result);
                    //window.App.user = response.result;
                }
                else {
                    switch (response.code) {
                        case 400:
                        {
                            that.showError("密码错误，请重新输入");
                            break;
                        }
                        case 404:
                        {
                            that.showError("用户名错误，请重新输入");
                            break;
                        }
                    }
                }
            }
        })

    };
    /*
     * 监听注册链接、登录按钮，收到事件发出相应的自定动作事件
     * 根据动作事件控制显示、隐藏相应面板
     *
     * 触发登录，验证表单数据，无误提交，有误提醒
     * 登录响应码异常显示错误提醒
     * 输入错误输入框会红边，有文字提示
     * 提交的数据要加密
     * 点击非面板区域关闭面板
     *
     * 登录成功，保存用户信息于本地
     * 刷新明星列表
     * 显示右上角用户信息下拉框
     *
     *
     * */


    App.Login = Login;
})(window.App);


/* 注册 **************************************/
(function (App) {
    function Register() {
        // 日期级联选择器，从1950开始
        this.dateCascade = new App.Cascade(_.$(".m-cascade-date"), App.genCalendar(1950));
        // 地址级联选择器
        this.addressCascade = new App.Cascade(_.$(".m-cascade-address"), ADDRESS_CODES);
        // 遮盖幕布
        this.curtain = _.$(".u-curtain");
        // 注册框容器
        this.container = _.$("#register_panel");
        // 关闭按钮
        this.nClose = _.$("#register_panel .close");
        // 错误信息框
        this.nErrBar = _.$("#register_panel .error_msg");
        // 页头转注册按钮
        this.nLoginBtn = _.$("#register");
        // 验证码图片
        this.nCaptchaImg = _.$("#register_panel .captchaimg");
        // 日期级联结果存放的节点组
        this.nBirthday = [].slice.call(_.$$("#register_panel .m-cascade-date .select_val"));
        // 地址结果节点组
        this.nAddress = [].slice.call(_.$$("#register_panel .m-cascade-address .select_val"));

        // 表单元素
        this.nForm = document.forms["register"];
        this.nUsername = this.nForm["username"];
        this.nNickname = this.nForm["nickname"];
        this.nPassword = this.nForm["password"];
        this.nConirmpsw = this.nForm["confirmpsw"];
        this.nSex = this.nForm["sex"];
        this.nReaded = this.nForm["readed"];
        this.nCaptcha = this.nForm["captcha"];


        this.init();//继承函数，对关闭进行监听
        this.listener();
    }

    Register.prototype = Object.create(App.Modal.prototype);
    Register.prototype.listener = function () {
        var that = this;
        /* 响应监听，显示弹窗*/
        document.addEventListener("goRegister", function () {
            that.show();
            that.showCurtain();
        });

        /* 切换到登录面板时，关闭弹窗*/
        document.addEventListener("goLogin", function () {
            that.hide();//
        });
        /* 提交处理 */

        // 刷新验证码
        this.nCaptchaImg.addEventListener("click", function () {
            that.resetCaptcha();
        });
        // 跳到注册界面事件
        this.nLoginBtn.addEventListener("click", function () {
            _.emitEvent(document, "goRegister")
        });
        // 提交
        this.nForm.addEventListener("submit", function (e) {
            e.preventDefault();
            that.submit();
        });

    };
    Register.prototype.resetCaptcha = function () {
        this.nCaptchaImg.src = "/captcha?t=" + Date.now();
    };
    Register.prototype.check = function () {
        //    初始布尔值
        var isValid = true,
            v = this.val;
        //    引用检查器检查的值对象
        var checkList = [
            [this.nUsername, ["required", "phone"]],
            [this.nNickname, ["required", "nickname"]],
            [this.nPassword, ["required", "password"]],
            [this.nCaptcha, ["required"]]
        ];
        isValid = this.checkRules(checkList);
        //    显示错误信息
        if (!isValid) {
            this.showError("请确认填写无误，再次提交！");
            return false;
        }
        //    确认密码一致
        if (v.confirmpsw !== v.password) {
            this.showError("请确保两次输入密码一致！");
            return false;
        }
        //    确认勾选条款
        if (!v.readed) {
            this.showError("请确认已经知悉条款，并勾选！");
            return false;
        }
        if (!isValid) {
            console.log("验证没通过");
        }
        //    最后返回总的布尔值
        return isValid;
    };
    Register.prototype.checkRules = function (items) {
        var vl = App.validator;
        var flag = true,
            isValid = true;
        // 第一层循环遍历每个待检查值
        for (var i = 0; i < items.length; i++) {
            var checkItem = items[i][0],
                rules = items[i][1];
            // 第二层遍历每个值的检查项目
            for (var j = 0; j < rules.length; j++) {
                switch (rules[j]) {
                    case "required":
                    {
                        flag = vl.isFill(checkItem.value);
                        break;
                    }
                    case "phone":
                    {
                        flag = vl.isPhone(checkItem.value);
                        break;
                    }
                    case "password":
                    {
                        flag = vl.isPassword(checkItem.value);
                        break;
                    }
                    case "nickname":
                    {
                        flag = vl.isNickname(checkItem.value);
                        break;
                    }
                }
                if (!flag) {
                    _.addClassname(checkItem, "z-error");// 出错break，并红框提醒
                    console.log("未通过注册信息有效性验证！");
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;

    };
    Register.prototype.submit = function () {
        var that = this;
        //console.log(this.nPassword);
        var val = this.val = {};
        val.username = this.nUsername.value;
        val.nickname = this.nNickname.value;
        val.password = this.nPassword.value;
        val.confirmpsw = this.nConirmpsw.value;
        val.captcha = this.nCaptcha.value;
        val.readed = !!this.nReaded.checked;
        /* 以下值为非必填值，要设默认值*/
        val.sex = (this.nSex.value.length < 1) ? null : Number(this.nSex.value);
        val.province = (this.nAddress[0].dataset.code.length < 1) ? null : Number(this.nAddress[0].dataset.code);
        val.city = (this.nAddress[1].dataset.code.length < 1) ? null : Number(this.nAddress[1].dataset.code);
        val.district = (this.nAddress[2].dataset.code.length < 1) ? null : Number(this.nAddress[2].dataset.code);

        if (this.nBirthday[0].dataset.code.length < 1) {
            val.birthday = null;
        }
        else {
            val.birthday = [];
            this.nBirthday.forEach(function (item) {
                if (item.dataset.code.length < 1) return; //如果有没填项则不加入结果
                val.birthday.push(item.dataset.code);
            });
            val.birthday = val.birthday.join("-");
        }

        console.log(val); //发送到服务器的注册数据

        if (!this.check()) return;
        console.log("验证通过");
        var data = {
            username: val.username,
            nickname: val.nickname,
            password: hex_md5(val.password),
            sex: val.sex,
            province: val.province,
            city: val.city,
            district: val.district,
            birthday: val.birthday,
            captcha: val.captcha
        };
        //console.log(data);
        _.ajax({
            url: "/api/register",
            method: "POST",
            data: data,
            success: function (response) {
                console.log("得到返回", response.code);
                if (response.code === 200) {
                    // 转到登录框
                    _.emitEvent(document, "goLogin");
                }
                else {
                }
            },
            fail: function (response) {
                console.log(response.code, "注册出了点问题");
            }
        })


    };

    App.Register = Register;
})(window.App);


/* page *************/
(function (App) {
    var page = {
        init: function () {
            //var that = this;

            /* 初始页头和明日之星栏 */
            this.initHeader();
            this.initStarList();
            // 轮播图
            this.slider = new App.Slider({
                container: _.$(".g-banner"),
                imgList: [
                    "../res/images/banner0.jpg",
                    "../res/images/banner1.jpg",
                    "../res/images/banner2.jpg",
                    "../res/images/banner3.jpg"
                ]
            });
            // 侧边栏的导航条
            this.sideTab = new App.Tabs({
                container: _.$("#paihang .m-nav"),
                activeItem: _.$("#paihang .z-active"),
                contentLists: _.$$("#paihang .content_list")
            });

            // 登录
            this.login = new App.Login();
            // 注册
            this.register = new App.Register();
        },

        initHeader: function (argument) {
            /* 用于页面级调用的， 页头初始化 */
            App.header.init({
                login: function (data) {
                    if (!window.App.user) {
                        window.App.user = data;
                        // 登录成功会更新明星列表
                        this.initStarList();
                    }
                }.bind(this) //bind to page
            });

        },

        initStarList: function () {
            _.ajax({
                url: "/api/users?getstarlist",
                success: function (data) {
                    if (data.code === 200) {
                        // 第一次加载生成实例
                        if (!this.starList) {
                            //console.log("this.starList", this.starList);
                            this.starList = new App.StarList(_.$(".starlist"), data.result);
                        }
                        //已有实例则只更新内容
                        else {
                            //console.log("just update starList");
                            this.starList.render(data.result);
                        }
                    }
                }.bind(this),
                fail: function () {
                    return false;
                }
            })
        }
    };
    document.addEventListener("DOMContentLoaded", function () {
        page.init();
    })

})(window.App);



