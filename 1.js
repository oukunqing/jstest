function test(func){

    typeof func === 'function' && func('abc');
}

test();


var url = '/js/test/123.js?';

var arr = url.split('/');

console.log(arr);




var getQueryString = function (url, name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    //var str = window.location.search;
    var str = url.substr(url.indexOf('?'));
    if (str.indexOf('?') >= 0) {
        var par = str.substr(1).match(reg);
        return par != null ? unescape(par[2]) : null;
    }
    return null;
};

var getRequestString = function (url, name) {
    if(typeof url !== 'string'){
        url = location.href || location.search;
    }
    var params = url.substr(url.indexOf('?')); // location.search; //获取字符串中'?'符后的字串
    var arr = {};
    if (params.indexOf('?') >= 0) {
        var strs = params.substr(1).split('&');
        for (var i = 0, c = strs.length; i < c; i++) {
            var pos = strs[i].indexOf('=');
            var key = strs[i].split('=')[0];
            if (key != '') {
                arr[key] = pos > 0 ? unescape(strs[i].substr(pos + 1)) : '';
            }
        }
    }
    return name != undefined ? arr[name] : arr;
};


var url  = 'ab.aspx?id=123&name=abc&type=5';

console.log(getQueryString(url));
console.log(getRequestString(url));