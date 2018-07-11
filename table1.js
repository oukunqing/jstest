"use strict";

!function($) {
    function table(tb, datas, options){
        this.tb = null,this.tb = null, this.options = {
            showTree: false, treeRowIndex: 0
        };
        $.extend(this.options, options);
        this.tt = new tableTree(this.options.showTree);

        if (typeof tb === 'object' && tb.tagName === 'TABLE') {
            this.tb = tb;
        } else if (typeof tb === 'string') {
            this.tb = document.getElementById(tb);
        } else {
            this.tb = document.createElement('table');
            document.body.appendChild(this.tb);
        }

        if($.isObject(datas)){
            if(datas.head){
                this.createHead(datas.head);
            }
            if(datas.body){
                var ds = this.tt.initial(datas.body);
                this.createBody(ds.data, ds.tree, ds.pid);
            }
        }
    }

    table.prototype = {
        getRowIndex: function() {
            return this.tb.rows.length;
        },
        create: function(headData, bodyData) {
            createHead(headData);
            var ds = this.tt.initial(bodyData);
            console.log('ds0: ', ds);
            this.createBody(ds.data, ds.tree, ds.pid);
        },
        append: function(bodyData){
            var ds = this.tt.initial(bodyData, true);
            console.log('ds:', ds);
            this.createBody(ds.data, ds.tree, ds.pid);
        },
        createHead: function(data) {
            var that = this, container = that.tb.tHead || function() { return that.tb.createTHead(); }();
            if (!container) {
                container = that.tb.createTHead();
            }
            that.createRow(container, data, null);
        },
        createBody: function(data, tree, pid) {
            var that = this, container = that.tb.tBodies[0] || function() { return that.tb.createTBody(); }();
            var isTree = $.isObject(tree);
            if(isTree){
                that.createRowTree(container, data, tree, pid);
            } else {
                that.createRow(container, data);
            }
        },
        getPid: function(data){
            if(data && data.treeData){
                return data.treeData.pid;
            }
            return 0;
        },
        getId: function(data){
            if(data && data.treeData){
                return data.treeData.id;
            }
            return -1;
        },
        checkChild: function(pid, tree){
            var key = 'k' + pid;
            if(tree !== null){
                var childs = tree[key];
                if(childs && childs.length > 0){
                    return true;
                }
            }
            return false;
        },
        getChild: function(pid, tree, data){
            var key = 'k' + pid;
            //  var key = pid;
            if(tree !== null){
                var childs = tree[key];
                if(childs && childs.length > 0){
                    var list = [];
                    for(var i=0; i<childs.length; i++){
                        list.push(data['k' + childs[i]]);
                    }
                    return list;
                }
            }
            return [];
        },
        createRow: function(container, data) {
            var rowIndex = container.rows.length;
            for(var i in data){
                this.insertRow(container, rowIndex + i, data[i], false);
            }
        },
        createRowTree: function(container, data, tree, pid){
            var rowIndex = container.rows.length;
            console.log('data: ', data, ', pid: ', pid);
            var i = 0;
            for(var k in data){
                var d = data[k], _pid = d.treeData ? d.treeData.pid : 0;
                console.log(d, _pid, pid);
                if(_pid === pid){
                    this.insertRow(container, rowIndex + i, d, true);
                    var id = this.getId(d);
                    if(id >= 0){
                        var hasChild = this.checkChild(id, tree);
                        if(hasChild){
                            this.createRowTree(container, data, tree, id);
                        }
                    }
                    i++;
                }
            }
            /*
            for(var k in tree){
                console.log('k: ', k);
            }

                var rowIndex = container.rows.length;
                var childs = this.getChild(pid || 0, tree, data);
                console.log('childs:', childs);
                
                for(var i in childs){
                    this.insertRow(container, rowIndex + i, childs[i], true);

                    var id = this.getId(childs[i]);
                    console.log('id:', id);
                    if(id >= 0){
                        var hasChild = this.checkChild(id, tree);
                        if(hasChild){
                            this.createRowTree(container, data, tree, id);
                        }
                    }
                }*/

/*
            var rowIndex = container.rows.length;
            var childs = this.getChild(pid || 0, tree, data);             
            for(var i in childs){
                this.insertRow(container, rowIndex + i, childs[i], true);

                var id = this.getId(childs[i]);
                if(id >= 0){
                    var hasChild = this.checkChild(id, tree);
                    if(hasChild){
                        this.createRowTree(container, data, tree, id);
                    }
                }
            }*/
        },
        insertRow: function(container, rowIndex, data, isTree) {
            if($.isUndefined(container)){
                container = this.tb;
            }
            if ($.isUndefined(data) || null === data) {
                return false;
            }
            if (typeof rowIndex !== 'number') {
                rowIndex = container.length;
            }
            var row = container.insertRow(rowIndex);
            this.insertCell(row, data, isTree);
            return row;
        },
        insertCell: function(row, data, isTree) {
            var cellData = data.cellData, rowData = data.rowData, treeData = data.treeData, cols = cellData.length;
            var cellIndex = 0, index = 0, prefix = '';
            var isRow = $.isObject(rowData) && !$.isEmpty(rowData);
            for (var i = 0; i < cols; i++) {
                if(isRow && i === 0){
                    this.insertCellElement(row, rowData);
                }
                if(isTree && i===0){
                    row.setAttribute('treeId', treeData.id);
                    index = this.options.treeRowIndex || 0;
                    prefix = this.tt.buildSpace(treeData.level, '&nbsp;&nbsp;&nbsp;&nbsp;');
                }
                var dr = cellData[i], cell = row.insertCell(cellIndex);

                cell.innerHTML = (i===index ? prefix : '') + (dr.content || dr.html);
                if(cellIndex === index){
                    prefix = '';
                }

                if(isSpan(dr.rowSpan)) {
                    cell.rowSpan = dr.rowSpan;
                }
                if(isSpan(dr.colSpan)){
                    cell.colSpan = dr.colSpan;
                }
                this.insertCellElement(cell, dr);
               
                cellIndex++;
            }
            return cell;
        },
        insertCellElement: function(container, dr){
            if(isString(dr.className, dr.css)){
                container.className = dr.className || dr.css;
            }
            if($.isObject(dr.style)){
                for(var k in dr.style){
                    container.style[k] = dr.style[k];
                }
            }
            if($.isObject(dr.event)){
                for(var k in dr.event){                        
                    addListener(container, k, dr.event[k]);
                }
            }
            if($.isObject(dr.attribute)){
                for(var k in dr.attribute){
                    container.setAttribute(k, dr.attribute[k]);
                }
            }
        }
    };

    function createElement(elm, parent, fn) { 
        var element = document.createElement(elm); fn && fn(element); parent && parent.appendChild(element); 
        return element;
    }

    function addListener(element, e, fn) { 
        element.addEventListener ? element.addEventListener(e, fn, false) : element.attachEvent("on" + e, fn);
    }
    
    function removeListener(element, e, fn) {
        element.removeEventListener ? element.removeEventListener(e, fn, false) : element.detachEvent("on" + e, fn);
    }

    function isSpan(span){
        return typeof span === 'number' && span > 0;
    }

    function isString(){
        for(var i=0; i<arguments.length; i++){
            if(typeof arguments[i] === 'string' && arguments[i].length > 0){
                return true;
            }
        }
        return false;
    }

    function tableTree(isTree){
        this.isTree = $.isBoolean(isTree, false);
        this.data = {};
        this.tree = {};
        this.pid = 0;
    }

    tableTree.prototype = {
        initial: function(bodyData, isAppend){
            if(!this.isTree){
                return {data: bodyData, tree: null};
            }
            var arr = [], len = bodyData.length;
            for(var i=0; i<len; i++){
                var dr = bodyData[i], rd = dr.rowData;
                if($.isObject(rd) && rd.isTree){
                    arr.push({level:rd.tree.level, data: dr})
                }else{
                    arr.push({level: 0, data: dr})
                }
            }
            arr = this.quickSort(arr, 'level');

            if(isAppend){
                var data = {}, tree = {}, pid = 0;
                for(var i=0; i<arr.length; i++){
                    var t = arr[i].data.treeData, key = 'k' + t.id, pkey = 'k' + t.pid;
                    data[key] = arr[i].data;
                    if(i === 0){
                        pid = t.pid || 0;
                    }
                    this.data[key] = arr[i].data;

                    if(!tree[pkey]){
                        tree[pkey] = [];
                    }
                    tree[pkey].push(t.id);
                    tree[key] = [];

                    if(!this.tree[pkey]){
                        this.tree[pkey] = [];
                    }
                    this.tree[pkey].push(tree.id);
                    this.tree[key] = [];
                }
                return {data: data, tree: tree, pid: pid};
            } else {
                for(var i=0; i<arr.length; i++){
                    var t = arr[i].data.treeData, key = 'k' + t.id, pkey = 'k' + t.pid;
                    if(i === 0){
                        this.pid = t.pid || 0;
                    }
                    this.data[key] = arr[i].data;
                    if(!this.tree[pkey]){
                        this.tree[pkey] = [];
                    }
                    this.tree[pkey].push(t.id);
                    this.tree[key] = [];
                }
                return {data: this.data, tree: this.tree, pid: this.pid};
            }
        },
        buildSpace: function(len, char){
            var s = '';
            for(var i=0; i<len; i++){
                s += char;
            }
            return s;
        },
        quickSort :function (arr, key) {
            if (0 === arr.length) {
                return [];
            }
            var left = [], right = [], pivot = arr[0], c = arr.length;            
            for (var i = 1; i < c; i++) {
                arr[i][key] < pivot[key] ? left.push(arr[i]) : right.push(arr[i]);
            }
            return this.quickSort(left, key).concat(pivot, this.quickSort(right, key));
        }
    };




    $.table = table;
}($);