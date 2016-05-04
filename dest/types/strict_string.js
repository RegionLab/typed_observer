'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash');

/**
 * @namespace Observer types.string
 * */

exports.default = {
    isValid: function isValid(value) {
        return (0, _lodash.isString)(value) && (0, _lodash.isNaN)(+value) && !(0, _lodash.isObject)(value);
    },
    getValue: function getValue(value) {
        return value;
    },
    getPureValue: function getPureValue(value) {
        return value;
    }
};