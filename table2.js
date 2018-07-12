"use strict";

var $ = $ || {};

!function ($) {
    var doc = document,
        head = document.getElementsByTagName('head')[0],
        getLocationPath = function () {
            return location.href.substring(0, location.href.lastIndexOf('/') + 1);
        },
        getFileName = function () {
            var el = doc.getElementsByTagName('script');
            var src = el[el.length - 1].src, arr = src.split('/'), len = arr.length;
            return arr[len - 1].split('?')[0];
        },
        thisFileName = getFileName(),
        getFilePath = function (name, path) {
            var el = doc.getElementsByTagName('script');
            for (var i = 0, c = el.length; i < c; i++) {
                var si = el[i].src.lastIndexOf('/');
                if (el[i].src != '' && el[i].src.substr(si + 1).split('?')[0] == name) {
                    return el[i].src.substring(0, si + 1).replace(path, '');
                }
            }
        },
        getLinkStyle = function (path, name) {
            var link = document.createElement('link');
            var id = link.id = 'table-tree-style';
            if (!doc.getElementById(id)) {
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', 'text/css');
                link.setAttribute('href', path + name + '?' + new Date().getTime());
                head.appendChild(link);
            }
        },
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
        var that = this;
        that.options = extendProperty({
            table: null,
            parent: doc.body,
            showTree: false,
            treeCellIndex: 0,
            trigger: {
                cell: '',   //['click', 'toggle']
                row: ''     //['click', 'toggle']
            },
            headData: [],
            bodyData: [],
            treeOptions: {}
        }, options),
            that.table = that.options.table,
            that.tree = new tableTree(that.options.showTree, that.options.treeOptions || {});

        var trigger = that.options.trigger;
        if ($.isString(trigger.cell)) {
            that.options.trigger.cell = [trigger.cell, 'toggle'];
        }
        if ($.isString(trigger.row)) {
            that.options.trigger.row = [trigger.row, 'toggle'];
        }

        if (!isTable(that.table)) {
            if (isString(that.table)) {
                that.table = doc.getElementById(that.table);
            } else {
                that.table = doc.createElement('TABLE');
                that.options.parent.appendChild(that.table);
            }
        }
        if (that.table === null) {
            return false;
        }

        if (that.options.headData) {
            that.createHead(that.options.headData);
        }
        if (that.options.bodyData) {
            that.createBody(that.options.bodyData);
        }
    }

    table.prototype = {
        getContainer: function (isHead) {
            try {
                if (isHead) {
                    return this.table.tHead || this.table.createTHead();
                } else {
                    return this.table.tBodies[0] || this.table.createTBody();
                }
            } catch (e) {
                return this.table;
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
            if (that.options.showTree) {
                var ds = this.tree.initial(bodyData);
                that.createRow(container, ds.datas, ds.trees, ds.pids, isAppend);
            } else {
                that.createRow(container, bodyData);
            }
        },
        append: function (bodyData) {
            this.createBody(bodyData);
        },
        createRow: function (container, datas, trees, pids, isAppend) {
            var rowIndex = container.rows.length;
            if (!isDyadicArray(datas)) {
                datas = [datas];
            }
            if (!this.options.showTree || $.isUndefined(trees)) {
                for (var i in datas) {
                    var row = container.insertRow(rowIndex + Number(i));
                    this.insertCell(row, datas[i]);
                }
            } else {
                this.createTreeRow(container, datas, trees, pids, isAppend);
            }
        },
        createTreeRow: function (container, datas, trees, pids, isAppend) {
            isAppend = $.isBoolean(isAppend, false);
            for (var i in datas) {
                var d = datas[i], isArray = $.isArray(d), treeData = d.treeData || {};
                if (isArray || pids.indexOf(treeData.pid) >= 0) {
                    var rowIndex = container.rows.length;
                    if (isAppend) {
                        rowIndex = this.findRowIndex(container, treeData.pid);
                    }
                    this.insertCell(container.insertRow(rowIndex), datas[i]);

                    var key = this.tree.buildKey(treeData.id), hasChild = this.checkChild(key, trees);
                    if (hasChild) {
                        //递归创建树表格行
                        this.createTreeRow(container, datas, trees, [treeData.id], isAppend);
                    }
                }
            }
            return 0;
        },
        insertCell: function (row, data) {
            var that = this,
                isArray = $.isArray(data),
                showTree = that.options.showTree,
                treeCellIndex = that.options.treeCellIndex || 0,
                cellData = isArray ? data : data.cellData,
                rowData = data.rowData,
                treeData = data.treeData,
                cellIndex = 0,
                cols = !$.isUndefined(cellData) ? cellData.length : 0,
                isRow = $.isObject(rowData) && !$.isEmpty(rowData),
                isTree = showTree && $.isObject(treeData) && !$.isEmpty(treeData),
                id = isTree ? treeData.id : '',
                func = function (obj, action) {
                    //that.tree.toggle(this.getAttribute('tid'));
                    that.tree[action || 'toggle'](obj.getAttribute('tid'));
                    stopBubble();
                };

            for (var i = 0; i < cols; i++) {
                var dr = cellData[i], cell = row.insertCell(cellIndex);
                if (isRow && i === 0) {
                    that.insertCellProperty(row, rowData);
                }
                if ($.isObject(dr)) {
                    var content = dr.content || dr.html || dr.text;
                    if (isTree && cellIndex === treeCellIndex) {
                        row.setAttribute('id', that.tree.buildId(id));
                        //row.setAttribute('tree', '{{id:{id},pid:{pid},level:{level}}}'.format(treeData));
                        row.setAttribute('tree', '{id:' + treeData.id + ',pid:' + treeData.pid + ',level:' + treeData.level + '}');
                        that.tree.setMap(id, false);
                        content = that.tree.buildSwitch(id, treeData.level) + content;
                        //临时测试用
                        content += ' [ id: ' + treeData.id + ', pid: ' + treeData.pid + ', level: ' + treeData.level + ' ]';
                        cell.innerHTML = content;

                        var btnSwitch = doc.getElementById(that.tree.buildSwitchId(id));

                        addListener(btnSwitch, 'click', function () { func(this, 'toggle'); });

                        if (that.options.trigger.cell) {
                            cell.setAttribute('tid', id);
                            addListener(cell, that.options.trigger.cell[0], function () { console.log('cellclick'); func(this, that.options.trigger.cell[1] || 'toggle'); });
                        }
                        if (that.options.trigger.row) {
                            row.setAttribute('tid', id);
                            addListener(row, that.options.trigger.row[0], function () { console.log('rowclick'); func(this, that.options.trigger.row[1] || 'toggle'); });
                        }
                    } else {
                        cell.innerHTML = content;
                    }
                    if (isCellSpan(dr.rowSpan)) { cell.rowSpan = dr.rowSpan; }
                    if (isCellSpan(dr.colSpan)) { cell.colSpan = dr.colSpan; }
                    that.insertCellProperty(cell, dr);
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
        checkChild: function (key, trees) {
            if (trees !== null) {
                var childs = trees[key];
                if (childs && childs.length > 0) {
                    return true;
                }
            }
            return false;
        },
        findRowIndex: function (container, pid) {
            var childs = this.tree.getChildIds(pid), len = childs.length;
            var obj = doc.getElementById(this.tree.buildId(pid)), rowIndex = 0, idx = container.rows.length;
            if (len > 0 && obj != null) {
                var rowId = '', idx = container.rows.length, realPid = 0;
                //找到父节点下的最后一个子节点（不递归）
                for (var i = len - 1; i >= 0; i--) {
                    obj = document.getElementById(this.tree.buildId(childs[i]));
                    if (obj != null) {
                        rowId = obj.getAttribute('id'), realPid = childs[i];
                        break;
                    }
                }
                //如果没找到，就把父节点当成最后一个子节点
                if (rowId === '') {
                    obj = doc.getElementById(this.tree.buildId(pid));
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
                var trees = this.tree.getChildIds(realPid);
                rowIndex = this.findRealRowIndex(trees, realPid, 0);
            }
            return rowIndex + idx;
        },
        findRealRowIndex: function (trees, pid, rowIndex) {
            for (var i in trees) {
                if (!this.tree.hasMap(trees[i])) {
                    break;
                }
                rowIndex++;
                var childs = this.tree.getChildIds(trees[i]);
                if ($.isArray(childs)) {
                    this.findRealRowIndex(childs, trees[i], rowIndex);
                }
            }
            return rowIndex;
        }
    };

    function tableTree(isTree, options) {
        if ($.isUndefined(options.className) || $.isEmpty(options.className)) {
            getLinkStyle(getFilePath(thisFileName, getLocationPath()), 'table.css');
        }

        this.options = extendProperty({
            spaceWidth: 16,
            className: {
                expand: 'table-tree-expand',
                collapse: 'table-tree-collapse'
            }
        }, options);

        var className = this.options.className;
        if ($.isArray(className)) {
            this.options.className = {
                expand: className[0],
                collapse: className[1] || ''
            };
        }

        this.isTree = typeof isTree === 'boolean' ? isTree : false;
        this.collapseCache = {};
        this.datas = {};
        this.trees = {};
        this.maps = {};
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
            return !$.isUndefined(this.datas[key]);
        },
        getChildIds: function (pid) {
            var pkey = this.buildKey(pid);
            return this.trees[pkey] || [];
        },
        setLevel: function (data, pkey, hasParent) {
            if (!hasParent) {
                data.level = 0, data.pid = 0;
            } else {
                var pdata = this.datas[pkey];
                if (pdata && pdata.treeData && $.isInteger(pdata.treeData.level)) {
                    data.level = parseInt(1 + pdata.treeData.level, 10);
                }
            }
        },
        setMap: function (id, isDel) {
            var key = 'm_' + id;
            if (isDel) {
                if (!$.isUndefined(this.maps[key])) {
                    delete this.maps[key];
                }
            } else {
                this.maps[key] = 1;
            }
        },
        hasMap: function (id) {
            var key = 'm_' + id;
            return !$.isUndefined(this.maps[key]);
        },
        isExist: function (key) {
            return !$.isUndefined(this.datas[key]);
        },
        initial: function (bodyData) {
            if (!this.isTree) {
                return { datas: bodyData, trees: null };
            }
            if (!isDyadicArray(bodyData)) {
                bodyData = [bodyData];
            }
            var len = bodyData.length, keys = {}, trees = {}, arr = [], datas = [], pids = [];
            for (var i = 0; i < len; i++) {
                var dr = bodyData[i], isArray = $.isArray(dr), treeData = isArray ? null : dr.treeData;
                if (isArray || !$.isObject(treeData) || $.isEmpty(treeData)) {
                    arr.push({ level: 0, data: dr });
                } else {
                    var key = this.buildKey(treeData.id);
                    //检测是否已存在相同的ID，防止重复创建
                    if (!this.isExist(key)) {
                        this.datas[key] = dr;
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
                    this.setKeyValue(trees, pkey, treeData.id);
                    this.setKeyValue(this.trees, pkey, treeData.id);
                    trees[key] = [];
                }
                datas.push(dr);
            }
            //按level层级排序(升序)
            datas = this.quickSort(datas, 'level');

            return { datas: datas, trees: trees, pids: pids };
        },
        getRowIds: function (trees, expand, rows) {
            for (var i in trees) {
                var id = trees[i];
                if (!this.hasMap(id)) {
                    break;
                }
                //rows.push(doc.getElementById(this.buildId(id)));
                rows.push(id);

                if (!this.isCollapse(id) || !expand) {
                    var childs = this.trees[this.buildKey(id)];
                    if ($.isArray(childs)) {
                        this.getRowIds(childs, expand, rows);
                    }
                }
            }
            return rows;
        },
        buildSpace: function (len, char) {
            var w = 0;
            for (var i = 0; i < len; i++) {
                w += (this.options.spaceWidth || 16);
            }
            return w;
        },
        buildSwitchId: function (id) {
            return 'switch_' + id;
        },
        buildSwitch: function (id, width) {
            var a = '<a id="{0}" tid="{1}" expand="1" class="{2}" style="cursor:pointer;margin-left:{3}px !important;"></a>'.format(
                this.buildSwitchId(id), id, this.options.className.expand, this.buildSpace(width)
            );
            return a;
        },
        setSwitch: function (obj, collapse, isLevel) {
            if (obj === null) {
                return false;
            }
            obj.setAttribute('expand', collapse ? 0 : 1);
            obj.className = this.options.className[collapse ? 'collapse' : 'expand'];
            //obj.innerHTML = collapse ? ' ++ ' : ' -- ';
        },
        setCollapse: function (pid, ids, collapse) {
            var key = this.buildKey(pid);
            if (collapse) {
                this.collapseCache[key] = [];
                for (var i in ids) {
                    this.collapseCache[key].push(ids[i]);
                }
            } else {
                if (!$.isUndefined(this.collapseCache[key])) {
                    delete this.collapseCache[key];
                }
            }
        },
        isCollapse: function (id) {
            var key = this.buildKey(id);
            return !$.isUndefined(this.collapseCache[key]);
        },
        expandParent: function(id){
            var key = this.buildKey(id), data = this.datas[key];
            if(data && data.treeData){
                var pid = data.treeData.pid || 0, pkey = this.buildKey(pid), pdata = this.datas[pkey];
                if(pdata){
                    var btnSwitch = doc.getElementById(this.buildSwitchId(pid));
                    if(btnSwitch !== null && btnSwitch.getAttribute('expand') === '0'){
                        this.expand(pid);
                    }
                    this.expandParent(pid);
                }
            }
        },
        toggle: function (id, collapse) {
            var btnSwitch = doc.getElementById(this.buildSwitchId(id));
            if (btnSwitch === null) {
                return false;
            }
            //判断收缩还是展开
            collapse = $.isBoolean(collapse, btnSwitch.getAttribute('expand') === '1');
            this.setSwitch(btnSwitch, collapse, false);

            //展开时，需要检查父级节点是否是展开状态，若为收缩则展开
            if(!collapse){
                this.expandParent(id);
            }

            //获取当前节点下的所有子节点，展开和收缩 所获取到的子节点不一定相同，因为展开时需要屏蔽之前被收缩的子节点
            var childs = this.getChildIds(id), ids = this.getRowIds(childs, !collapse, []);
            //记录收缩状态
            this.setCollapse(id, ids, collapse);

            for (var i = ids.length - 1; i >= 0; i--) {
                var obj = doc.getElementById(this.buildId(ids[i]));
                if (obj !== null) {
                    obj.style.display = collapse ? 'none' : '';
                }
            }
        },
        collapse: function (id) {
            this.toggle(id, true);
        },
        expand: function (id) {
            this.toggle(id, false);
        },
        toggleLevel: function (level, collapse) {
            if (!$.isInteger(level)) {
                return false;
            }
            //按层级展开时，收缩的层级+1
            level += collapse ? 0 : 1;

            for (var i in this.datas) {
                var dr = this.datas[i].treeData || {}, id = dr.id;
                var obj = doc.getElementById(this.buildId(id)), btnSwitch = doc.getElementById(this.buildSwitchId(id));
                if (obj !== null) {
                    obj.style.display = dr.level <= level ? '' : 'none';
                }
                if (dr.level === level) {
                    //设置当前等级的子级为收缩状态，记录收缩状态
                    this.setSwitch(btnSwitch, true, true);
                    this.setCollapse(id, [], true);
                } else if (!collapse && dr.level < level) {
                    //按层级展开时，设置当前等级为展开状态
                    this.setSwitch(btnSwitch, false, true);
                }
            }
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