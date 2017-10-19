/* *************/
(function (App) {
})(window.App);
/* *************/
(function (App) {
})(window.App);
/* *************/
(function (App) {
    /*
     var fd=new FormData();
     fd.append();
     function progressHandler(e) {
     if (e.lengthComputable) {
     console.log(e.total, e.loaded);
     }
     }
     */
    function Create(options) {
        /* 选择上传文件按钮 */
        this.fileInput = _.$("#btn-upload");
        /* 进度条 */
        this.progressBar = _.$(".upload .u-progress");
        /* 进度详情 */
        this.progressInfo = _.$(".upload .info");
        /* 上传预览 */
        this.previewList = _.$(".u-preview");
        /* 提交按钮 */
        this.submitBtn = _.$(".m-form .create");
        /* 已加入的标签的容器 */
        this.tagList = _.$(".m-form .taglist-add");
        /* 作品授权 字段 */
        this.authorization = _.$(".authorization .select_val");

        /* 表单 */
        this.form = document.forms["main"];
        /* 类型字段 */
        this.category = this.form["category"];
        /* 权限设置 字段 */
        this.privilege = this.form["privilege"];
        /* 表单 作品名 字段 */
        this.name = this.form["name"];
        /* 表单 作品说明 字段 */
        this.description = this.form["description"];

        /* 成功预上传的图片组 */
        this.pictures = [];

        //_.extend(this.options);
        /*
         {
         fileInput : _.$("#btn-upload"),
         progressBar : _.$(".upload progress"),
         progressInfo : _.$(".upload .info"),
         previewList : _.$(".u-preview")
         }
         */

        this.init();
        this.submit();
    }

    Create.prototype.submit = function () {
        var that = this;
        this.form.addEventListener("submit", function (e) {
            e.preventDefault();
            // 作品名无效则return
            if (that.name.value.trim().length === 0) {
                that.name.classList.add("z-error");
                return;
            }

            var data = {
                name: that.name.value.trim(),
                tag: App.tagList.join(","),
                description: that.description.value.trim(),
                coverUrl: that.previewList.dataset.coverurl,

                coverId: Number(that.previewList.dataset.coverid),
                authorization: Number(that.authorization.dataset.code),
                privilege: Number(that.privilege.value),
                category: Number(that.category.value),

                pictures: that.pictures
            }
            console.log(data);
            _.ajax({
                url: "/api/works",
                method: "POST",
                data: data,
                success: function (response) {
                    window.location.href = "/works";
                }
            })
        })
    }
    Create.prototype.init = function () {
        var that = this;
        this.fileInput.addEventListener("change", function (e) {
                var files = e.target.files;
                /* 当前选择的图片组 */
                var sizeExceedFiles = [];
                var sizeOkFiles = [];
                var maxSize = 1024 * 1024;

                // 即将上传的加上已经上传的不得超过10张
                if (files.length > 10) {
                    var alert = new App.AlertModal({
                        title: "",
                        content: "每次选择照片不得超过10张"
                    })
                    return;
                }
                //根据文件大小分组
                for (var i = 0; i < files.length; i++) {
                    if (files[i].size > maxSize) {
                        sizeExceedFiles.push(files[i]);
                    }
                    else {
                        sizeOkFiles.push(files[i]);
                    }
                }
                // 有文件过大的提示
                if (sizeExceedFiles.length > 0) {
                    var str = "";
                    //将过大的文件名组成字串
                    for (var i = 0; i < sizeExceedFiles.length; i++) {
                        str += '"' + sizeExceedFiles[i].name + '"</br>';
                    }
                    str = "文件" + str + "超过1M,无法上传"
                    // 生成提示实例
                    var alert = new App.AlertModal({
                        title: "",
                        content: str
                    })
                    return;
                }
                // 调用上传函数
                that.uploadFiles(sizeOkFiles);
            }
        );
        // 对预览列表中的操作按钮进行侦听
        this.previewList.addEventListener("click", function (e) {
            var it = e.target;
            // 删除按钮
            if (it.classList.contains("u-icon-delete")) {
                var idx = [].indexOf.call(that.previewList.children, it.parentNode);
                /* 对应当前图片在列表的索引 */
                console.log(idx);
                /* 删除对应在图片组中的数据 */
                that.pictures.splice(idx, 1);
                /* 删除对应节点 */
                that.previewList.removeChild(it.parentNode);
            }
            // 设为封面按钮
            if (it.classList.contains("u-btn-primary")) {
                // 将当前图片的id、url赋值给容器元素，备上传数据时用
                that.previewList.dataset.coverid = it.parentNode.dataset.id;
                that.previewList.dataset.coverurl = it.parentNode.dataset.url;
            }
        })
    }
    Create.prototype.uploadFiles = function (files) {
        /*
        *  不懂计算总多文件上传总长度，
        *  这里进度条和百分比都是显示单个文件的进度
        * */
        var that = this;
        //var totalSize = 0;/* 总长度 */
        //var loadedSize = 0;/* 已上传长度 */
        var uploadingFileIndex = 0;
        var count = 1;
        // 开始上传，添加按钮不可用，进度条出现
        this.fileInput.setAttribute("disabled", "true");
        this.progressBar.classList.remove("f-dn");


        function progressHandler(e) {
            if (event.lengthComputable) {
                if (e.loaded < e.total) {
                    that.progressInfo.innerText = "共" + files.length + "个文件," + "正在上传第" + count + "个文件,上传进度：" + ((e.loaded / e.total * 100).toFixed(2)) + "%"; //单个文件的百分比
                }
                else {
                    // 此时单项上传完成
                    //loadedSize += e.total;
                    that.progressInfo.innerText = "共" + files.length + "个文件," + "正在上传第" + count++ + "个文件,上传进度：" + ((e.loaded / e.total * 100).toFixed(2)) + "%"; //单个文件的百分比

                }
                //var loading=loadedSize+e.loaded;/* 当前上传长度 */
                that.progressBar.firstElementChild.style.width = Math.floor(e.loaded / e.total * 100) + "%";/* 进度条 活动 */

                /*
                 that.progressBar.max = e.total;
                 that.progressBar.value = e.loaded;
                 */
                /* 当个文件进度 */
            }
        }


        function upload() {
            var file = files[uploadingFileIndex++];
            if (!file) {
                that.fileInput.removeAttribute("disabled"); //添加文件按钮可用
                that.progressBar.classList.add("f-dn");
                //that.progressInfo.classList.add("f-dn");
                // 创建按钮切到可用状态
                that.submitBtn.removeAttribute("disabled");
                console.log("上传完成！");
                return;
            }

            var fd = new FormData();
            fd.append("file", file, file.name);
            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            xhr.onload = function () {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    //console.log("请求成功，并开始调用函数")
                    var data = xhr.responseText;
                    if (_.isJSON(data)) {
                        data = JSON.parse(data);
                    }

                    // 收集返回数据，等等submit
                    that.pictures.push(data.result);
                    console.log(data);
                    // 图片上传后返回的链接生成预览列表
                    var source = '<li class="preview-item"  data-id="{{id}}" data-url="{{url}}"><img src="{{url}}"><i class="u-icon u-icon-delete"></i><b class="u-btn u-btn-primary">设为封面</b></li>';
                    var context = {
                        id: data.result.id,
                        url: data.result.url
                    }
                    that.previewList.innerHTML += _.renderItem(source, context);

                    upload();
                }
                else {
                    console.log("Request was unsuccessful: " + xhr.status);
                }
            };
            xhr.upload.addEventListener("progress", progressHandler);
            xhr.open("POST", "/api/works?upload");
            xhr.send(fd);

        }
        upload(); // 上传第一张
    }

    /*
     * 文件上传
     *将合法文件一条一条上传
     * 显示总体积、进度
     * 上传成功的在本地列表显示
     *
     * */
    App.Create = Create;
})(window.App);

/* 标签**********************************************************************************/
(function (App) {
    function Tag(options) {
        _.extend(this, options);/* 原型有装添加标签的容器、推荐标签的容器、预设标签的数组 */
        this.addTagBtn = this.addContainer.querySelector(".addtag");/* 添加标签按钮 */
        this.addTagInput = this.addTagBtn.querySelector("input");/* 输入标签名的字段 */
        this.init();
    }

    Tag.prototype.addRecommend = function (result) {
        var html = "";
        var tags = result.split(",");/* 推荐标签转数组 */
        tags.forEach(function (item) {
            html += '<li class="taglist-item "><i>+</i><em class="taglist-text">' + item + '</em></li>'
        })
        this.rcmContainer.innerHTML = html;
    }
    Tag.prototype.eventHandle = function () {
        var that = this;
        // 移除标签
        this.addContainer.addEventListener("click", function (e) {
            var it = e.target;
            // 移除标签及其值
            if (it.classList.contains("remove")) {
                console.log(it.parentNode);
                var idx = that.list.indexOf(it.previousElementSibling.innerText);/* 根据文本内容找到当前索引 */
                that.list.splice(idx, 1);
                console.log(that.list);
                that.addContainer.removeChild(it.parentNode);

            }
        });
        // 标签输入框侦听，输入的新标签
        this.addTagInput.addEventListener("keydown", function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                that.addTagBtn.classList.remove("z-acitve");
                var text = that.addTagInput.value.trim();
                that.addTagInput.value = ""; //把留存的值清空，下次不显示
                if (text.length > 0 && that.list.indexOf(text) === -1) {
                    that.add(text);
                    that.list.push(text); // 新的会签值加入到表示存在标签数组
                }
            }

        });
        // 显示标签输入框
        this.addTagBtn.addEventListener("click", function (e) {
            that.addTagBtn.classList.add("z-acitve");
            that.addTagInput.focus();
            e.stopPropagation();
        });
        // 关闭输入框
        document.addEventListener("click", function (e) {
            that.addTagBtn.classList.remove("z-acitve");
        });


        this.rcmContainer.addEventListener("click", function (e) {
            var it = e.target;
            var text = "";
            // 点击的是容器本身则不处理
            if (it === that.rcmContainer) return;
            // 获取标签文本
            if (it.tagName === "LI") {
                text = it.lastElementChild.innerText;
            }
            else {
                text = it.parentNode.lastElementChild.innerText;
            }
            // 与已保存的标签无重复的，添加到标签组中
            if (text.length > 0 && that.list.indexOf(text) === -1) {
                that.add(text);
                that.list.push(text); // 新的会签值加入到表示存在标签数组
            }

        });

    }
    Tag.prototype.add = function (tags) {

        if (tags && !Array.isArray(tags)) {
            if (this.list.indexOf(tags) !== -1) {
                // 传入的单项如已存在就不再进行加入操作
                return
            }
            tags = [tags];
        }
        tags.forEach(function (item) {
            var li = _.createElement("li", "taglist-item", "");
            var em = _.createElement("em", "taglist-text", item);
            var button = _.createElement("b", "remove u-btn", "x"); //以b元素代替button
            li.appendChild(em);
            li.appendChild(button);
            this.addContainer.insertBefore(li, this.addTagBtn);
        }, this)
    }
    Tag.prototype.init = function () {
        var that = this;
        _.ajax({
            url: "/api/tags/?recommend",
            success: function (response) {
                //console.log(response,"tags");
                if (response.code === 200) {
                    // 将得到的推荐标签添加到节点
                    that.addRecommend(response.result);
                }
            }
        });
        this.add(this.tags);
        this.list = this.tags.slice(0);/* 用于装已添加标签的数组 */
        App.tagList = this.list; /* 标签组函数外可用 */
        this.eventHandle();
    }
    App.Tag = Tag;
})(window.App);


/* page *************/
(function (App) {
    var page = {
        init: function () {
            var that = this;
            var warrantList = [
                [0, "不限制用途"],
                [1, "不可商用"]
            ];
            /* 初始页头 */
            this.initHeader();
            // 侧栏选择器
            this.seletor = new App.Cascade(_.$(".g-side .warrant-selector"), warrantList);
            // 初始化标签
            this.tag = new App.Tag({
                addContainer: _.$(".taglist-add"),
                rcmContainer: _.$(".taglist-recommend"),
                tags: ["萌萌哒", "甜甜的", "那年花开正月圆"]
            });

            this.create = new App.Create();
        },

        initHeader: function (argument) {
            /* 用于页面级调用的， 页头初始化 */
            App.header.init({
                login: function (data) {
                    if (!window.App.user) {
                        window.App.user = data;
                    }
                }.bind(this) //bind to page
            });
        }

    }
    document.addEventListener("DOMContentLoaded", function () {
        page.init();
    })

})(window.App);
