"use strict";

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
        getContainer: function(isHead){
            if(isHead){
                return this.tb.tHead || this.tb.createTHead();
            } else {
                return this.tb.tBodies[0] || this.tb.createTBody(); 
            }
        },
        createHead: function (headData) {
            //var that = this, container = that.tb.tHead || function () { return that.tb.createTHead(); }();
            this.createRow(this.getContainer(true), headData);
        },
        createBody: function (bodyData) {            
            if(bodyData.length === 0){
                return false;
            }
            //var that = this, container = that.tb.tBodies[0] || function () { return that.tb.createTBody(); }(), isAppend = container.rows.length > 0;
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
                this.createRowTree(container, data, tree, pid, isAppend);
            }
        },
        createRowTree: function (container, data, tree, pids, isAppend) {
            isAppend = $.isBoolean(isAppend, false);
            //console.log('container: ', container, ', isAppend: ', isAppend, ', pid: ', pid, ', data: ', data);
            for (var i in data) {
                var d = data[i], isArray = $.isArray(d), treeData = d.treeData || {};
                if (isArray || pids.indexOf(treeData.pid) >= 0) {
                    var rowIndex = container.rows.length;
                    if (isAppend) {
                        rowIndex = this.findRowIndex(container, treeData.pid);

                        console.log('createRowTree: ', 'rowIndex:', rowIndex, ', pid:', pids, ', id:', treeData.id)
                    }
                    this.insertCell(container.insertRow(rowIndex), data[i]);

                    var key = this.tt.buildKey(treeData.id), hasChild = this.checkChild(key, tree);
                    if (hasChild) {
                        //console.log('isAppend:', isAppend);
                        this.createRowTree(container, data, tree, [treeData.id], isAppend);
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
                cols = cellData.length,
                isRow = $.isObject(rowData) && !$.isEmpty(rowData),
                isTree = showTree && $.isObject(treeData) && !$.isEmpty(treeData), 
                id = isTree ? treeData.id : '';
                //console.log('treeData: ', treeData);
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
                        content = that.tt.buildSpace(treeData.level) + this.tt.buildSwitch(id) + content;
                        content += ' [ pid: ' + treeData.pid + ' ]';
                        cell.innerHTML = content;

                        var btnSwitch = doc.getElementById(that.tt.buildSwitchId(id));
                        addListener(btnSwitch, 'click', function () {
                            that.tt.toggle(this.id);
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
            var childs = this.tt.getChildIds(pid), len = childs.length, rowIndex = -1, realPid = 0;
            if (len > 0) {
                var obj = doc.getElementById(this.tt.buildId(pid)), rowId = '', idx = container.rows.length;
                
                for (var i = len - 1; i >= 0; i--) {
                    obj = document.getElementById(this.tt.buildId(childs[i]));
                    if (obj != null) {
                        rowId = obj.getAttribute('id'), realPid = childs[i];
                        break;
                    }
                }
                if(rowId === ''){
                    obj = doc.getElementById(this.tt.buildId(pid));
                    if(obj != null){
                        rowId = obj.getAttribute('id'), realPid = pid;
                    }
                }

                if(obj != null){
                    //rowId = obj.getAttribute('id'), realPid = pid;
                }

                for (var i = 0; i < container.rows.length; i++) {
                    var id = container.rows[i].getAttribute('id');
                    if (id !== null && id === rowId) {
                        idx = i + 1;
                        break;
                    }
                }


                var tree = this.tt.tree[this.tt.buildKey(realPid)];
                rowIndex = this.findRowIndex2(tree, realPid, 0);

                console.log('idx: ', pid, idx, tree);
                console.log('rowIndex: ', rowIndex + idx);


                return rowIndex + idx;

                for (var i = len - 1; i >= 0; i--) {
                    obj = document.getElementById(this.tt.buildId(childs[i]));
                    if (obj != null) {
                        rowId = obj.getAttribute('id'), realPid = childs[i];
                        break;
                    }
                }
                if(rowId === ''){
                    obj = doc.getElementById(this.tt.buildId(pid));
                    if(obj != null){
                        rowId = obj.getAttribute('id'), realPid = pid;
                    }
                }
            console.log('findRowIndex: ', 'pid:', pid, ', childs: ', childs, ', rowId: ', rowId, ', realPid: ', realPid);

                for (var i = 0; i < container.rows.length; i++) {
                    var id = container.rows[i].getAttribute('id');
                    if (id !== null && id === rowId) {
                    console.log('id: ', id);
                        return i + 1;
                    }
                }




            } else {
                return container.rows.length;
            }
        },
        findRowIndex2: function(tree, pid, rowIndex){
            for(var i in tree){
                //console.log('22i:', i, tree[i]);
                var id = tree[i], childs = this.tt.tree[this.tt.buildKey(id)];
                if(!this.tt.hasMap(id)){
                    return rowIndex;
                }
                rowIndex++;
                if($.isArray(childs)){
                    this.findRowIndex2(childs, tree[i], rowIndex);
                }
            }
            return rowIndex;
        }
    };

    function tableTree(isTree) {
        this.isTree = $.isBoolean(isTree, false);
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
        setLevel: function(data, pkey, hasParent){
            if(!hasParent){
                data.level = 0, data.pid = -1;
            } else {
                var pdata = this.data[pkey];
                if(pdata && pdata.treeData && $.isInteger(pdata.treeData.level)){
                    data.level = parseInt('0' + pdata.treeData.level, 10) + 1;
                }
            }
        },
        setMap: function(id, isDel){
            var key = 'm_' + id;
            if(isDel){
                if(!$.isUndefined(this.map[key])){
                    delete this.map[key];
                }
            } else {
                this.map[key] = 1;
            }
        },
        hasMap: function(id){
            var key = 'm_' + id;
            return !$.isUndefined(this.map[key]);
        },
        isExist: function(key){
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
                    if(!this.isExist(key)){
                        this.data[key] = dr;
                        this.setKeyValue(keys, key, treeData.id);
                        arr.push({ level: treeData.level || i, data: dr });
                    }
                }
            }
            arr = this.quickSort2(arr, 'level'), len = arr.length;
            //console.log('arr: ', arr);
            for (var i = 0; i < len; i++) {
                var dr = arr[i].data, isArray = $.isArray(dr), treeData = dr.treeData;
                var isTree = $.isObject(treeData) && !$.isEmpty(treeData);
                if (isTree) {
                    var key = this.buildKey(treeData.id), pkey = this.buildKey(treeData.pid);
                    //找不到上级节点，则将上级节点设置为-1，层级设置为0级
                    //上级节点为-1的行会追加到表格的最后
                    if (!this.hasParent(pkey) && (i === 0 || ($.isNumber(dr.treeData.level) && dr.treeData.level > 0))) {
                        this.setLevel(dr.treeData, pkey, false);
                    } else if(this.hasParent(pkey)) {
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

            console.log('data-data: ', data);

            return { data: data, tree: tree, pid: pids };
        },
        buildSpace: function (len, char) {
            var s = '', char = '&nbsp;&nbsp;&nbsp;&nbsp;';
            for (var i = 0; i < len; i++) {
                s += char;
            }
            return s;
        },
        buildSwitchId: function (id) {
            return 'switch_' + id;
        },
        buildSwitch: function (id) {
            var objId = this.buildSwitchId(id), html = '<a style="cursor:pointer;" id="' + objId + '">++</a>';
            return html;
        },
        toggle: function (id) {
            alert('toggle: '+ id);
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