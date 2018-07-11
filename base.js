"use strict";

var $ = $ || {
    extend: function(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
    }
};

// $ extend
!function($) {
    $.extend($, {
        isUndefined: function(o) { return typeof o === 'undefined'; },
        isNull: function(o) { return o === null; },
        isBoolean: function(o, dv) { return typeof o === 'boolean' ? o : typeof dv === 'boolean' ? dv : false; },
        isString: function(o) { return typeof o === 'string'; },
        isObject: function(o) { return o !== null && typeof o === 'object'; },
        isArray: Array.isArray || function(o) { return Object.prototype.toString.call(o) === '[object Array]'; },
        isFunction: function(o) { return typeof o === 'function' && typeof o.nodeType !== 'number'; },
        isNumber: function(o) { return typeof o === 'number'; },
        isNumeric: function(o) { return /^[-+]?(\d+)([.][\d]{0,})?$/.test(o); },
        isDecimal: function(o) { return /^[-+]?(\d+)([.][\d]{0,})$/.test(o); },
        isInteger: function(o) { return /^[-+]?(\d+)$/.test(o); },
    }), $.extend($, {
        isRegexp: function(o) { return $.isObject(o) || $.isFunction(o) ? ('' + o).indexOf('/') == 0 : false; },
        isNullOrUndefined: function(o) { return $.isUndefined(o) || $.isNull(o); },
        isEmpty: function(o) {
            if (typeof o === 'undefined' || null === o) { return true; }
            else if (typeof o === 'string') { return '' === $.trim(o); }
            else if ($.isArray(o)) { return 0 === o.length; }
            else if ($.isObject(o)) { for (var name in o) { return false; } return true; }
            return false;
        }
    }), $.extend($, {
        trim: $.trim || function(o) { return o.replace(/(^[\s]*)|([\s]*$)/g, ''); },
        redirect: function(url) { location.href = url; },
        toJsonString: function(o) { return JSON.stringify(o); },
        toJson: function(s) { return JSON.parse(s); },
        toEncode: function(s) { return encodeURIComponent(s); },
        toDecimal: function(o, defaultValue, decimalLen) {
            var v = parseFloat(o, 10);
            v = !isNaN(v) && $.isInteger(decimalLen) ? v.round(Math.abs(decimalLen)) : v;
            return !isNaN(v) ? v : Number(defaultValue) || 0;
        },
        toInteger: function(o, defaultValue) {
            var v = parseInt(o, 10);
            return !isNaN(v) ? v : Number(defaultValue) || 0;
        }
    });
}($);

//Dictionary
!function($) {
    function Dictionary() {
        var get = function(data) {
            var obj = { keys: [], values: [] };
            for (var k in data) {
                obj.keys.push(k), obj.values.push(data[k]);
            }
            return obj;
        }, _ = this;

        _.data = {},
            _.keys = [],
            _.values = [],
            _.add = function(key, value) {
                if (!$.isUndefined(key) && !_.contains(key)) {
                    var val = !$.isUndefined(value) ? value : null;
                    _.data[key] = val, _.keys.push(key), _.values.push(val);
                }
                return _;
            },
            _.remove = function(keys) {
                var arr = $.isArray(keys) ? keys : [keys];
                for (var i in arr) {
                    var key = arr[i];
                    if (!$.isUndefined(_.data[key])) {
                        delete _.data[key];
                    }
                }
                var obj = get(_.data);
                _.keys = obj.keys, _.values = obj.values;
                return _;
            },
            _.clear = function() {
                return _.data = {}, _.keys = [], _.values = [], _;
            },
            _.contains = function(key, isAdd, value) {
                //return !$.isUndefined(_.data[key]);
                if ($.isUndefined(_.data[key])) {
                    if (isAdd) { _.add(key, value); }
                    return false;
                }
                return true;
            },
            _.count = function() {
                return _.keys.length;
            },
            _.getValue = function(key, defaultValue) {
                return !$.isUndefined(_.data[key]) ? _.data[key] : defaultValue;
            };
    }

    if (typeof window === 'object') {
        window.Dictionary = Dictionary;
    } else if (typeof global === 'object') {
        global.Dictionary = Dictionary;
    }
}($);

// extend
!function($) {
    var extendIndex = 1,
        isProperty = function (object, property) {
            return object.hasOwnProperty(property) && (property in object);
        },
        extend = function (destination, source, forceExtend, constructor) {
            if ($.isString(forceExtend) && $.isUndefined(constructor)) {
                constructor = forceExtend, forceExtend = false;
            }
            constructor = constructor || destination.constructor.toString().split(/[\s\()]/)[1] || 'Object';
            for (var property in source) {
                var isExtend = $.isUndefined(destination[property]), func = source[property];
                if (isExtend || forceExtend) {
                    destination[property] = func;
                }
                if ($.isFunction(func)) {
                    var s = func.toString(), declare = s.substr(0, s.indexOf('{')), native = !isExtend ? '[native code]' : '';
                    console.log('extend[' + (extendIndex++) + ']:', constructor + '.' + property, '=', declare, native);
                }
            }
            return destination;
        };

    extend(Array.prototype, {
        indexOf: function(el) {
            for (var i = 0, n = this.length; i < n; i++) {
                if (this[i] === el) {
                    return i;
                }
            }
            return -1;
        },
        forEach: function(callback, thisValue) {
            if (typeof callback === 'function') {
                for (var i = 0, c = this.length; i < c; i++) {
                    callback.call(thisValue, this[i], i, this);
                }
            }
        }
    }, 'Array.prototype');

    extend(String.prototype, {
        trim: function() {
            return this.replace(/(^[\s]*)|([\s]*$)/g, '');
        },
        trimStart: function() {
            return this.replace(/(^[\s]*)/g, '');
        },
        trimEnd: function() {
            return this.replace(/([\s]*$)/g, '');
        },
        trimLeft: function() {
            return this.trimStart();
        },
        trimRight: function() {
            return this.trimEnd();
        },
        padStart: function(totalWidth, paddingChar) {
            var s = this, char = paddingChar || '0', c = totalWidth - s.length;
            for (var i = 0; i < c; i++) {
                s = char + s;
            }
            return s;
        },
        padEnd: function(totalWidth, paddingChar) {
            var s = this, char = paddingChar || '0', c = totalWidth - s.length;
            for (var i = 0; i < c; i++) {
                s += char;
            }
            return s;
        },
        padLeft: function(totalWidth, paddingChar) {
            return this.padStart(totalWidth, paddingChar);
        },
        padRight: function(totalWidth, paddingChar) {
            return this.padEnd(totalWidth, paddingChar);
        },
        startsWith: function(s) {
            return this.slice(0, s.length) === s;
        },
        endsWith: function(s) {
            return this.slice(-s.length) === s;
        },
        startWith: function(s) {
            return this.startsWith(s);
        },
        endWith: function(s) {
            return this.endsWith(s);
        },
        len: function() {
            return this.replace(/([^\x00-\xff])/g, 'aa').length;
        },
        replaceAll: function(pattern, v) {
            return this.replace($.isRegexp(pattern) ? pattern : new RegExp(pattern, 'gm'), v);
        },
        append: function(v, c) {
            var s = this;
            if ($.isNumber(c)) {
                for (var i = 0; i < c; i++) { s += v; }
                return s;
            }
            return s + v;
        },
        insert: function(v, c) {
            var s = this;
            if ($.isNumber(c)) {
                for (var i = 0; i < c; i++) { s = v + s; }
                return s;
            }
            return v + s;
        },
        clean: function(s) {
            var reg = new RegExp('(' + (s || ' ') + ')', 'g');
            return this.replace(reg, '');
        },
        clear: function(s) {
            //清除字符串的多余字符，默认清除 - 和 空格
            var reg = new RegExp('[' + (s || '- ') + ']', 'g');
            return this.replace(reg, '');
        },
        separate: function(delimiter, itemLen) {
            var reg = new RegExp('(.{' + itemLen + '}(?!$))', 'g');
            return this.replace(reg, '$1' + delimiter);
        },
        isEmpty: function() {
            return this.trim() === '';
        },
        isNumeric: function() {
            //return /^[-+]?(\d+)(.[\d]{0,})?$/.test(this);
            return $.isnumeric(this);
        },
        isDecimal: function() {
            //return /^[-+]?(\d+)(.[\d]{0,})$/.test(this);
            return $.isDecimal(this);
        },
        isInteger: function() {
            //return /^[-+]?(\d+)$/.test(this); 
            return $.isInteger(this);
        },
        isFloat: function() {
            return $.isDecimal(this);
        },
        isInt: function() {
            return $.isInteger(this);
        },
        toNumber: function(defaultValue, isFloat, decimalLen) {
            //这里判断是否是数字的正则规则是 判断从数字开始到非数字结束，根据 parseFloat 的规则
            var s = this, v = 0, dv = defaultValue, pattern = /^[-+]?(\d+)(.[\d]{0,})/;
            if ($.isNumeric(dv)) {
                if ($.isInteger(isFloat)) {
                    decimalLen = isFloat, isFloat = true;
                } else {
                    if ($.isUndefined(isFloat)) {
                        isFloat = pattern.test(dv) || pattern.test(s);
                    }
                    decimalLen = $.isInteger(decimalLen) ? decimalLen : (dv.toString().split('.')[1] || '').length;
                }
            } else if ($.isBoolean(dv)) {
                decimalLen = $.isInteger(isFloat) ? isFloat : decimalLen, isFloat = dv, dv = 0;
            } else {
                isFloat = $.isBoolean(isFloat, pattern.test(dv) || pattern.test(s));
            }

            if (isFloat) {
                ////当decimalLen>0时，才进行四舍五入处理
                //v = parseFloat(s, 10), v = !isNaN(v) && $.isInteger(decimalLen) && decimalLen > 0 ? v.round(decimalLen) : v;
                //只要decimalLen为整数，就进行四舍五入处理
                v = parseFloat(s, 10), v = !isNaN(v) && $.isInteger(decimalLen) ? v.round(Math.abs(decimalLen)) : v;
            } else {
                v = parseInt(s, 10);
            }
            return !isNaN(v) ? v : Number(dv) || 0;
        },
        toInt: function(defaultValue) {
            //return this.toNumber(defaultValue, false);
            /*
            var v = parseInt(this, 10);
            return !isNaN(v) ? v : Number(defaultValue) || 0;
            */
            return $.toInteger(this, defaultValue);
        },
        toFloat: function(defaultValue, decimalLen) {
            //return this.toNumber(defaultValue, true, decimalLen);
            /*
            var v = parseFloat(this, 10);
            v = !isNaN(v) && $.isInteger(decimalLen) ? v.round(Math.abs(decimalLen)) : v;
            return !isNaN(v) ? v : Number(defaultValue) || 0;
            */
            return $.toDecimal(this, defaultValue, decimalLen);
        },
        toThousand: function(delimiter) {
            var a = this.split('.'), hasPoint = this.indexOf('.') >= 0;
            return a[0].replace(/\B(?=(?:[\dA-Fa-f]{3})+$)/g, delimiter || ',') + (hasPoint ? '.' + (a[1] || '') : '');
        },
        toDate: function(format) {
            var ts = Date.parse(this.replace(/-/g, '/'));
            if (isNaN(ts) && /^[\d]{10,13}$/.test(this)) {
                ts = Number(this.padRight(13));
            }
            var dt = new Date(ts);
            if (isNaN(dt.getFullYear())) {
                console.error('Date time format error: ', this);
                console.trace();
            }
            return $.isString(format) ? dt.format(format) : dt;
        },
        toArray: function(delimiter, type, keepZero, distinct) {
            if ($.isBoolean(type)) {
                distinct = keepZero, keepZero = type, type = null;
            }
            var d = typeof delimiter === 'string' ? delimiter : ',|',
                keep = $.isBoolean(keepZero, true), distinct = $.isBoolean(distinct, false),
                reg = new RegExp('([' + d + ']){2,}', 'g'), p1 = '[\\s]{0,}', p2 = '[' + d + ']+',
                //清除空项和首尾分隔符
                s = this.replace(reg, '$1').replace(new RegExp('(^' + p1 + p2 + ')|(' + p2 + p1 + '$)', 'g'), ''),
                //判断是否要转换成数字
                isNumber = ['number', 'int', 'float'].indexOf(type) >= 0 || new RegExp('^([-\\d\\s.' + d + ']+)$').test(s), isInt = type === 'int',
                arr = s.split(new RegExp('[' + d + ']')), c = arr.length, list = [], dic = new Dictionary();
            for (var i = 0; i < c; i++) {
                var t = !isNumber ? arr[i] : isInt ? parseInt(arr[i], 10) : parseFloat(arr[i], 10), k = ('' + t), pass = true;
                if (!t || (isNumber && isNaN(t))) {
                    pass = false;
                } else if (distinct) {
                    pass = !dic.contains(k, true, t);
                }
                if (pass && (!isNumber || (keep || t))) {
                    list.push(t);
                }
            }
            return list;
        },
        timeSpan: function(dt2) {
            return this.toDate().timeSpan(dt2.toDate());
        },
        equals: function(obj) {
            if (null === obj) {
                return false;
            }
            var str = obj.toString();
            if (this.length != str.length) {
                return false;
            }
            return this === str;
        },
        compareTo: function(obj) {
            var p = /^[-+]?(\d+)(.[\d]{0,})?$/, s1 = p.test(this) ? Number(this) : this, s2 = p.test(obj) ? Number(obj) : obj;
            if (isNaN(s1) || isNaN(s2)) {
                s1 = s1.toString(), s2 = s2.toString();
            }
            return s1 > s2 ? 1 : s1 < s2 ? -1 : 0;
        }
    }, 'String.prototype');

    extend(String, {
        compare: function(s1, s2) {
            return s1.compareTo(s2);
        }
    }, 'String');

    //Boolean.prototype extend
    extend(Boolean.prototype, {
        toNumber: function() {
            return Number(this);
        }
    }, 'Boolean.prototype');

    //Number.prototype extend
    extend(Number.prototype, {
        getDecimalLen: function() {
            return (this.toString().split('.')[1] || '').length;
        },
        delDecimalPoint: function() {
            return Number(this.toString().replace('.', ''));
        },
        add: function(arg) {
            var a = this.getDecimalLen(), b = arg.getDecimalLen(), m = Math.pow(10, Math.max(a, b));
            return (this.mul(m) + arg.mul(m)) / m;
        },
        sub: function(arg) {
            return this.add(-arg);
        },
        mul: function(arg) {
            var a = this.getDecimalLen(), b = arg.getDecimalLen(), m = a + b;
            return this.delDecimalPoint() * arg.delDecimalPoint() / Math.pow(10, m);
        },
        div: function(arg) {
            var a = this.delDecimalPoint(), b = arg.delDecimalPoint(), n = this.getDecimalLen(), m = arg.getDecimalLen();
            return (a / b).mul(Math.pow(10, m - n));
        },
        round: function(len) {
            var m = Math.pow(10, len || 0);
            return Math.round(this * m) / m;
        },
        padLeft: function(totalWidth, paddingChar) {
            return this.toString().padLeft(totalWidth, paddingChar);
        },
        padRight: function(totalWidth, paddingChar) {
            return this.toString().padRight(totalWidth, paddingChar);
        },
        isDecimal: function() {
            //return /^[-+]?(\d+)(.[\d]{0,})$/.test(this);
            return $.isDecimal(this);
        },
        isInteger: function() {
            //return /^[-+]?(\d+)$/.test(this); 
            return $.isInteger(this);
        },
        isFloat: function() {
            return $.isDecimal(this);
        },
        isInt: function() {
            return $.isInteger(this);
        },
        toThousand: function(delimiter) {
            return this.toString().toThousand(delimiter);
        },
        toDate: function(format) {
            return this.toString().toDate(format);
        }
    }, 'Number.prototype');

    //Date.prototype extend
    extend(Date.prototype, {
        format: function(formatString, len) {
            var t = this, year = t.getFullYear();
            if (isNaN(year)) {
                return '';
            } else if (typeof formatString !== 'string') {
                formatString = 'yyyy-MM-dd HH:mm:ss';
            }
            if (['timestamp', 'time', 'tick', 'ts'].indexOf(formatString) >= 0) {
                return $.isNumber(len) ? t.getTime().toString().substr(0, len) : t.getTime().toString();
            }
            var p = /([y]+|[M]+|[d]+|[H]+|[s]+|[f]+)/gi,
                y = year + (year < 1900 ? 1900 : 0), M = t.getMonth() + 1, d = t.getDate(),
                H = t.getHours(), h = H > 12 ? H - 12 : H === 0 ? 12 : H,
                m = t.getMinutes(), s = t.getSeconds(), f = t.getMilliseconds(),
                d = {
                    yyyy: y, M: M, d: d, H: H, h: h, m: m, s: s, MM: M.padLeft(2), dd: d.padLeft(2),
                    HH: H.padLeft(2), mm: m.padLeft(2), ss: s.padLeft(2), hh: h.padLeft(2), fff: f.padLeft(3),
                };
            return (formatString || 'yyyy-MM-dd HH:mm:ss').replace(p, '{$1}').format(d);
        },
        compareTo: function(dt) {
            var t1 = this.getTime(), t2 = dt.getTime();
            return t1 > t2 ? 1 : t1 < t2 ? -1 : 0;
        },
        timeSpan: function(dt2) {
            //获取两个Date的毫秒数和差值
            //var dt1 = this, t1 = dt1.getTime(), t2 = dt2.getTime(), tick = isNaN(t1) || isNaN(t2) ? 0 : t1 - t2;
            var dt1 = this, t1 = dt1.getTime(), t2 = dt2.getTime(), tick = Number(t1 - t2) || 0;
            return Date.timeTick(tick);
        },
        add: function(v, type) {
            return this.setTime(Date.addTick(this, v, type)), this;
        },
        addYears: function(v) {
            return this.setYear(this.getFullYear() + (parseInt(v, 10) || 0)), this;
        },
        addMonths: function(v) {
            return this.setMonth(this.getMonth() + (parseInt(v, 10) || 0)), this;
        },
        addDays: function(v) {
            return this.add(v, 'days');
        },
        addHours: function(v) {
            return this.add(v, 'hours');
        },
        addMinutes: function(v) {
            return this.add(v, 'minutes');
        },
        addSeconds: function(v) {
            return this.add(v, 'seconds');
        },
        addMilliseconds: function(v) {
            return this.add(v, 'milliseconds');
        },
        getDateList: function(days) {
            var list = [];
            for (var i = 0; i < days; i++) {
                list.push(this.addDays(i).format('yyyy-MM-dd'));
            }
            return list;
        }
    }, 'Date.prototype');

    extend(Date, {
        compare: function(dt1, dt2) {
            return dt1.compareTo(dt2);
        },
        addTick: function(tick, v, type) {
            if (typeof tick !== 'number') {
                tick = Number(tick);
            }
            v = parseInt(v, 10), type = type || 'milliseconds';
            if (!isNaN(tick) && !isNaN(v)) {
                switch (type) {
                    case 'days': tick += v * 24 * 60 * 60 * 1000; break;
                    case 'hours': tick += v * 60 * 60 * 1000; break;
                    case 'minutes': tick += v * 60 * 1000; break;
                    case 'seconds': tick += v * 1000; break;
                    case 'milliseconds': case 'time': tick += v; break;
                }
            }
            return tick;
        },
        timeTick: function(tick) {
            if (tick === 0) {
                return {
                    totalDays: 0, totalHours: 0, totalMinutes: 0, totalSeconds: 0, totalMilliseconds: 0,
                    ticks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0
                };
            }
            var ms = tick / 1000, ds = {
                d: 60 * 60 * 24, h: 60 * 60, m: 60, s: 1000
            }, ts = {
                totalDays: ms.div(ds.d).round(15),
                totalHours: (ms / ds.h).round(15),
                totalMinutes: (ms / ds.m).round(15),
                totalSeconds: ms.round(15),
                totalMilliseconds: tick,
                ticks: tick * 10000     //时间最小刻度单位为秒的一千万分之一(即毫秒的万分之一)
            };
            ts.days = parseInt(ts.totalDays, 10);
            ts.hours = parseInt((ms -= ts.days * ds.d) / ds.h, 10);
            ts.minutes = parseInt((ms -= ts.hours * ds.h) / ds.m, 10);
            ts.seconds = parseInt((ms -= ts.minutes * ds.m), 10);
            ts.milliseconds = ((ms -= ts.seconds) * ds.s).round();

            ts.add = function(v, type) {
                //先除以10000，将ticks换算回毫秒
                return Date.timeTick(Date.addTick(this.ticks / 10000, v, type));
            },
                ts.show = function(formatString, hideMilliseconds) {
                    var s = this, fs = formatString, hide = hideMilliseconds;
                    if (typeof hide === 'undefined' && typeof fs === 'boolean') {
                        hide = fs, fs = '';
                    }
                    if (typeof fs !== 'string' || ['en', 'cn', 'time'].indexOf(fs) >= 0) {
                        var a = ['{days}天', '{hours}小时', '{minutes}分钟', '{seconds}秒', '{milliseconds}毫秒'],
                            p = s.days ? 0 : (s.hours ? 1 : (s.minutes ? 2 : s.seconds ? 3 : 4)), len = a.length - (hide ? 1 : 0);
                        if (fs === 'en') {
                            a = ['{days}days ', '{hours}h ', '{minutes}m ', '{seconds}s ', '{milliseconds}ms'];
                        } else if (fs === 'time') {
                            a = ['{days}days ', '{hours}:', '{minutes}:', '{seconds}.', '{milliseconds}'];
                        }
                        fs = '';
                        for (var i = p; i < len; i++) {
                            fs += a[i];
                        }
                        return fs.format(s);
                    }
                    var p = /[{]?(days|hours|minutes|seconds|milliseconds)[}]?/gi;
                    return fs.replace(p, '{$1}').format(s);
                };
            return ts;
        },
        timeSpan: function(dt1, dt2) {
            return dt1.timeSpan(dt2);
        }
    }, 'Date');
}($);

// String.prototype.format
!function() {
    var throwFormatError = function(msg, str, args) {
        try {
            if (typeof str !== 'undefined') {
                console.log('str:\r\n\t', str, '\r\nargs:\r\n\t', args);
            }
            console.trace();
        } catch (e) { }
        throw new Error(msg);
    },
        formatNumberZero = function(arv, arn) {
            var arr = [], idx = arn.length - 1;
            for (var i = arv.length - 1; i >= 0; i--) {
                arr.push(arv[i] === '0' ? (idx >= 0 ? arn[idx] : arv[i]) : (function() { ++idx; return arv[i]; })());
                idx--;
            }
            for (var i = idx; i >= 0; i--) {
                arr.push(arn[i]);
            }
            arr = arr.reverse();
            return arr.join('');
        },
        scientificNotation = function(v, f, n, dn, numLen) {
            var num = parseInt('0' + dn[0], 10), fn = num < 1 ? 1 : dn[0].substr(0, 1), e = Math.pow(10, n),
                en = v.toString().substr(1).replace('.', ''), el = en.length,
                postfix = '001', postfixLen = (f === 'g' || f === 'G') ? 2 : 3, prefix = '', symbol = num >= 1 ? '+' : '-';
            if (el > n) {
                if (en.indexOf('0') === 0) {
                    prefix = '0';
                }
                en = prefix + (Number(en.substr(0, n + 1)) / 10).round();
            } else {
                for (var i = el; i < n; i++) { en += '0'; }
            }
            if (num >= 1) {
                postfix = numLen - 1;
                for (var i = postfix.toString().length; i < postfixLen; i++) { postfix = '0' + postfix; }
            }
            var so = { g: 'e', 'G': 'E' };
            return fn + '.' + en + (so[f] || f) + symbol + postfix;
        },
        regPattern = {
            numberSymbol: /([CDEFGNRX])/gi, number: /^(0x)?[\dA-Fa-f]+$/
        },
        formatNumberSwitch = function(v, f, n, dn, err, str, args) {
            //console.log('v: ', v, ', f: ', f, ',is: ', (isHexNumber(v) && fu !== 'X'));
            var fu = f.toUpperCase(), pos = 0, numLen = dn[0].length, decimalLen = (dn[1] || '').length;
            //if(isHexNumber(v) && ['C', 'F', 'N'].indexOf(fu) >= 0){
            if (isHexNumber(v) && regPattern.numberSymbol.test(fu)) {
                v = parseInt(v, 10), dn = v.toString().split('.'), numLen = dn[0].length;
            }
            if (['C', 'F', 'N'].indexOf(fu) >= 0) {
                v = decimalLen > n && decimalLen > 0 ? v.round(n) : decimalLen === 0 && n > 0 ? v + '.' : v;
            }
            var vc = v.toString(), len = vc.length;
            switch (fu) {
                case 'C':   //货币
                case 'N':   //千位分隔
                    v = (fu === 'C' ? '¥' : '') + vc.toThousand().append('0', n - decimalLen);
                    break;
                case 'D':   //整数
                    if (/([.])/g.test(v)) {
                        throwFormatError(err[3], str, args);
                    }
                    v = v.padLeft(n, '0');
                    break;
                case 'E':   //科学计数法
                    v = scientificNotation(v, f, n, dn, numLen);
                    break;
                case 'F':   //小数
                    v = vc.append('0', n - decimalLen);
                    break;
                case 'G':   //标准数字
                    v = numLen === n ? v.round() : numLen < n ? v.round(n - numLen) : scientificNotation(v, f, n - 1, dn, numLen);
                    break;
                case 'P':
                case '%':   //百分比
                    v = v.mul(100).round(n) + '%';
                    break;
                case 'R':
                    break;
                case 'X':   //十六进制显示
                    //无符号右移运算，移动位数为0，可以将32位有符号整数转换为32位无符号整数。
                    v = (parseInt(v, 10) >>> 0).toString(16).toUpperCase().padLeft(n);
                    break;
                case 'S': //空格分隔符
                case '-':
                case ':':
                case '.':
                    var arr = n.toString().split(''), isSingle = arr.length === 1, symbol = fu === 'S' ? ' ' : fu;
                    if (isSingle) {
                        v = vc.separate(symbol, n);
                    } else {
                        var nv = '', i = 0, pn = parseInt(arr[0], 10);
                        while (pos < len) {
                            if (i >= arr.length) { break; }
                            pn = parseInt(arr[i], 10);
                            nv += (pos > 0 ? symbol : '') + vc.substr(pos, pn), pos += pn, i += 1;
                        }
                        v = nv + (pos < len ? symbol + vc.substr(pos) : '');
                    }
                    break;
            }
            return v;
        },
        isNumberString = function(obj, f) {
            return typeof obj === 'number' || (!regPattern.numberSymbol.test(f) && regPattern.number.test(obj));
        },
        isHexNumber = function(obj, f) {
            return !regPattern.numberSymbol.test(f) && regPattern.number.test(obj);
        },
        formatNumber = function(mv, v, err, str, args) {
            if (!/[:]/g.test(mv)) {
                return v;
            }
            var p = mv.indexOf(':'), ss = mv.substr(p + 1), f = ss.substr(0, 1);
            //var isNum = typeof v === 'number', sc = mv.match(/(:)/g).length, isColon = mv.toString().indexOf('::') > 0;
            var isNum = isNumberString(v, f), sc = mv.match(/(:)/g).length, isColon = mv.toString().indexOf('::') > 0;
            if (sc > 1 && !isColon) {
                if (isNum) {
                    var nv = Math.round(v, 10), pos = mv.indexOf(':'), arv = mv.substr(pos + 1).split(''), arn = nv.toString().split('');
                    v = formatNumberZero(arv, arn);
                } else {
                    v = mv.substr(mv.indexOf(':') + 1);
                }
            } else if (isNum) {
                //C-货币，D-数字，E-科学计数，F-小数，G-标准数字，N-千位分隔，-十六进制
                var p1 = /([CDEFGNRXSP%\-\.\:])/gi, p2 = /([A-Z])/gi, p3 = /^([CDEFGNRXSP%\-\.\:][\d]+)$/gi, p4 = /^([A-Z]{1}[\d]+)$/gi;
                if ((ss.length === 1 && p1.test(ss)) || (ss.length >= 2 && p3.test(ss))) {
                    var nv = parseInt(ss.substr(1), 10), dn = v.toString().split('.'), n = isNaN(nv) ? (f.toUpperCase() === 'D' ? 0 : 2) : nv;
                    v = formatNumberSwitch(v, f, n, dn, err, str, args);
                } else if ((ss.length === 1 && p2.test(ss)) || (ss.length >= 2 && p4.test(ss))) {
                    throwFormatError(err[3], str, args);
                } else if (/([0]+)/g.test(ss)) {
                    var nv = Math.round(v, 10), arv = ss.split(''), arn = nv.toString().split('');
                    v = formatNumberZero(arv, arn);
                } else {
                    v = ss;
                }
            }
            return v;
        },
        distillObjVal = function(key, obj, err, str, vals) {
            var v;
            if (typeof obj[key] !== 'undefined') {
                v = obj[key];
            } else if (key.indexOf('.') > 0 || key.indexOf('|') > 0) {
                //嵌套对象，格式: obj.key.key|dv(默认值，因某些key可能不存在或允许为空)
                var arr = key.split('|'), dv = arr[1], ks = arr[0].split('.'), o = obj;
                //console.log('o: ', o, ', ks: ', ks, ', dv: ', dv);
                for (var i in ks) {
                    if (typeof o === 'object') {
                        o = o[ks[i]], v = o;
                    }
                    if (typeof o === 'undefined') {
                        v = typeof dv != 'undefined' ? dv : throwFormatError(err, s, vals);
                    }
                }
            } else {
                throwFormatError(err, str, vals);
            }
            return v;
        };

    if (typeof String.prototype.format === 'undefined') {
        String.prototype.format = function(args) {
            var s = this, vals = [], rst = [], pattern = /({|})/g, ms = s.match(pattern);
            if (null === ms) {
                return s.toString() || s;
            }
            var err = ['输入字符串的格式不正确。', '索引(从零开始)必须大于或等于零，且小于参数列表的大小。',
                '值不能为null（或undefined）。', '格式说明符无效。'];

            if (arguments.length > 1) {
                for (var i = 0, c = arguments.length; i < c; i++) {
                    if (arguments[i] !== undefined && arguments[i] !== null) {
                        vals.push(arguments[i]);
                    } else {
                        var er = err[2] + '第' + (i + 1) + '个参数值为：' + arguments[i];
                        throwFormatError(err, s, args);
                    }
                }
            } else if (Object.prototype.toString.call(args) === '[object Array]') {
                vals = args;
            } else if (args != undefined && args != null) {
                vals.push(args);
            }
            if (ms.length % 2 !== 0) {
                throwFormatError(err[0], s, vals);
            }
            //var matchs = s.match(/({+[-\d]+(:[\D\d]*?)*?}+)|({+([\D]*?|[:\d]*?)}+)|([{]{1,2}[\w]*?)|([\w]*?[}]{1,2})/g);
            var matchs = s.match(/({+[-\d]+(:[\D\d]*?)*?}+)|({+([\D]*?|[:\d]*?)}+)|({+([\w\.\|]*?)}+)|([{]{1,2}[\w]*?)|([\w]*?[}]{1,2})/g);
            if (null === matchs) {
                return s.toString() || s;
            }
            var len = vals.length, mc = matchs.length, isObject = typeof vals[0] === 'object', obj = isObject ? vals[0] : {};

            for (var i = 0; i < mc; i++) {
                var m = matchs[i], mv = m.replace(pattern, ''), p = s.indexOf(m), idx = parseInt(mv, 10);
                var c = /{/g.test(m) ? m.match(/{/g).length : 0, d = /}/g.test(m) ? m.match(/}/g).length : 0;
                if ((c + d) % 2 != 0) {
                    throwFormatError(err[0], s, vals);
                }
                var m2 = m.replace(/{{/g, '{').replace(/}}/g, '}');
                var odd = c % 2 != 0 || d % 2 != 0, single = c <= 2 && d <= 2;

                if (!isNaN(idx)) {
                    var v = formatNumber(mv, vals[idx], err, s, vals);
                    if (typeof v === 'boolean' && !v) {
                        return false;
                    }
                    if (/^-\d$/g.test(mv) && odd) {
                        throwFormatError(err[0], s, vals);
                    } else if (idx >= len) {
                        throwFormatError(err[1], s, vals);
                    } else if (typeof v === 'undefined' || v === null) {
                        throwFormatError(err[2], s, vals);
                    }
                    rst.push(s.substr(0, p) + (c > 1 || d > 1 ? (c % 2 != 0 || d % 2 != 0 ? m2.replace('{' + idx + '}', v) : m2) : v));
                } else if (odd) {
                    if (c === 1 && d === 1) {
                        if (!isObject || !single) {
                            throwFormatError(err[0], s, vals);
                        }
                        v = distillObjVal(mv, obj, err[0], s, vals);
                        rst.push(s.substr(0, p) + (c > 1 || d > 1 ? (c % 2 !== 0 || d % 2 !== 0 ? m2.replace('{' + idx + '}', v) : m2) : v));
                    } else {
                        var mcs = m2.match(/({[\w\.\|]+})/g);
                        if (mcs != null && mcs.length > 0) {
                            rst.push(s.substr(0, p) + m2.replace(mcs[0], distillObjVal(mcs[0].replace(/({|})/g, ''), obj, err[0], s)));
                        } else {
                            throwFormatError(err[0], s, vals);
                        }
                    }
                } else {
                    rst.push(s.substr(0, p) + m2);
                }
                s = s.substr(p + m.length);
            }
            rst.push(s);

            return rst.join('');
        };
    }

    //String.format
    String.format = String.format || function(s) {
        if (typeof s === 'string') {
            var a = [], c = arguments.length;
            for (var i = 1; i < c; i++) {
                a.push(arguments[i]);
            }
            return s.format(a);
        }
        throwFormatError((typeof o) + '.format is not a function');
    };
}();


console.log(new Date().getTime());

//常规格式化
console.log('abc'.format(20));

var str = '你好:{0}，这是用{0}写的一个仿C#的{1}函数';

console.log(str.format(['JS', 'format']));
console.log(str.format('JS', 'format'));

console.log("{0}{{正则{0:F5}{{表达式}}{1:F4}".format(123.5, 12.5))

console.log("{0}{{正则{0:F5}{{表达式}}{1:0D12}".format(123.5, 2))

console.log("{0:00:00:00}".format(1234567));

console.log("{0:0000年00月00日 00:00:00}".format(20160824172215));

console.log("{0:0000年00月00日}".format(20160824));

console.log("0DF5: {0:0DF5}".format(1234567));
console.log("0000: {0:0000}".format(2));

console.log('<tr lang="{{id:{0},pid:{1},level:{2}}}">'.format([1, 2, 0]));


console.log(new Date().getTime());

//增加了字面量对象参数，这个字面量对象参数必须放在参数的第1个位置，如果加了字面量对象参数，则数字参数索引必须从1开始

var data = { id: 123, name: '张三', obj: { num: 321, con: { val: 'acc' } } };
var s = 'Id:{id}, Val:{obj.con.val3|asd}, Code:{1}, Name:{name}'.format(data, 'Test');
console.log(s);
var s = 'Id:{id}, Val:{obj.con.val3|12}, Code:{1}, Name:{name}'.format(data, 'Test');
console.log(s);
var s = 'Id:{id}, Val:{obj.con.val|ABC}, Code:{1}, Num:{obj.num}, Name:{name}'.format(data, 'Test');
console.log(s);

var s = 'lang="{{id:{obj.id},pid:{obj.pid},level:{obj.level}}}"'.format({ obj: { id: 12, pid: 1, level: 1 } });
console.log(s);
var s = 'lang="{{id:{id},pid:{pid},level:{level}}}"'.format({ id: 12, pid: 1, level: 1 });
console.log(s);
var s = 'lang="{{id:{id},pid:{pid},level:{level|0}}}"'.format({ id: 12, pid: 0 });
console.log(s);


//增加 String.format 方法
var str = '{0:D4},{1}';
console.log(String.format(str, 20, 'abc'));
console.log(String.format(str, 20, 'abc'));

console.log(new Date().getTime());

console.log('D4: {0:D4}'.format(20));
console.log('D4: {0:D4}'.format('20'));
//连接符分隔数字
console.log('-344: {0:-344}'.format(13612345678));
//连接符分隔字符串
console.log('-349: {0:-349}'.format('13612345678'));
//连接符分隔字符串
console.log('-34: {0:-34}'.format('13612345678'));
console.log('-4: {0:-4}'.format('057412345678'));
console.log('S4: {0:S4}'.format('1234567890123456789'));

//冒号分隔十六进制数字字符串
console.log(':2: {0::2}'.format('A2D3F4B6C1D2'));

//空格分隔数字
var num = 330201198601011100;
console.log('S684: {0:S684}'.format(num));

//空格分隔数字字符串
console.log('S683: {0:S683}'.format('330201198601015261'));

console.log('D4: ', String.format('{0:D4}', 0x10));

console.log('G4: {0:G3}'.format(20234.512));
console.log(String.format('[20234.15] E8: {0:e8}', 20234.15));

console.log('F3：{0:F3}'.format(1.2345));
console.log('R3：{0:R3}'.format(1.2345));
console.log('C3：{0:C3}'.format(1234567.25));
console.log('C2：{0:C2}'.format(1234567));
console.log('C：{0:C}'.format(1234567));
console.log('N3：{0:N3}'.format(1234567.55555));
console.log('X：{0:X5}'.format(-250));

console.log('0xF3：{0:F3}'.format(0xFA));
console.log('0xF3：{0:R3}'.format(0xFA));
console.log('0xC3：{0:C3}'.format(0xFA));
console.log('0xC2：{0:C2}'.format(0xFA));
console.log('0xC：{0:C}'.format(0xFA));
console.log('0xN3：{0:N3}'.format(0xFA));
console.log('0xX：{0:X5}'.format(0xFA));
console.log('0xD：{0:D4}'.format(0xFA));

console.log('{{0}}：{0}%'.format(0.2512345.mul(100).round(3)));
console.log('P：{0:P}'.format(0.2512345));
console.log('%3：{0:%3}'.format(0.25123456));

console.log(new Date().getTime());

console.log('Start: ', new Date().getTime());
var d = new Date();
console.log(d.format());
console.log(d.format(''));
console.log(d.format('yyyy-MM-dd HH:mm:ss'));
console.log(d.format('yyyy-MM-dd HH:mm:ss.fff'));
console.log(d.format('yyyy-M-d H:m:s'));
console.log(d.format('yyyy/M/d h:m:s'));
console.log(d.format('yyyy/MM/dd HH:mm:ss'));
console.log(d.format('yyyy/MM/dd HH:mm:ss.fff'));
console.log(d.format('yyyyMMddHHmmssfff'));
console.log(d.format('yyyyMMddHHmmss'));
console.log(d.format('yyyy-MM-dd'));
console.log(d.format('yyyyMMdd'));
console.log(d.format('HH:mm:ss'));
console.log(d.format('MM/dd/yyyy HH:mm:ss'));
console.log(d.format('yyyy年MM月dd日 HH:mm:ss'));
console.log(d.format('yyyy年MM月dd日 HH时mm分ss秒'));
console.log(d.format('timestamp'));

console.log('2018-06-23 22:12:15'.toDate().format('yyyy年MM月dd日 hh:mm:ss'));
console.log('2018-6-23 22:12:15'.toDate().format('yyyy年MM月dd日 HH:mm:ss'));
console.log('2018-6-13 0:12:15'.toDate().format('yyyy年MM月dd日 hh:mm:ss'));
console.log('End: ', new Date().getTime());


var d1 = '2018-06-23 22:12:15.123'.toDate();
var ts = d1.format('timestamp', 10);
console.log('时间戳：', ts);

console.log('toDate: ', ts.toDate());

console.log(new Date().getTime().toString().substr(0, 10));

console.log(ts.toDate().format('yyyy/MM/dd HH:mm:ss.fff'));

console.log('2018-06-23 22:12:15'.toDate() - '2018-06-21 22:12:15'.toDate());

console.log('2018-06-23 22:12:15', 'compareTo', '2018-06-22 22:12:15', ':', '2018-06-23 22:12:15'.toDate().compareTo('2018-06-22 22:12:15'.toDate()));

console.log(Date.compare);

console.log('2018-06-23 22:12:15', 'compare', '2018-06-24 22:12:15', ':', Date.compare('2018-06-23 22:12:15'.toDate(), '2018-06-24 22:12:15'.toDate()));

console.log(Date);

console.log('2018-06-23 22:12:15'.toDate('yyyy年MM月dd日 HH:mm:ss'));
console.log('1529763135'.toDate('yyyy年MM月dd日 HH:mm:ss'));
var ts = 1529763135;
console.log(ts.toDate('yyyy年MM月dd日 HH:mm:ss'));

var num = '123.5'.toNumber();
console.log(typeof num);

console.log('true.toNumber(): ', true.toNumber());

console.log('(2 > 1).toNumber(): ', (2 > 1).toNumber());

console.log(typeof 'true'.toNumber());

console.log('hello'.startWith('h'));
console.log('hello'.endWith('o'));

console.log('HTMLJAVACSS'.separate('\r\n', 4));

console.log('123-456--789--1234'.clean('--'));
console.log('123-456-789-12 34'.clean());
console.log('123- 456--789--12 34'.clear());

console.log('ABC123ACC'.replaceAll(123, 'BBB'));
console.log(' ABC123ACC '.trimEnd());
console.log(' ABC123ACC '.trim());
console.log('-11'.compareTo('-12'));

//console.log('AA'.equals('AA'));

var dt1 = '2018-06-25 8:22:40.523'.toDate(), dt2 = '2018-06-23 8:22:35.400'.toDate();
var ts = dt1.timeSpan(dt2);

console.log('timeSpan: ', ts);
console.log('timeSpan typeof: ', typeof ts);

ts = ts.add(5, 'seconds').add(2, 'hours');
console.log(ts);
console.log(ts.show());
console.log(ts.show('en'));
console.log(ts.show('time'));
console.log(ts.show('{days}天{hours}小时{minutes}分钟'));
console.log(ts.show('days天hours小时minutes分钟'));
console.log(ts.show('days天 hours:minutes:seconds'));
console.log('{0:N0} '.format(ts.ticks))

var d = '2018-06-25 8:22:40.523'.toDate().add(1, 'days').addDays(2).addMonths(1).format();
console.log(d);

var num = '123.12345ab'.toNumber('abc', true, 3);
console.log('1: ', num, typeof num);
var num = '123.12345ab'.toNumber(0, 3);
console.log('11: ', num, typeof num);
var num = '123.12345ab'.toNumber(0, 0);
console.log('12: ', num, typeof num);
var num = '123.12345ab'.toNumber('0.0');
console.log('13: ', num, typeof num);
var num = '123.12345ab'.toNumber('0.00');
console.log('14: ', num, typeof num);
var num = '123.12345ab'.toNumber('0');
console.log('15: ', num, typeof num);
var num = '123.12345ab'.toNumber(0.0001);
console.log('16: ', num, typeof num);
var num = '123.12345ab'.toNumber(0, true);
console.log('2: ', num, typeof num);
var num = '123.12345ab'.toNumber(0, false);
console.log('3: ', num, typeof num);
var num = '123.12345ab'.toNumber(0);
console.log('4: ', num, typeof num);
var num = '123.12345ab'.toNumber(0, true, -3);
console.log('5: ', num, typeof num);
var num = '123.12345ab'.toNumber(true, 3);
console.log('6: ', num, typeof num);
var num = '123.12345ab'.toNumber(true, 0);
console.log('7: ', num, typeof num);
var num = '123.12345ab'.toNumber(true);
console.log('8: ', num, typeof num);

console.log('1234 isDecimal: ', '1234'.isDecimal());
console.log('1234 isInt: ', '1234'.isInt());
console.log('1234. isDecimal: ', $.isDecimal('1234.'));
console.log('1234.25 isFloat: ', '1234.25'.isFloat());
var num = 1234.25;
console.log(num.isFloat());

var ids = '   ,,1,|||-2.35,,,4,3,3  ,0,5,';
console.log(ids.toArray(',|', 'int', false, true));

var ids = 'abc,acc,asd,';
console.log(ids.toArray(',|', false, true));


var dt = new Date();
console.log('getDateList: ', dt.getDateList(7));

console.log(['timestamp', 'time', 'tick', 'ts'].indexOf('time') >= 0);

var arrKey = [];
console.log('arrKey: ', arrKey);
for (var k in arrKey) {
    console.log('kk: ', k);
}

