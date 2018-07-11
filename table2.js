"use strict";

var $ = $ || {};

!function ($) {
    var doc = document,
        createElement = function (nodeName, parent, fn) {
            var element = doc.createElement(nodeName); fn && fn(element); parent && parent.appendChild(element);
            return element;
        },
        addListener = function (element, e, fn) {
            element.addEventListener ? element.addEventListener(e, fn, false) : element.attachEvent("on" + e, fn);
        },
        removeListener = function (element, e, fn) {
            element.removeEventListener ? element.removeEventListener(e, fn, false) : element.detachEvent("on" + e, fn);
        },
        stopBubble = function (ev) {
            ev = ev || window.event || arguments.callee.caller.arguments[0];
            if (ev.stopPropagation) { ev.stopPropagation(); } else { ev.cancelBubble = true; }
            if (ev.preventDefault) { ev.preventDefault(); } else { ev.returnValue = false; }
        },
        isCellSpan = function (span) {
            return typeof span === 'number' && span > 0;
        },
        isTable = function (tb) {
            return typeof tb === 'object' && tb.tagName === 'TABLE' && typeof tb.nodeType === 'number';
        },
        isString = function () {
            for (var i = 0; i < arguments.length; i++) {
                if (typeof arguments[i] === 'string' && arguments[i].length > 0) {
                    return true;
                }
            }
            return false;
        },
        isDyadicArray = function (data) {
            if ($.isArray(data) && data.length > 0) {
                return $.isArray(data[0]) || $.isObject(data[0]);
            }
            return false;
        },
        extendProperty = function (destination, source) {
            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        };


    function table(options) {
        this.op = extendProperty({
            table: null, parent: doc.body,
            showTree: false, treeCellIndex: 0,
            headData: [], bodyData: []
        }, options),
            this.tb = this.op.table,
            this.tt = new tableTree(this.op.showTree);

        if (!isTable(this.tb)) {
            if (isString(this.tb)) {
                this.tb = doc.getElementById(this.tb);
            } else {
                this.tb = doc.createElement('TABLE');
                this.op.parent.appendChild(this.tb);
            }
        }
        if (this.tb === null) {
            return false;
        }

        if (this.op.headData) {
            this.createHead(this.op.headData);
        }
        if (this.op.bodyData) {
            this.createBody(this.op.bodyData);
        }
    }

    table.prototype = {
        getContainer: function (isHead) {
            try{
                if (isHead) {
                    return this.tb.tHead || this.tb.createTHead();
                } else {
                    return this.tb.tBodies[0] || this.tb.createTBody();
                }
            }catch(e){
                return this.tb;
            }
        },
        createHead: function (headData) {
            this.createRow(this.getContainer(true), headData);
        },
        createBody: function (bodyData) {
            if (bodyData.length === 0) {
                return false;
            }
            var that = this, container = that.getContainer(false), isAppend = container.rows.length > 0;
            if (that.op.showTree) {
                var ds = this.tt.initial(bodyData);
                that.createRow(container, ds.data, ds.tree, ds.pid, isAppend);
            } else {
                that.createRow(container, bodyData);
            }
        },
        append: function (bodyData) {
            this.createBody(bodyData);
        },
        createRow: function (container, data, tree, pid, isAppend) {
            var rowIndex = container.rows.length;
            if (!isDyadicArray(data)) {
                data = [data];
            }
            if (!this.op.showTree || $.isUndefined(tree)) {
                for (var i in data) {
                    var row = container.insertRow(rowIndex + Number(i));
                    this.insertCell(row, data[i]);
                }
            } else {
                this.createTreeRow(container, data, tree, pid, isAppend);
            }
        },
        createTreeRow: function (container, data, tree, pids, isAppend) {
            isAppend = $.isBoolean(isAppend, false);
            for (var i in data) {
                var d = data[i], isArray = $.isArray(d), treeData = d.treeData || {};
                if (isArray || pids.indexOf(treeData.pid) >= 0) {
                    var rowIndex = container.rows.length;
                    if (isAppend) {
                        rowIndex = this.findRowIndex(container, treeData.pid);
                    }
                    this.insertCell(container.insertRow(rowIndex), data[i]);

                    var key = this.tt.buildKey(treeData.id), hasChild = this.checkChild(key, tree);
                    if (hasChild) {
                        //递归创建树表格行
                        this.createTreeRow(container, data, tree, [treeData.id], isAppend);
                    }
                }
            }
            return 0;
        },
        insertCell: function (row, data) {
            var that = this,
                isArray = $.isArray(data),
                showTree = that.op.showTree,
                treeCellIndex = that.op.treeCellIndex || 0,
                cellData = isArray ? data : data.cellData,
                rowData = data.rowData,
                treeData = data.treeData,
                cellIndex = 0,
                cols = !$.isUndefined(cellData) ? cellData.length : 0,
                isRow = $.isObject(rowData) && !$.isEmpty(rowData),
                isTree = showTree && $.isObject(treeData) && !$.isEmpty(treeData),
                id = isTree ? treeData.id : '';

            for (var i = 0; i < cols; i++) {
                var dr = cellData[i], cell = row.insertCell(cellIndex);
                if (isRow && i === 0) {
                    that.insertCellProperty(row, rowData);
                }
                if ($.isObject(dr)) {
                    var content = dr.content || dr.html || dr.text;
                    if (isTree && cellIndex === treeCellIndex) {
                        row.setAttribute('id', that.tt.buildId(id));
                        //row.setAttribute('tree', '{{id:{id},pid:{pid},level:{level}}}'.format(treeData));
                        row.setAttribute('tree', '{id:' + treeData.id + ',pid:' + treeData.pid + ',level:' + treeData.level + '}');
                        that.tt.setMap(id, false);
                        content = that.tt.buildSpace(treeData.level) + this.tt.buildSwitch(id, treeData.level) + content;
                        //临时测试用
                        content += ' [ pid: ' + treeData.pid + ', level: ' + treeData.level + ' ]';
                        cell.innerHTML = content;

                        var btnSwitch = doc.getElementById(that.tt.buildSwitchId(id));
                        addListener(btnSwitch, 'click', function () {
                            that.tt.toggle(this.getAttribute('tid'));
                            stopBubble();
                        });
                    } else {
                        cell.innerHTML = content;
                    }
                    if (isCellSpan(dr.rowSpan)) { cell.rowSpan = dr.rowSpan; }
                    if (isCellSpan(dr.colSpan)) { cell.colSpan = dr.colSpan; }
                    this.insertCellProperty(cell, dr);
                } else {
                    cell.innerHTML = dr;
                }

                cellIndex++;
            }
            return cell;
        },
        insertCellProperty: function (container, dr) {
            if ($.isObject(dr.style)) {
                for (var k in dr.style) {
                    container.style[k] = dr.style[k];
                }
            } else if ($.isString(dr.style)) {
                container.style.cssText = dr.style;
            }
            if ($.isObject(dr.event)) {
                for (var k in dr.event) {
                    addListener(container, k, dr.event[k]);
                }
            }
            if ($.isObject(dr.attribute)) {
                for (var k in dr.attribute) {
                    container.setAttribute(k, dr.attribute[k]);
                }
            }
        },
        checkChild: function (key, tree) {
            if (tree !== null) {
                var childs = tree[key];
                if (childs && childs.length > 0) {
                    return true;
                }
            }
            return false;
        },
        findRowIndex: function (container, pid) {
            var childs = this.tt.getChildIds(pid), len = childs.length;
            var obj = doc.getElementById(this.tt.buildId(pid)), rowIndex = 0, idx = container.rows.length;
            if (len > 0 && obj != null) {
                var rowId = '', idx = container.rows.length, realPid = 0;
                //找到父节点下的最后一个子节点（不递归）
                for (var i = len - 1; i >= 0; i--) {
                    obj = document.getElementById(this.tt.buildId(childs[i]));
                    if (obj != null) {
                        rowId = obj.getAttribute('id'), realPid = childs[i];
                        break;
                    }
                }
                //如果没找到，就把父节点当成最后一个子节点
                if (rowId === '') {
                    obj = doc.getElementById(this.tt.buildId(pid));
                    if (obj != null) {
                        rowId = obj.getAttribute('id'), realPid = pid;
                    }
                }
                //根据子节点找到所在行数
                for (var i = 0; i < container.rows.length; i++) {
                    var id = container.rows[i].getAttribute('id');
                    if (id !== null && id === rowId) {
                        idx = i + 1;
                        break;
                    }
                }
                //再递归查询子节点下的所有行数
                var trees = this.tt.getChildIds(realPid);
                rowIndex = this.findRealRowIndex(trees, realPid, 0);
            }
            return rowIndex + idx;
        },
        findRealRowIndex: function (tree, pid, rowIndex) {
            for (var i in tree) {
                if (!this.tt.hasMap(tree[i])) {
                    break;
                }
                rowIndex++;
                var childs = this.tt.tree[this.tt.buildKey(tree[i])];
                if ($.isArray(childs)) {
                    this.findRealRowIndex(childs, tree[i], rowIndex);
                }
            }
            return rowIndex;
        }
    };

    function tableTree(isTree) {
        this.isTree = typeof isTree === 'boolean' ? isTree : false;
        this.collapseCache = {};
        this.data = {};
        this.tree = {};
        this.map = {};
    }

    tableTree.prototype = {
        buildKey: function (id) {
            return 'k_' + id;
        },
        buildId: function (id) {
            return 'tr_' + id;
        },
        setKeyValue: function (data, key, value) {
            if ($.isUndefined(data[key])) {
                data[key] = [];
            }
            if (!$.isUndefined(value)) {
                data[key].push(value);
            }
            return data;
        },
        hasParent: function (key) {
            return !$.isUndefined(this.data[key]);
        },
        getChildIds: function (pid) {
            var pkey = this.buildKey(pid);
            return this.tree[pkey] || [];
        },
        setLevel: function (data, pkey, hasParent) {
            if (!hasParent) {
                data.level = 0, data.pid = 0;
            } else {
                var pdata = this.data[pkey];
                if (pdata && pdata.treeData && $.isInteger(pdata.treeData.level)) {
                    data.level = parseInt(1 + pdata.treeData.level, 10);
                }
            }
        },
        setMap: function (id, isDel) {
            var key = 'm_' + id;
            if (isDel) {
                if (!$.isUndefined(this.map[key])) {
                    delete this.map[key];
                }
            } else {
                this.map[key] = 1;
            }
        },
        hasMap: function (id) {
            var key = 'm_' + id;
            return !$.isUndefined(this.map[key]);
        },
        isExist: function (key) {
            return !$.isUndefined(this.data[key]);
        },
        initial: function (bodyData) {
            if (!this.isTree) {
                return { data: bodyData, tree: null };
            }
            if (!isDyadicArray(bodyData)) {
                bodyData = [bodyData];
            }
            var len = bodyData.length, keys = {}, tree = {}, arr = [], data = [], pids = [];
            for (var i = 0; i < len; i++) {
                var dr = bodyData[i], isArray = $.isArray(dr), treeData = isArray ? null : dr.treeData;
                if (isArray || !$.isObject(treeData) || $.isEmpty(treeData)) {
                    arr.push({ level: 0, data: dr });
                } else {
                    var key = this.buildKey(treeData.id);
                    //检测是否已存在相同的ID，防止重复创建
                    if (!this.isExist(key)) {
                        this.data[key] = dr;
                        this.setKeyValue(keys, key, treeData.id);
                        arr.push({ level: treeData.level || i, data: dr });
                    }
                }
            }
            //arr = this.quickSort2(arr, 'level');
            
            for (var i = 0, c = arr.length; i < c; i++) {

                var dr = arr[i].data, isArray = $.isArray(dr), treeData = dr.treeData;
                var isTree = $.isObject(treeData) && !$.isEmpty(treeData);
                if (isTree) {
                    var key = this.buildKey(treeData.id), pkey = this.buildKey(treeData.pid);
                    //找不到上级节点，则将上级节点设置为-1，层级设置为0级
                    //上级节点为-1的行会追加到表格的最后
                    if (!this.hasParent(pkey)) {
                        this.setLevel(dr.treeData, pkey, false);
                    } else if (this.hasParent(pkey)) {
                        this.setLevel(dr.treeData, pkey, true);
                    }
                    if (i === 0 || $.isUndefined(keys[pkey])) {
                        pids.push(treeData.pid || 0);
                    }
                    this.setKeyValue(tree, pkey, treeData.id);
                    this.setKeyValue(this.tree, pkey, treeData.id);
                    tree[key] = [];
                }
                data.push(dr);
            }
            //按level层级排序(升序)
            data = this.quickSort(data, 'level');

            return { data: data, tree: tree, pid: pids };
        },
        getRowIds: function(tree, pid, expand, rows){
            for (var i in tree) {
                var id = tree[i];
                if (!this.hasMap(id)) {
                    break;
                }
                //rows.push(doc.getElementById(this.buildId(id)));
                rows.push(id);

                if(!this.isCollapse(id) || !expand){
                    var childs = this.tree[this.buildKey(id)];
                    if ($.isArray(childs)) {
                        this.getRowIds(childs, id, expand, rows);
                    }
                }
            }
            return rows;
        },
        buildSpace: function (len, char) {
            return '';
            var s = '', char = '&nbsp;&nbsp;&nbsp;&nbsp;';
            for (var i = 0; i < len; i++) {
                s += char;
            }
            return s;
        },
        buildSpace2: function (len, char) {
            var w = 0;
            for (var i = 0; i < len; i++) {
                w += 16;
            }
            return w;
        },
        buildSwitchId: function (id) {
            return 'switch_' + id;
        },
        buildSwitch: function (id, width) {
            var objId = this.buildSwitchId(id);
            return '<a id="' + objId + '" tid="' + id + '" expand="1" style="cursor:pointer;margin-left:' + this.buildSpace2(width) + 'px;"> -- </a>';
        },
        setCollapse: function(pid, ids, collapse){
            var key = this.buildKey(pid);
            if(collapse){
                this.collapseCache[key] = [];
                for(var i in ids){
                    this.collapseCache[key].push(ids[i]);
                }
            } else {
                if(!$.isUndefined(this.collapseCache[key])){
                    delete this.collapseCache[key];
                }
            }
        },
        isCollapse: function(id){
            var key = this.buildKey(id);
            return !$.isUndefined(this.collapseCache[key]);
        },
        toggle: function (id) {
            var btnSwitch = doc.getElementById(this.buildSwitchId(id)), collapse = true;
            if(btnSwitch !== null){
                collapse = btnSwitch.getAttribute('expand') === '1';
                btnSwitch.setAttribute('expand', collapse ? 0 : 1);
                btnSwitch.innerHTML = collapse ? ' ++ ' : ' -- ';
            }
            var childs = this.getChildIds(id), ids = this.getRowIds(childs, id, !collapse, []);
            this.setCollapse(id, ids, collapse);

            for(var i = ids.length -1; i>=0; i--){
                var obj = doc.getElementById(this.buildId(ids[i]));
                if(obj != null){
                    obj.style.display = collapse ? 'none' : '';
                }
            }
        },
        collapse: function (id) {

        },
        expand: function (id) {

        },
        expandLevel: function (level) {

        },
        quickSort2: function (arr, key) {
            if (0 === arr.length) {
                return [];
            }
            var left = [], right = [], pivot = arr[0], c = arr.length;
            for (var i = 1; i < c; i++) {
                arr[i][key] < pivot[key] ? left.push(arr[i]) : right.push(arr[i]);
            }
            return this.quickSort2(left, key).concat(pivot, this.quickSort2(right, key));
        },
        quickSort: function (arr, key) {
            if (0 === arr.length) {
                return [];
            }
            var left = [], right = [], pivot = arr[0], c = arr.length;
            for (var i = 1; i < c; i++) {
                arr[i].treeData[key] < pivot.treeData[key] ? left.push(arr[i]) : right.push(arr[i]);
            }
            return this.quickSort(left, key).concat(pivot, this.quickSort(right, key));
        }
    };




    $.table = table;
}($);