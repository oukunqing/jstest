"use strict";

var oui = function () {
    var extend = function (destination, source, forceExtend, constructor) {
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
    var func = function () {
        return [];
    },
        doc = typeof document !== 'undefined' ? document : {
            getElementsByName: func,
            getElementsByTagName: func
        },
        head = doc.getElementsByTagName('head')[0];

    return {
        doc: doc,
        head: head,
        extendProperty: function (destination, source) {
            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        },
        getLocationPath: function () {
            return location.href.substring(0, location.href.lastIndexOf('/') + 1);
        },
        getFileName: function (fileName) {
            if (fileName) {
                return fileName.substr(0, fileName.lastIndexOf('.'));
            } else {
                var el = doc.getElementsByTagName('script');
                var src = el[el.length - 1].src, arr = src.split('/'), len = arr.length;
                return arr[len - 1].split('?')[0];
            }
        },
        getFilePath: function (name, path) {
            var el = doc.getElementsByTagName('script');
            for (var i = 0, c = el.length; i < c; i++) {
                var si = el[i].src.lastIndexOf('/');
                if (el[i].src != '' && el[i].src.substr(si + 1).split('?')[0] == name) {
                    return el[i].src.substring(0, si + 1).replace(path, '');
                }
            }
        },
        getLinkStyle: function (path, name) {
            var link = doc.createElement('link');
            var id = link.id = 'table-tree-style';
            if (!doc.getElementById(id)) {
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', 'text/css');
                link.setAttribute('href', path + name + '?' + new Date().getMilliseconds());
                head.appendChild(link);
            }
        },
        createElement: function (nodeName, parent, fn) {
            var element = doc.createElement(nodeName); fn && fn(element); parent && parent.appendChild(element);
            return element;
        },
        addListener: function (element, e, fn) {
            element.addEventListener ? element.addEventListener(e, fn, false) : element.attachEvent("on" + e, fn);
        },
        removeListener: function (element, e, fn) {
            element.removeEventListener ? element.removeEventListener(e, fn, false) : element.detachEvent("on" + e, fn);
        },
        stopBubble: function (ev) {
            ev = ev || window.event || arguments.callee.caller.arguments[0];
            if (ev.stopPropagation) { ev.stopPropagation(); } else { ev.cancelBubble = true; }
            if (ev.preventDefault) { ev.preventDefault(); } else { ev.returnValue = false; }
        },
        deleteTableRow: function (tr) {
            if (tr !== null && tr.parentNode != null) {
                if (tr.parentNode.tagName === 'TBODY' || tr.parentNode.tagName === 'THEAD') {
                    tr.parentNode.parentNode.deleteRow(tr.rowIndex);
                } else if (tr.parentNode.tagName === 'TABLE') {
                    tr.parentNode.deleteRow(tr.rowIndex);
                }
            }
        },
        getRowIndex: function (tr) {
            return tr !== null ? tr.rowIndex : -1;
        },
        getTHeadRows: function (tb) {
            return $.isObject(tb) && tb.tagName === 'TABLE' && tb.tHead ? tb.tHead.rows.length : 0;
        }
    };
}();

!function () {
    console.log(oui);

}();