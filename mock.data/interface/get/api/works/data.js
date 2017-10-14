module.exports = function (json, req) {

    var result = json.result;
    //var query = JSON.parse(req).query;
    var query=req.query;
    if (query.total === "1") {
        // 特别设置为1 时能返回原数据总长
        result.total = result.data.length;
    }
    else {
        delete result.total; //其实情况下，原数据已经改变，因此删除该数量
    }
    result.data = result.data.splice(query.offset, query.limit || 10); // 这时数据长度已按需改变
    return json;
}