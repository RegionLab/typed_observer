"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @namespace Observer types.any
 * */
exports.default = {
    isValid: function isValid(value) {
        return true;
    },
    getValue: function getValue(value) {
        return value;
    },
    getPureValue: function getPureValue(value) {
        return value;
    }
};