/**
 * Created by WAXKI on 2017/10/10.
 */
window.App = {};
window._ = {
    createElement: function (tag, className, text) {
        var node = document.createElement(tag);
        node.className = className;
        node.innerHTML = text;
        return node;
    },
    renderItem: function (str, data) {
        return str.replace(/{{([^}]+)}}/g, function ($0, $1) {
            return data[$1];
        })
    },
    emitEvent: function (currentTarget, type, bubbles, cancelable, detail) {
        //IE9+
        if (document.implementation.hasFeature("CustomEvents", "3.0")) {
            bubbles = (bubbles === undefined) ? true : bubbles;
            cancelable = (cancelable === undefined) ? true : cancelable;
            detail = detail || {}; //这里可以是事件中包含的信息、数据
            var e = document.createEvent("CustomEvent");
            e.initCustomEvent(type, bubbles, cancelable, detail);
            currentTarget.dispatchEvent(e);
        }
        else console.log("该环境不支持自定义事件！");
    },
    isJSON: function (str) {
        if (typeof str == 'string') {
            try {
                var obj = JSON.parse(str); //不出错才会运行下步
                if (str.trim().indexOf("{") === 0) {
//          console.log('是JSON，并转成对象：', obj);
                    return true;
                }
                return false;
            } catch (e) {
                console.log('error：', str, '!!!', e);
                return false;
            }
        }
        console.log(str, 'It is not a string!');
        return false;
    },
    extend: function (newlyObj, proto) {
        for (var p in proto) {
            if (proto.hasOwnProperty(p)) {
                newlyObj[p] = proto[p];
            }
        }
        //newlyObj.prototype = Object.create(proto);
    },
    getContainer: function (obj, selector) {
        obj.container = document.querySelector(selector); //IE8+
    },
    delClassname: function (elem, name) {
        if (typeof elem != "object") return;
        elem.classList.remove(name); //IE10+
    },
    addClassname: function (elem, name) {
        /* 添加样式名 */
        if (typeof elem != "object") return;
        elem.classList.add(name);
    },
    toggleClassname: function (elem, name) {
        /* 添加样式名 */
        if (typeof elem != "object") return;
        elem.classList.toggle(name);
    },
    setClassname: function (elem, name) {
        /* 替换原来所有样式名 */
        if (typeof elem != "object") return;
        elem.className = name;
    },
    serialize: function (data) {
        var name,
            value,
            str = "";
        for (var prop in data) {
            if (data.hasOwnProperty(prop) && (typeof prop != "function")) {
                name = encodeURIComponent(prop);
                value = encodeURIComponent(data[prop]);
                if (str.length) {
                    str += "&" + name + "=" + value;
                }
                else {
                    str += name + "=" + value;
                }
            }
        }
        //console.log("str",str);
        return str;
    },

    ajax: function (obj) {
        if (!obj || typeof obj != "object") return;

        var xhr = new XMLHttpRequest(),
            method = (obj.method || "GET").toUpperCase(),
            url = obj.url,
            data = obj.data || {},
            seccess = obj.success,
            fail = obj.fail,
            asyn = obj.asyn || true,
            contentType = obj.contentType || "application/json"; //默认JSON

        xhr.onload = function () {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                //console.log("请求成功，并开始调用函数")
                var data = xhr.responseText;
                if (_.isJSON(data)) {
                    data = JSON.parse(data);
                }
                seccess(data);
            } else {
                console.log("Request was unsuccessful: " + xhr.status);
                if (typeof fail === "funcion") {
                    fail();
                }
            }
        };

        if (method === "GET") {
            /* 特为分页请求增加的请求头设置 */
            if (obj.data !== undefined) {
                if (obj.contentType === "application/json") {
                    //xhr.setRequestHeader("Content-Type", contentType);
                    url += "?" + JSON.stringify(data);
                }
                else   url += "?" + this.serialize(data);
            }

            xhr.open(method, url, asyn);
            xhr.send(null);
        }

        else {
            xhr.open(method, url, asyn);
            xhr.setRequestHeader("Content-Type", contentType);
            if (contentType === "application/json") {
                data = JSON.stringify(data);
            }
            //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
    },
    $: function (selector, container) {
        return (container || document).querySelector(selector);
    },
    $$: function (selector, container) {
        return (container || document).querySelectorAll(selector);
    }
};

/**************************************************************************************/
/**************************************************************************************/
/* Tab **********************************/
(function (App) {
    function Tabs(obj) {
        _.extend(this, obj); //get container and activeItem外加须要切换的列表组
        this.tab = this.container.querySelector("ul");
        this.tabs = Array.prototype.slice.call(this.tab.children);
        this.slider = this.container.querySelector(".slider");

        this.init();
    }

    Tabs.prototype.init = function () {
        var that = this;

        /* 监听每一选项 */
        /*
         var i = -1,
         item;
         while(item=this.tabs[++i]) {
         (function(it) {
         return (function() {
         it.addEventListener("click",function(e) {
         that.highlight(it);
         })
         it.addEventListener("mouseover",function(e) {
         that.current(it);
         })
         })()
         })(item)
         }
         */
        /* 同上 */
        this.tabs.forEach(function (item, idx) {
            //var that=this;
            item.addEventListener("click", function () {
                that.highlight(item);
                if (that.contentLists) {
                    that.listsToggle(idx);
                }
            });

            if (!that.slider) return; //没有滑条时不执行下面功能
            item.addEventListener("mouseover", function () {
                that.current(item);
            });
        });

        if (!that.slider) return; //没有滑条时不执行下面功能

        /* 离开导航栏，滑条自动返回当前激活选项处 */
        this.tab.addEventListener("mouseleave", function () {

            that.current(that.activeItem);
        });

        /* 默认滑条位置 */
        this.current(this.activeItem);
    };
    /* 被激活选项字体高亮显示 */
    Tabs.prototype.highlight = function (elem) {
        _.delClassname(this.activeItem, "z-active");
        this.activeItem = elem;
        _.addClassname(elem, "z-active");
    };
    /* 游标跟随被激活的选项或hover的选项 */
    Tabs.prototype.current = function (elem) {
        this.slider.style.width = elem.offsetWidth + "px";
        this.slider.style.left = elem.offsetLeft + "px";
    };
    Tabs.prototype.listsToggle = function (idx) {
        this.contentLists.forEach(function (item) {
            item.classList.remove("z-active");
        })
        this.contentLists[idx].classList.add("z-active");
    }
    App.Tabs = Tabs;
})(window.App);

/** Search ****************************************/
(function (App) {
    function Search(form) {
        this.nForm = form;
        this.input = this.nForm.querySelector("input");
        this.init();
    }

    Search.prototype.init = function () {
        this.nForm.addEventListener("submit", function (e) {
            /*
             console.log(this.input.value.trim())
             console.log(typeof this.input.value.trim())
             console.log(!!this.input.value.trim())
             */
            if (!this.input.value.trim()) {
                e.preventDefault();
                return false; //一般来说非必须
            }
        }.bind(this));
    }

    App.Search = Search;
})(window.App);

/** header **************************************/
(function (App) {
    var header = {
        init: function (options) {
            var that = this;
            options = options || {};
            this.loginCallback = options.login;

            this.headerElem = document.querySelector(".g-header");
            this.logoutBtn = _.$("#logout");
            this.userNickname = this.headerElem.querySelector(".user_nickname");
            this.sexIcon = this.headerElem.querySelector(".m-user .u-icon-sex");
            this.guestPanel = this.headerElem.querySelector("#guest");
            this.userPanel = this.headerElem.querySelector("#userdropdown");

            this.headerTab = new App.Tabs({
                container: _.$(".g-header .m-nav"),
                activeItem: this.getCurrentItem()
            });
            this.search = new App.Search(_.$(".search_form"));

            this.logoutBtn.addEventListener("click", function () {
                _.ajax({
                    url: "/api/logout",
                    method: "POST",
                    success: function (responseData) {
                        if (responseData.code == 200) {
                            console.log("logout");
                            window.location.href = "./index"
                            //location.reload();
                        }
                    }
                });
            });

            this.initLoginStatus();
        },

        initLoginStatus: function () {
            _.ajax({
                url: "/api/users?getloginuser",
                success: function (data) {
                    //console.log(responseData.code)
                    //var data = JSON.parse(responseData);
                    //返回JSON数据已在工具中转化成对象
                    console.log("单独请求得到的登录用户信息", data)
                    if (data.code == 200) {
                        this.initUserInfo(data.result); //设置顶栏登录信息框显示与否
                        this.loginCallback && this.loginCallback(data.result); //设置window.App.user对象
                    }
                }.bind(this) //this bind to header
            })
        },
        initUserInfo: function (data) {
            /* 运行到这一步说明用户已经登录 */
            console.log("已成功获取登录用户信息")
            var iconConfig = ["u-icon u-icon-sex u-icon-female", "u-icon u-icon-sex u-icon-female"];//0应为男
            this.userNickname.innerHTML = data.nickname;
            this.sexIcon.className = iconConfig[data.sex];

            /* 显示用户信息面板，隐藏登录面板 */
            _.delClassname(this.userPanel, "f-dn");
            _.addClassname(this.guestPanel, "f-dn");
        },
        getCurrentItem: function () {
            return this.headerElem.querySelector(".z-active");
        }

    }
    App.header = header;
})(window.App);


