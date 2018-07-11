"use strict";

!function($) {
    function table(tb, datas, options) {
        this.tb = null, this.options = {
            showTree: false
        }, 
        this.tree = new tableTree(), this.treeData = {};
        if (typeof tb === 'object' && tb.tagName === 'TABLE') {
            this.tb = tb;
        } else if (typeof tb === 'string') {
            this.tb = document.getElementById(tb);
        } else {
            this.tb = document.createElement('table');
            document.body.appendChild(this.tb);
        }
        $.extend(this.options, options);

        if($.isObject(datas)){
            if(datas.head){
                this.createHead(datas.head);
            }
            if(datas.body){
                if(this.options.showTree){
                    datas.body = this.tree.initial(datas.body);
                    this.treeData = this.tree.treeData;

                    console.log('this.treeData: ', this.treeData);
                }
                this.createBody(datas.body);
            }
        }

    }

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

    table.prototype = {
        getRowIndex: function() {
            return this.tb.rows.length;
        },
        create: function(headData, bodyData) {
            createHead(headData);
            createBody(bodyData);
        },
        createHead: function(data) {
            var that = this, container = that.tb.tHead || function() { return that.tb.createTHead(); }();
            if (!container) {
                container = that.tb.createTHead();
            }
            that.createRow(data, container);
        },
        createBody: function(data) {
            var that = this, container = that.tb.tBodies[0] || function() { return that.tb.createTBody(); }();
            that.createRow(data, container);
        },
        createRow: function(data, container) {
            if (!$.isArray(data)) {
                return false;
            }
            var len = data.length, rowIndex = container.rows.length;
            if(len === 0){
                return false;
            }
            if($.isArray(data[0])){
                for (var i = 0; i < len; i++) {
                    this.insertRow(rowIndex + i, data[i], container);
                }
            }else{
                this.insertRow(rowIndex, data, container);
            }
        },
        insertRow: function(rowIndex, rowData, container) {
            if($.isUndefined(container)){
                container = this.tb;
            }
            if ($.isUndefined(rowData) || null === rowData) {
                return false;
            }
            if (typeof rowIndex !== 'number') {
                rowIndex = container.length;
            }
            var row = container.insertRow(rowIndex);
            console.log('row: ', row.rowIndex);
            this.insertCell(row, rowData);
            return row;
        },
        insertCell: function(row, rowData) {
            var cols = rowData.length, cellIndex = 0, isTree = false, index = 0, prefix = '', level = 0, pid = null;
            for (var i = 0; i < cols; i++) {
                var dr = rowData[i], cell = null;
                if(typeof dr === 'object'){
                    if(dr.isRow){
                        cellIndex--;
                        row.setAttribute('treeId', dr.tree.id);
                        this.insertCellElement(row, dr);
                        isTree = dr.isTree;
                        index = dr.index;
                        level = dr.tree.level;
                        pid = dr.tree.pid;
                        console.log('level: ', level);
                    } else {
                        cell = row.insertCell(cellIndex);
                        if(isTree && cellIndex === index){
                            prefix =  this.tree.buildSpace(level, '&nbsp;&nbsp;&nbsp;&nbsp;');
                            console.log('prefix: ', prefix);
                        }
                        cell.innerHTML = prefix + (dr.content || dr.html);

                        if(isSpan(dr.rowSpan)) {
                            cell.rowSpan = dr.rowSpan;
                        }
                        if(isSpan(dr.colSpan)){
                            cell.colSpan = dr.colSpan;
                        }
                        this.insertCellElement(cell, dr);
                    }
                } else {
                    cell = row.insertCell(cellIndex);
                    cell.innerHTML = dr;
                }
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


    function tableTree(bodyData){
        this.treeData = {};
    }

    tableTree.prototype = {
        initial: function(bodyData){
            var arr = [], list = [], len = bodyData.length;
            for(var i=0; i<len; i++){
                var dr = bodyData[i];
                var firstData = dr[0];
                if($.isObject(firstData) && firstData.isRow){
                    console.log('tree: ', firstData.tree);
                    arr.push({level:firstData.tree.level, data: dr})
                }else{
                    arr.push({level: 0, data: dr})
                }
            }
            arr = this.quickSort(arr, 'level');
console.log('arr: ', arr);

            for(var i=0; i<arr.length; i++){
                list.push(arr[i].data);

                var tree = arr[i].data[0].tree, key = 'k' + tree.id, pkey = 'k' + tree.pid;
                this.treeData[key] = [];

                if(this.treeData[pkey]){
                    this.treeData[pkey].push(tree.id);
                }
            }

            return list;
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