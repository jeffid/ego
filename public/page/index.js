/* Slider ******************************************/
(function (App) {
    function Slider(options) {
        _.extend(this, options);
        this.createTemplate();
        this.sliderItems = Array.prototype.slice.call(this.sliderList.children);
        this.indicatorBtns = Array.prototype.slice.call(this.sliderIndicator.children);
        this.lastIndex = null;
        this.index = 0; //默认第一个
        this.timer = null;
        this.interval = 5000;

        this.autoPlay();
        this.sliderList.addEventListener("mouseenter", function () {
            //console.log("MOUSEENTER: stop");
            //console.log(this.stopPlay);
            this.stopPlay();
        }.bind(this));
        this.sliderList.addEventListener("mouseleave", function () {
            //console.log("MOUSELEAVE: play");
            this.autoPlay();
        }.bind(this));

        this.indicatorBtns.forEach(function (item, idx) {
            //IE9+
            var that = this;
            //var that=that;
            item.addEventListener("click", function () {
                //console.log("CLICK:",idx);
                that.shift(idx); //已经在闭包里了
            });
            /*
             item.addEventListener("mouseover", function () {
             //var idx = Number(e.target.dataset.index);
             that.shift(idx);
             });
             */
        }.bind(this));

        /*
         //正确做法应是回调函数执行后，this调用方法函数，这里的只是函数指针
         this.sliderList.addEventListener("mouseenter", Slider.prototype.stopPlay);
         this.sliderList.addEventListener("mouseleave", Slider.prototype.autoPlay);
         this.sliderIndicator.addEventListener("click", Slider.prototype.shift);
         this.sliderIndicator.addEventListener("mouseover", Slider.prototype.shift);
         */
        //console.log("to END!")
    }

    Slider.prototype.createTemplate = function () {
        //console.log("生成html")
        this.mSlider = document.createElement("div");
        this.sliderList = document.createElement("ul");
        this.sliderIndicator = document.createElement("div");
        var items = "",
            btns = "";
        //console.log(this.imgList.length)

        for (var i = 0; i < this.imgList.length; i++) {
            items += '<li class="slider_item"><a href="' + i + '" class="slider_item_lk">                    <img src="' + this.imgList[i] + '" alt="" class="slider_item_img"></a>                   </li>';
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
    }
    Slider.prototype.next = function () {
        this.index = ++this.index % this.sliderItems.length;

    }
    Slider.prototype.fade = function () {
        if (this.lastIndex !== null) {
            //不全等于null，即初始化时不执行
            //this.sliderItems[this.lastIndex].style.opacity = "0";
            _.delClassname(this.sliderItems[this.lastIndex], "z-active");
        }
        //this.sliderItems[this.index].style.opacity = "1";
        _.addClassname(this.sliderItems[this.index], "z-active"); //层叠在最上，以便点击
    }
    Slider.prototype.setActiveIndicatorBtn = function () {
        if (this.lastIndex !== null) {
            _.delClassname(this.indicatorBtns[this.lastIndex], "z-active");
        }
        _.addClassname(this.indicatorBtns[this.index], "z-active");
    }
    Slider.prototype.switch = function () {
        /*
         console.log("lastIndex：", this.lastIndex)
         console.log("index：", this.index)
         */
        this.fade();
        this.setActiveIndicatorBtn();
        this.lastIndex = this.index;
        this.next();
    }
    Slider.prototype.autoPlay = function () {
        var that = this;
        clearInterval(this.timer);
        that.switch();
        that.timer = setInterval(function () {
            that.switch();
        }, that.interval);

        /*
         //timeout定时器在触发指示器后运行异常
         setTimeout(function () {
         //console.log(typeof that.switch)

         that.switch();
         that.timer = setTimeout(arguments.callee, that.interval);
         //console.log("that.timer:",that.timer);

         }, that.interval);
         */
    }
    Slider.prototype.stopPlay = function () {
        //console.log("timer:",this.timer);
        //console.log("interval:",this.interval);
        //console.log("this:",this);
        clearTimeout(this.timer);
    }
    Slider.prototype.shift = function (idx) {
        this.index = idx;
        this.autoPlay();
    }

    /**
     * 根据传入imgList生成.m-slider
     * 获得slider_item和图标点组
     * 根据图片激活项激活指示器
     * autoplay间歇调用switch
     * switch根据传入索引调用fade（）、setcurrent（）
     * fade（）隐藏上个索引图片，显示当前图片
     * setcurrent()设置当前指示器
     * next()生成下个索引值
     * 监听slider_List鼠标悬浮调用stop()
     * 监听btn，点击或悬浮切换到当下索引图片
     * */
    App.Slider = Slider;
})(window.App);

/** StarList *****************************************/
(function (App) {

    function StarList(container, data) {
        console.log("执行StarList,并生成列表");

        this.container = container;
        this.starsDataArr = data;
        this.btnConfig = [
            {
                class: "z-unfollow u-btn-default",
                text: "关注",
                iconClass: "u-icon-unfollow"
            },
            {
                class: "z-follow u-btn-primary",
                text: "已关注",
                iconClass: "u-icon-follow"
            }
        ];
        this.render(this.starsDataArr);
        this.followHandler()
        console.log("执行StarList");
    }

    StarList.prototype.render = function (starsDataArr) {
        var html = "";
        starsDataArr.forEach(function (item) {
            html += this.renderItem(item);
        }.bind(this))
        this.container.innerHTML = html;
    }
    StarList.prototype.renderItem = function (itemData) {
        var btn = this.btnConfig[Number(!!itemData.isFollow)];
        return '<li class="section_item m-card f-middlefix" data-starid="' + itemData.id + '"><img src="../res/images/null1.png" alt="" class="section_item_img card_avatar"><p class="card_info"><a href="#" class="name">' + itemData.nickname + '</a>作品&nbsp;<span>' + itemData.workCount + '</span>&nbsp;&nbsp;粉丝&nbsp;<span>' + itemData.followCount + '</span></p><button class="' + btn.class + ' u-btn"><i class="u-icon ' + btn.iconClass + '"></i>' + btn.text + '</button></li>';
    }
    StarList.prototype.follow = function (starItem, idx) {
        var that = this;
        _.ajax({
            url: "/api/users?follow",
            method: "POST",
            data: {id: Number(starItem.dataset.starid)},
            success: function (data) {
                console.log(" 关注事件");
                that.starsDataArr[idx].followCount += 1;
                that.starsDataArr[idx].isFollow = true;
                starItem.outerHTML = that.renderItem(that.starsDataArr[idx]);
                that.followHandler();
            }
        })
    }
    StarList.prototype.unfollow = function (starItem, idx) {
        var that = this;
        _.ajax({
            url: "/api/users?unfollow",
            method: "POST",
            data: {id: Number(starItem.dataset.starid)},
            success: function (data) {
                console.log("取消关注");

                that.starsDataArr[idx].followCount -= 1;
                that.starsDataArr[idx].isFollow = false;
                starItem.outerHTML = that.renderItem(that.starsDataArr[idx]);
                that.followHandler();
            }
        })
    }
    StarList.prototype.followHandler = function () {
        var that = this;
        this.starItems = Array.prototype.slice.call(this.container.children);
        this.starItems.forEach(function (starItem, idx) {
            starItem.addEventListener("click", function (e) {
                var target = e.target;
                //var  starid = starItem.dataset.starid;
                if (target.tagName === "BUTTON") {
                    if (!!App.user) {
                        if (target.classList.contains("z-follow")) {
                            that.unfollow(starItem, idx);
                        }
                        else {
                            that.follow(starItem, idx);
                        }
                    }
                    else {
                        console.log("关注前没登录，弹出一个登录框");
                        //App.emit(); //弹出登录框
                        _.emitEvent(document, "goLogin");
                        return
                    }
                }
            })
        })

    }
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

/*var navTab = new App.Tabs(".m-nav");
 var search = new App.Search(".search_form");*/
//App.header.init();

/* Modal*************/
(function (App) {

    function Modal() {
    }

    Modal.prototype.show = function () {
        this.container.classList.remove("f-dn");//在继承原型的原型的实例中定义container
    }
    Modal.prototype.hide = function () {
        this.container.classList.add("f-dn");//在继承原型的原型的实例中定义container
    }
    Modal.prototype.showCurtain = function () {
        !!this.curtain && this.curtain.classList.remove("f-dn");
    }
    Modal.prototype.hideCurtain = function () {
        !!this.curtain && this.curtain.classList.add("f-dn");
    }
    Modal.prototype.init = function () {
        var that = this;
        /* 隐藏 ****/
        this.curtain.addEventListener("click", function () {
            that.hide();
            that.hideCurtain(); //单独处理的背景遮罩隐藏

        })
        this.nClose.addEventListener("click", function () {
            that.hide();
            that.hideCurtain();
        })
        /* 登录面板隐藏 */

        /* 注册面板隐藏 */

        /* 显示 ****/
        /* 登录面板显示 */

    }
    Modal.prototype.showError = function (text) {
        this.nErrBar.parentNode.classList.remove("f-dn");
        this.nErrBar.innerText = text;
    }
    App.Modal = Modal;
})(window.App);


/* 登录 **********************/
(function (App) {

    function Login() {
        var that = this;
        this.dateCascade = new App.Cascade(_.$(".m-cascade-date"), App.genCalendar(1950));
        this.curtain = _.$(".u-curtain");
        this.container = _.$("#login_panel");
        this.nClose = _.$("#login_panel .close");
        this.nErrBar = _.$("#login_panel .error_msg");
        this.nLoginBtn = _.$("#login");
        this.nRegister = _.$("#login_panel .register_lk");

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

        this.nLoginBtn.addEventListener("click", function () {
            _.emitEvent(document, "goLogin");
        });
        this.nRegister.addEventListener("click", function () {
            _.emitEvent(document, "goRegister");
        });

        /* 提交处理 */
        this.nForm.addEventListener("submit", function (e) {
            e.preventDefault();
            that.submit();
        })
    }

    Login.prototype = Object.create(App.Modal.prototype);
    Login.prototype.check = function () {
        var username = this.nUsername.value,
            password = this.nPassword.value,
            isValid = true;
        isValid = App.validator.isFill(username) && App.validator.isPhone(username);
        if (!isValid) {
            _.addClassname(this.nUsername, "z-error")
            return false
        }
        isValid = App.validator.isFill(password);
        if (!isValid) {
            _.addClassname(this.nPassword, "z-error")
            return false
        }
        return true

    }
    Login.prototype.submit = function () {
        var that = this;
        if (!this.check()) return;
        console.log("验证通过");
        var data = {
            username: that.nUsername.value,
            password: hex_md5(that.nPassword.value),
            remember: !!that.nRemember.checked
        }
        //console.log(data);
        _.ajax({
            url: "/api/login",
            method: "POST",
            data: data,
            success: function (response) {
                console.log("得到返回", response.code);
                if (response.code === 200) {
                    _.emitEvent(document, "ok");
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

    }
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



/* 注册 **************************************/
(function (App) {
    function Register() {
        var that = this;
        this.addressCascade = new App.Cascade(_.$(".m-cascade-address"), ADDRESS_CODES);
        this.curtain = _.$(".u-curtain");
        this.container = _.$("#register_panel");
        this.nClose = _.$("#register_panel .close");
        this.nErrBar = _.$("#register_panel .error_msg");
        this.nLoginBtn = _.$("#register");
        this.nCaptchaImg = _.$("#register_panel .captchaimg");
        this.nBirthday = [].slice.call(_.$$("#register_panel .m-cascade-date .select_val"));
        this.nAddress = [].slice.call(_.$$("#register_panel .m-cascade-address .select_val"));

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

        /* 验证码 */
        this.nCaptchaImg.addEventListener("click", function () {
            that.resetCaptcha();
        })
        this.nLoginBtn.addEventListener("click", function () {
            _.emitEvent(document, "goRegister")
        });
        this.nForm.addEventListener("submit", function (e) {
            e.preventDefault();
            that.submit();
        })

    }
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
        ]
        isValid = this.checkRules(checkList);
        if (!isValid) {
            this.showError("请确认填写无误，再次提交！");
            return false;
        }
        if (v.confirmpsw !== v.password) {
            this.showError("请确保两次输入密码一致！");
            return false;
        }
        if (!v.readed) {
            this.showError("请确认已经知悉条款，并勾选！");
            return false;
        }
        if (!isValid) {
            console.log("验证没通过");
        }
        return isValid;
        //    确认密码一致
        //    确认勾选条款
        //    显示错误信息
        //    最后返回总的布尔值
    }
    Register.prototype.checkRules = function (items) {
        var vl = App.validator;
        var flag = true,
            isValid=true;
        //    第一层循环遍历每个待检查值
        for (var i = 0; i < items.length; i++) {
            var checkItem = items[i][0],
                rules = items[i][1];
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
                    isValid=false;
                    break;
                }
            }//    第二层遍历每个值的检查项目
        }
        return isValid;

    }
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
        }
        //console.log(data);
        _.ajax({
            url: "/api/register",
            method: "POST",
            data: data,
            success: function (response) {
                console.log("得到返回", response.code);
                if (response.code === 200) {
                    _.emitEvent(document, "goLogin");
                }
                else {
                }
            },
            fail: function (response) {
                console.log(response.code, "注册出了点问题");
            }
        })


    }

    App.Register = Register;
})(window.App);


/* page *************/
(function (App) {
    var page = {
        init: function () {
            var that = this;


            /* 初始页头和明日之星栏 */
            this.initHeader();
            this.initStarList();

            this.slider = new App.Slider({
                container: _.$(".g-banner"),
                imgList: [
                    "../res/images/banner0.jpg",
                    "../res/images/banner1.jpg",
                    "../res/images/banner2.jpg",
                    "../res/images/banner3.jpg"
                ]
            });
            this.sideTab = new App.Tabs({
                container: _.$("#paihang .m-nav"),
                activeItem: _.$("#paihang .z-active"),
                contentLists: _.$$("#paihang .content_list")
            });

            /* 登录 注册 */
            this.login = new App.Login();
            this.register = new App.Register();
        },


        initHeader: function (argument) {
            /* 用于页面级调用的， 页头初始化 */
            App.header.init({
                login: function (data) {
                    if (!window.App.user) {
                        window.App.user = data;
                        this.initStarList();
                    }
                }.bind(this) //bind to page
            });

        },
        initStarList: function () {
            _.ajax({
                url: "/api/users?getstarlist",
                success: function (data) {
                    //var data = JSON.parse(data);
                    //    console.log("this.starList", this.starList);
                    if (data.code === 200) {

                        if (!this.starList) {
                            //console.log("this.starList", this.starList);
                            this.starList = new App.StarList(_.$(".starlist"), data.result);

                            /* 同一页面下不同登录状态时明星列表的不同表现*/
                            /* 从未登录到登录要不要更新列表？要如要，那发送什么数据？*/
                            /*
                             this.starList.on("login", function () {
                             this.nav.showLogin();
                             }.bind(this))
                             */
                        }
                        else {
                            this.starList.render(data.result);
                        }
                    }
                }.bind(this),
                fail: function () {
                    return
                }
            })
        }
    }
    document.addEventListener("DOMContentLoaded", function () {
        page.init();
    })

})(window.App);
/* *************/
(function (App) {
})(window.App);
/* *************/
(function (App) {
})(window.App);


