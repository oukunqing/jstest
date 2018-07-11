"use strict"

var $ = $ || {};

!function($) {
    var CRC = function() {
        this.value = 0;
        return {
            CRC16: function(data, isReverse) {
                var len = data.length, crc = 0xFFFF;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        crc = (crc ^ (data[i]));
                        for (var j = 0; j < 8; j++) {
                            crc = (crc & 1) !== 0 ? ((crc >> 1) ^ 0xA001) : (crc >> 1);
                        }
                    }
                    var high = (crc & 0xFF00) >> 8, low = crc & 0x00FF;
                    return isReverse ? (high + low * 0x100) : (high * 0x100 + low);
                }
                return 0;
            },
            strToByte: function(data) {
                if (typeof data === 'object' && typeof data[0] === 'number') {
                    return data;
                }
                var tmp = data.split(''), arr = [];
                for (var i = 0, c = tmp.length; i < c; i++) {
                    var j = encodeURI(tmp[i]);
                    if (j.length === 1) {
                        arr.push(j.charCodeAt());
                    } else {
                        var b = j.split('%');
                        for (var m = 1; m < b.length; m++) {
                            arr.push(parseInt('0x' + b[m]));
                        }
                    }
                }
                return arr;
            },
            strToHex: function(hex, isFilter) {
                hex = this.convertChinese(hex, isFilter).join('');
                //清除所有空格
                hex = hex.replace(/\s/g, "");
                //若字符个数为奇数，补一个空格
                hex += hex.length % 2 != 0 ? " " : "";

                var c = hex.length / 2, arr = [];
                for (var i = 0; i < c; i++) {
                    arr.push(parseInt(hex.substr(i * 2, 2), 16));
                }
                return arr;
            },
            convertChinese: function(str, isFilter) {
                var tmp = str.split(''), arr = [];
                for (var i = 0, c = tmp.length; i < c; i++) {
                    var s = tmp[i].charCodeAt();
                    if (s > 0 && s < 127) {
                        arr.push(tmp[i]);
                    } else if (!isFilter) {
                        arr.push(s.toString(16));
                    }
                }
                return arr;
            },
            padLeft: function(s, w, pc) {
                for (var i = 0, c = w - s.length; i < c; i++) {
                    s = pc + s;
                }
                return s;
            },
            toCRC16: function(data, isReverse) {
                return this.value = this.CRC16(this.strToByte(data), isReverse), this.toString();
            },
            toModbusCRC16: function(data, isReverse) {
                return this.value = this.CRC16(this.strToHex(data), isReverse), this.toString();
            },
            toString: function() {
                console.log(this.value);
                return this.padLeft(this.value.toString(16).toUpperCase(), 4, '0');
            }
        };
    };

    $.CRC = new CRC();
}($);


console.log($.CRC.toCRC16('AB'));

console.log($.CRC.toModbusCRC16('AB'));