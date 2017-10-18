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
        _.extend(this.options);
        this.fileInput = _.$("#btn-upload");
        this.progressBar = _.$(".upload .u-progress");
        this.progressInfo = _.$(".upload .info");
        this.previewList = _.$(".u-preview");
        this.submitBtn = _.$(".m-form .create");
        this.tagList = _.$(".m-form .taglist-add");
        this.authorization = _.$(".authorization .select_val");

        this.form = document.forms["main"];
        this.category = this.form["category"];
        this.privilege = this.form["privilege"];
        this.name = this.form["name"];
        this.description = this.form["description"];

        this.pictures = [];
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
            console.log("submintttt");
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
                var sizeExceedFiles = [];
                var sizeOkFiles = [];
                var maxSize = 1024 * 1024;

                // 即将上传的加上已经上传的不得超过10张
                if ((files.length + that.pictures.length) > 10) {
                    var alert = new App.AlertModal({
                        title: "",
                        content: "每次选择照片不得超过10张"
                    })
                    return;
                }
                for (var i = 0; i < files.length; i++) {
                    if (files[i].size > maxSize) {
                        sizeExceedFiles.push(files[i]);
                    }
                    else {
                        sizeOkFiles.push(files[i]);
                    }
                }
                if (sizeExceedFiles.length > 0) {
                    var str = "";
                    for (var i = 0; i < sizeExceedFiles.length; i++) {
                        str += '"' + sizeExceedFiles[i].name + '"</br>';
                    }
                    //alert("以下文件体积过大，请更换选择！\n"+str);
                    str = "文件" + str + "超过1M,无法上传"
                    var alert = new App.AlertModal({
                        title: "",
                        content: str
                    })
                    return;
                }

                that.uploadFiles(sizeOkFiles);
            }
        );
        /* 设置coverId，删除候传图片 */
        this.previewList.addEventListener("click", function (e) {
            var it = e.target;
            if (it.classList.contains("u-icon-delete")) {
                that.pictures.splice(Number(it.parentNode.dataset.index), 1);
                that.previewList.removeChild(it.parentNode);
            }
            if (it.classList.contains("u-btn-primary")) {
                that.previewList.dataset.coverid = it.parentNode.dataset.id;
                that.previewList.dataset.coverurl = it.parentNode.dataset.url;
            }
        })
    }
    Create.prototype.uploadFiles = function (files) {
        var that = this;
        //var totalSize = 0;
        var loadeSize = 0,
            uploadingFileIndex = 0;
        var count = 1;

        this.fileInput.setAttribute("disabled", "true");
        this.progressBar.classList.remove("f-dn");
        //this.progressInfo.classList.remove("f-dn");

        /*
         function getTotalSize() {
         var temp = new FormData();

         for (var i = 0; i < files.length; i++) {
         totalSize += files[i].size;
         }
         }
         */

        function progressHandler(e) {
            if (event.lengthComputable) {
                if (e.loaded === e.total) {
                    loadeSize += e.total;
                    if (count < files.length) {
                        count++ // 当前数不超过总文件数
                    }
                    //console.log(count++, "完成");
                }
                //var loading=loadeSize+e.loaded;
                //console.log("Received " + loading + " of " + totalSize + " bytes");
                //console.log("Received " + e.loaded + " of " + e.total + " bytes");
                /*
                 that.progressBar.max = e.total;
                 that.progressBar.value = e.loaded;
                 */
                that.progressBar.firstElementChild.style.width = Math.floor(e.loaded / e.total * 100) + "%";
                that.progressInfo.innerText = "共" + files.length + "个文件," + "正在上传第" + count + "个文件,上传进度：" + ((e.loaded / e.total * 100).toFixed(2)) + "%"; //单个文件的百分比
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
                    // 图片上传后返回的链接生成预览列表,data-index加入文件索引，从0起
                    var html = '<li class="preview-item" data-index="' + (uploadingFileIndex - 1) + ' "data-id="' + data.result.id + '"data-url="' + data.result.url + '"><img src="' + data.result.url + '"><i class="u-icon u-icon-delete"></i><b class="u-btn u-btn-primary">设为封面</b></li>';
                    that.previewList.innerHTML += html;

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

/* 标签*************/
(function (App) {
    function Tag(options) {
        _.extend(this, options);
        this.addTagBtn = this.addContainer.querySelector(".addtag");
        this.addTagInput = this.addTagBtn.querySelector("input");
        this.init();
    }

    Tag.prototype.addRecommend = function (result) {
        var html = "";
        var tags = result.split(",");
        tags.forEach(function (item) {
            html += '<li class="taglist-item "><i>+</i><em class="taglist-text">' + item + '</em></li>'
        })
        this.rcmContainer.innerHTML = html;
    }
    Tag.prototype.remove = function () {
    }
    Tag.prototype.eventHandle = function () {
        var that = this;
        this.addContainer.addEventListener("click", function (e) {
            var it = e.target;
            // 移除标签及其值
            if (it.classList.contains("remove")) {
                var idx = that.list.indexOf(it.previousElementSibling.innerText);
                that.list.splice(idx, 1);
                console.log(that.list);
                that.addContainer.removeChild(it.parentNode);

            }
        })
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

        })
        this.addTagBtn.addEventListener("click", function (e) {
            that.addTagBtn.classList.add("z-acitve");
            that.addTagInput.focus();
            e.stopPropagation();
        })
        document.addEventListener("click", function (e) {
            that.addTagBtn.classList.remove("z-acitve");
        })


        this.rcmContainer.addEventListener("click", function (e) {
            var it = e.target;
            var text = "";
            if (it === that.rcmContainer) return;
            if (it.tagName === "LI") {
                text = it.lastElementChild.innerText;
            }
            else {
                text = it.parentNode.lastElementChild.innerText;
            }
            if (text.length > 0 && that.list.indexOf(text) === -1) {
                that.add(text);
                that.list.push(text); // 新的会签值加入到表示存在标签数组
            }

        })

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
            var button = _.createElement("button", "remove u-btn", "x");
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
                    that.addRecommend(response.result);
                }
            }
        });
        this.add(this.tags);
        this.list = this.tags.slice(0);
        App.tagList=this.list; //引用标签组
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
                [1, "不限制用途"],
                [2, "不可商用"]
            ]
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
