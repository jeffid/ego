/* Profile 用户信息 *************/
(function (App) {
    function Profile(options) {
        this.data = options; //初始化页头时得到的用户信息
        this.source = document.querySelector("#user-info-tpl");
        //this.container = document.querySelector(".g-profile");

        this.render();
    }

    /* 判断星座 *************/
    Profile.prototype.getConstellation = function (dateObj) {
        var month = dateObj.getMonth() + 1,
            date = dateObj.getDate();
        var config = [
            [12, 22, 1, 19, "摩羯座"],
            [1, 20, 2, 18, "水瓶座"],
            [2, 19, 3, 20, "双鱼座"],
            [3, 21, 4, 20, "白羊座"],
            [4, 21, 5, 20, "金牛座"],
            [5, 21, 6, 21, "双子座"],
            [6, 22, 7, 22, "巨蟹座"],
            [7, 23, 8, 22, "狮子座"],
            [8, 23, 9, 22, "处女座"],
            [9, 23, 10, 22, "天秤座"],
            [10, 23, 11, 21, "天蝎座"],
            [11, 22, 12, 21, "射手座"]
        ];
        for (var i = 0; i < 12; i++) {
            var it = config[i];
            if (month == it[0] && date >= it[1] || month == it[2] && date <= [3]) {
                return it[4];
            }
        }
        return "无法匹配星座！"
    }
    // 判断地区
    Profile.prototype.getAddress = function (code) {
        //console.log("addrsss:",code);
        var code = code.toString(), //传入编码可以是代表省、市、区的6位数字，转字串
            code1 = code.slice(0, 2),
            code2 = code.slice(2, 4),
            code3 = code.slice(4);
        var obj = {};
        var ADDR = ADDRESS_CODES;
        for (var i = 0; i < ADDR.length; i++) {
            var province = ADDR[i]; //全部的省份中的 i省
            // 用代表省份的编码对比验证
            if (code1 === province[0].slice(0, 2)) {
                obj.province = province[1]; // 中文名称部分，写入返回对象

                if (code2 === "00") return obj; //编码为”00“说明没这级详细地址，跳出
                var cityList = province[2]; // i省中的城市组
                for (var j = 0; j < cityList.length; j++) {
                    var city = cityList[j]; // i省中的 j市
                    if (code2 === city[0].slice(2, 4)) {
                        obj.city = city[1];

                        if (code3 === "00") return obj;
                        var districtList = city[2]; // j市中有县区组
                        for (var k = 0; k < districtList.length; k++) {
                            var district = districtList[k]; // j市中的 k县区
                            if (code3 === district[0].slice(4)) {
                                obj.district = district[1];
                            }
                        }
                    }
                }
            }
        }
        //console.log(obj);
        return obj;

    };

    Profile.prototype.render = function () {
        var iconConfig = ["u-icon u-icon-sex u-icon-male", "u-icon u-icon-sex u-icon-female"];//0应为男
        // 判断从服务器中返回的日期是否为有效的值
        if (this.data.birthday === null || this.data.birthday.length < 8) {
            /* 参照标准日期规格"xxxx-x-x",至少8位数 */
            this.age = "年龄未知";
            this.constellation = "星座未知";
        }
        // 有效，正常操作
        else {
            this.dateObj = new Date(this.data.birthday);
            // 年龄
            this.age = new Date().getFullYear() - this.dateObj.getFullYear();
            // 星座
            this.constellation = this.getConstellation(this.dateObj);

        }
        // 昵称
        this.nickname = this.data.nickname;
        // 性别图标的样式名
        this.sexClassName = (typeof this.data.sex !== "number") ? "" : iconConfig[this.data.sex];
        // 城市
        this.address = (typeof this.data.city !== "number") ? "未知城市" : this.getAddress(this.data.city).city;

        // 生成文档节点
        this.source.outerHTML = _.renderItem(this.source.innerHTML, this);
    };

    App.Profile = Profile;
})(window.App);
/* 作品列表*************/
(function (App) {
    function WorksList(options) {
        var that = this;
        this.container = _.$(".g-main .m-works");
        this.source = _.$("#works-item").innerHTML;
        // 预设一个备用的options
        if (options === undefined) {
            // limit=0,初次新建实例时不请求返回作品列表，等页码组件再单独调用init()函数及传入有效参数
            var options = {
                query: {limit: 0, offset: 0, total: 1}
            }
        }

        //this.init(options);

        this.container.addEventListener("click", function (e) {
            if (e.target.classList.contains("u-icon")) {
                var worksItem = e.target.parentNode.parentNode;
                var context = {
                    name: worksItem.dataset.name,
                    id: worksItem.dataset.id
                };
                // 进行编辑操作
                if (e.target.classList.contains("u-icon-edit")) {
                    that.editWorks(context, worksItem);
                }
                // 进行删除操作
                if (e.target.classList.contains("u-icon-delete")) {
                    that.deleteWorks(context);
                }
            }
        })

    }

    WorksList.prototype.deleteWorks = function (context) {
        var that = this;
        var modal = new App.AlertModal({
            content: '确定要删除 <em class="name">' + context.name + '</em>的吗？',
            title: ""
        });
        modal.on("confirm", function () {
            _.ajax({
                url: "/api/works/" + context.id,
                method: "DELETE",
                success: function () {
                    // 成功进行删除操作后重新加载列表
                    that.init();
                }
            })
        })
    };
    WorksList.prototype.editWorks = function (context, worksItem) {
        var modal = new App.AlertModal({
            content: '<input class="edit" type="text" value="' + context.name + '">',
            title: "请输入新的作品名称"
        });
        modal.on("confirm", function () {
            var input = modal.container.querySelector("input");
            var newName = input.value.trim();
            if (newName.length < 1) {
                alert("请输入有效字符");
                return;
            }
            if (newName !== context.name) {
                _.ajax({
                    url: "/api/works/" + context.id,
                    method: "PATCH",
                    data: {name: newName},
                    success: function (responce) {
                        // 按返回值更新作品名
                        _.$("h3", worksItem).innerHTML = responce.result.name;
                    }
                })
            }

        })

    };
    WorksList.prototype.renderList = function (response) {
        var data = response.result.data;

        console.log("返回作品数量：", data.length);
        if (data.length < 1) {
            this.container.innerHTML = "你还没有创建任何作品~";
            return
        }
        var html = "";
        for (var i = 0; i < data.length; i++) {
            html += _.renderItem(this.source, data[i]);
        }
        this.container.innerHTML = html;
    };
    WorksList.prototype.init = function (options) {
        //页码Pagination实例可以调用来生成相应作品列表
        // 首先显示加载进度示意图
        this.container.innerHTML = '<img src="../../res/images/loading.gif" alt="正在加载中...">';
        _.ajax({
            url: "/api/works",
            data: options.query,
            success: function (response) {
                //console.log("works:", response);
                this.renderList(response);
            }.bind(this)
        });
    };

    App.WorksList = WorksList;
})(window.App);



/* Pagination分页 *************/
(function (App) {
    // 默认选中的页码
    var DAFAULT_CURRENT_PAGE = 1;
    // 默认显示页码数量
    var DAFAULT_SHOW_NUM = 8;
    // 默认每页显示作品数量
    var DAFAULT_LTEMS_LIMIT = 10;

    function Pagination(options) {
        _.extend(this, options);
        this.current = this.current || DAFAULT_CURRENT_PAGE;
        this.showNum = this.showNum || DAFAULT_SHOW_NUM;
        this.itemsLimit = this.itemsLimit || DAFAULT_LTEMS_LIMIT;

        _.ajax({
            url: "/api/works",
            data: {total: 1},
            success: function (response) {
                this.total = this.total || response.result.total; // 获取总作品数量
                // 下面操作依赖作品总数
                this.render();
                this.eventHandle();

            }.bind(this)
        });

    }

    //
    Pagination.prototype.eventHandle = function () {
        var that = this;
        this.callback(this.current); // 初始作品列表，参数中传入的回调，即更新作品列表page.worksList.init（）
        this.container.addEventListener("click", function (e) {
            var it = e.target;
            //if(!that.container.contains(it)) return;
            if (it === that.container) return;
            if (it.classList.contains("z-disabled") || it.classList.contains("z-active")) return;

            var itPageIndex = Number(it.dataset.page);
            that.current = itPageIndex;
            // 判断要示要的的页码是否超出当前能显示的范围，分别处理
            if (itPageIndex >= that.startPageIndex && itPageIndex < that.startPageIndex + that.showNum) {
                // 没超出，直接设页码状态
                that.setStatus();
            }
            else {
                // 超出，重新加载页码组件
                that.render();
            }
            // 更新作品列表
            that.callback(that.current);
        });

    };

    Pagination.prototype.remove = function () {
        // 没用上
        this.parent.removeChild(this.container);
        this.container = null;
    };

    // 每次render完。更新current切换状态和上、下、首、尾页指向
    Pagination.prototype.setStatus = function () {
        var crr = this.current;
        var list = [].slice.call(this.container.children);

        // 全部清空类名
        list.forEach(function (item) {
            item.className = "";
        });
        // 当前激活页码的索引，跳过上一页和首页，因此+2
        var index = crr - this.startPageIndex + 2;
        list[index].className = "z-active";
        // 当前页码等于第五页时，上一页、首页不可用
        if (crr === 1) {
            list[0].className = "z-disabled";
            list[1].className = "z-disabled";
        }
        // 当前页码等于总页数时，下一页、尾页不可用
        if (crr === this.totalPages) {
            list[list.length - 1].className = "z-disabled";
            list[list.length - 2].className = "z-disabled";
        }

        // 设置上一页、下一页的指向页码
        if (this.totalPages !== 1) {
            list[1].dataset.page = crr - 1;// 上一页指向的页码
            list[list.length - 2].dataset.page = crr + 1;
        }

    };

    Pagination.prototype.render = function () {
        // 事先有列表容器的就把容器内的子元素清空
        if (this.container !== undefined) {
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
        }
        else {
            this.container = _.createElement("ul", "m-pagination", ""); //没有就新建一个
        }
        var firstPage = _.createElement("li", "", "首页"),
            endPage = _.createElement("li", "", "尾页"),
            prevPage = _.createElement("li", "", "上一页"),
            nextPage = _.createElement("li", "", "下一页");
        console.log(this.total);
        // 总页数
        this.totalPages = Math.ceil(this.total / this.itemsLimit);
        // 当前一组页码中的起始页码，即"上一页"的右边第一个
        this.startPageIndex = Math.floor((this.current - 1) / this.showNum) * this.showNum + 1;

        // 首页页码
        firstPage.dataset.page = 1;
        //尾页页码
        endPage.dataset.page = this.totalPages;

        this.fragment = document.createDocumentFragment();
        this.fragment.appendChild(firstPage);
        this.fragment.appendChild(prevPage);

        var end = ((this.startPageIndex + this.showNum - 1) < this.totalPages ) ? (this.startPageIndex + this.showNum - 1) : this.totalPages; // 显示的页码不能超过总页数
        // 循环添加页码
        for (var i = this.startPageIndex; i <= end; i++) {
            var li = _.createElement("li", "", i);
            li.dataset.page = i;
            this.fragment.appendChild(li);
        }
        this.fragment.appendChild(nextPage);
        this.fragment.appendChild(endPage);
        this.container.appendChild(this.fragment);

        // 将以上元素加入到文档节点中
        this.parent.appendChild(this.container);
        // 设置页码状态
        this.setStatus();
    };

    App.Pagination = Pagination;
})(window.App);


/* page *************/
(function (App) {
    var page = {
        init: function () {
            //var that = this;
            /* 初始页头 */
            this.initHeader();
        },

        initHeader: function () {
            /* 用于页面级调用的， 页头初始化 */
            App.header.init({
                login: function (data) {
                    if (!window.App.user) {
                        window.App.user = data;
                    }
                    this.initProfile(data); //返回数据后执行
                    this.initWorksList(); // 初始作品列表
                    this.initPagination(); // 初始页码组件
                }.bind(this) //bind to page
            });
        },
        initProfile: function (data) {
            this.profile = new App.Profile(data);
        },
        initWorksList: function () {
            this.worksList = new App.WorksList(); //页码组件的回调不是新构造一个列表对象时，这里的参数可以忽略
        },
        initPagination: function () {
            var that = this;
            var itemsLimit = 13;

            this.paginagion = new App.Pagination({
                parent: document.querySelector(".g-body"),
                //total: 260, // 只会影响页数，实际展示作品数与回调的参数相关
                current: 1, //默认激活的页面序号
                showNum: 8, //要显示的页码的数量
                itemsLimit: itemsLimit, //一个页码代表多少作品数量，即显示多少作品
                callback: function (currentPage) {
                    //console.log(this);
                    that.worksList.init({
                        query: {
                            limit: itemsLimit, //当前页返回的作品数量,要一与itemsLimit一致
                            offset: (currentPage - 1) * itemsLimit, //乘数要与limit相同
                            total: 0
                        }
                    })
                }
            });
        }

    };
    document.addEventListener("DOMContentLoaded", function () {
        page.init();
    })

})(window.App);
