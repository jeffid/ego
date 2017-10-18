/* Profile *************/
(function (App) {
    function Profile(data) {
        this.data = data;
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
    Profile.prototype.getAddress = function (code) {
        //console.log("addrsss:",code);
        var code = code.toString(), //传入编码可以是代表省、市、区的6位数字，转字串
            code1 = code.slice(0, 2),
            code2 = code.slice(2, 4),
            code3 = code.slice(4);
        var obj = {};
        var ADDR = ADDRESS_CODES;
        for (var i = 0; i < ADDR.length; i++) {
            var province = ADDR[i];
            if (code1 === province[0].slice(0, 2)) {
                obj.province = province[1];

                if (code2 === "00") return obj; //编码为”00“说明没这级详细地址，跳出
                var cityList = province[2]; //城市数组
                for (var j = 0; j < cityList.length; j++) {
                    var city = cityList[j]; //当前城市项
                    if (code2 === city[0].slice(2, 4)) {
                        obj.city = city[1];

                        if (code3 === "00") return obj;
                        var districtList = city[2];
                        for (var k = 0; k < districtList.length; k++) {
                            var district = districtList[k];
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

    }
    Profile.prototype.render = function (dateObj) {
        var iconConfig = ["u-icon u-icon-sex u-icon-male", "u-icon u-icon-sex u-icon-female"];//0应为男
        if (this.data.birthday === null || this.data.birthday.length < 8) {
            /* 参照标准日期规格"xxxx-x-x",至少8位数 */
            this.age = "年龄未知";
            this.constellation = "星座未知";
        }
        else {
            this.dateObj = new Date(this.data.birthday);
            this.age = new Date().getFullYear() - this.dateObj.getFullYear();
            this.constellation = this.getConstellation(this.dateObj);

        }
        this.nickname = this.data.nickname;
        this.sexClassName = (typeof this.data.sex !== "number") ? "" : iconConfig[this.data.sex];
        this.address = (typeof this.data.city !== "number") ? "未知城市" : this.getAddress(this.data.city).city;

        var source = document.querySelector("#user-info-tpl");
        //var template=Handlebars.compile(source);
        source.outerHTML = _.renderItem(source.innerHTML, this);
    }

    App.Profile = Profile;
})(window.App);
/* 作品列表*************/
(function (App) {
    function WorksList(options) {
        var that = this;
        this.container = _.$(".g-main .m-works");
        this.source = _.$("#works-item").innerHTML;
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
                }
                if (e.target.classList.contains("u-icon-edit")) {
                    that.editWorks(context, worksItem);
                }
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
                success: function (response) {
                    that.init();
                }
            })
        })
    }
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
                        _.$("h3", worksItem).innerHTML = responce.result.name;
                    }
                })
            }

        })

    }
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
    }
    WorksList.prototype.init = function (options) {
        //页码Pagination实例可以调用来生成相应作品列表
        var that = this;
        this.container.innerHTML += '<img src="../../res/images/loading.gif" alt="正在加载中...">';
        _.ajax({
            url: "/api/works",
            data: options.query,
            success: function (response) {
                //console.log("works:", response);
                this.renderList(response);
            }.bind(this)
        });
    }

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
                this.total = this.total || response.result.total; // 获取总作品长度
                // 下面操作依赖作品总长
                this.render();
                this.eventHandle();

            }.bind(this)
        });

    }

    //
    Pagination.prototype.eventHandle = function () {
        var that = this;
        this.callback(this.current);
        this.container.addEventListener("click", function (e) {
            var it = e.target;
            //if(!that.container.contains(it)) return;
            if (it === that.container) return;
            if (it.classList.contains("z-disabled") || it.classList.contains("z-active")) return;

            var itPageIndex = Number(it.dataset.page);
            that.current = itPageIndex;
            if (itPageIndex >= that.startPageIndex && itPageIndex < that.startPageIndex + that.showNum) {
                that.setStatus();
            }
            else {
                that.render();
            }
            that.callback(that.current);
        })

    }
    Pagination.prototype.remove = function () {
        this.parent.removeChild(this.container);
        this.container = null;
    }

    // 每次render完、更新current切换状态
    Pagination.prototype.setStatus = function () {
        var crr = this.current;
        var list = [].slice.call(this.container.children);

        // 全部清空类名
        list.forEach(function (item) {
            item.className = "";
        })

        var index = crr - this.startPageIndex + 2;
        list[index].className = "z-active";

        if (crr === 1) {
            list[0].className = "z-disabled";
            list[1].className = "z-disabled";
        }
        if (crr === this.totalPages) {
            list[list.length - 1].className = "z-disabled";
            list[list.length - 2].className = "z-disabled";
        }

        // 设置上一页、下一页的指向页码
        if (this.totalPages !== 1) {

            list[1].dataset.page = crr - 1;
            list[list.length - 2].dataset.page = crr + 1;
        }

        /*
         * current,设当前页码z-active
         * current，判断首页、上一页、尾页、下一页可用与否
         * 可用情况下设置上一页、下一页的指向页码
         * */
    }

    Pagination.prototype.render = function () {
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

        this.setStatus();
        /*
         * 第一页
         * 上一页，current-1
         * 当前页，current
         * 其它页，
         * 下一页，current+1
         * 尾页
         * this.total作品总数
         * this.itemsLimit
         * 求总页数
         * 求起始页数
         * */
    }

    App.Pagination = Pagination;
})(window.App);


/* page *************/
(function (App) {
    var page = {
        init: function () {
            var that = this;
            /* 初始页头 */
            this.initHeader();
        },

        initHeader: function (argument) {
            /* 用于页面级调用的， 页头初始化 */
            App.header.init({
                login: function (data) {
                    if (!window.App.user) {
                        window.App.user = data;
                    }
                    this.initProfile(data); //返回数据后执行
                    this.initWorksList();
                    this.initPagination();
                }.bind(this) //bind to page
            });
        },
        initProfile: function (data) {
            this.profile = new App.Profile(data);
        },
        initWorksList: function (options) {
            this.worksList = new App.WorksList(options); //页码组件的回调不是新构造一个列表对象时，这里的参数可以忽略
        },
        initPagination: function () {
            var that = this;
            var itemsLimit = 13;

            this.paginagion = new App.Pagination({
                parent: document.querySelector(".g-body"),
                total: 260, // 只会影响页数，实际展示作品数与回调的参数相关
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

    }
    document.addEventListener("DOMContentLoaded", function () {
        page.init();
    })

})(window.App);
