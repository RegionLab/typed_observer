"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @namespace Observer types.int
 * */

/**
 *
 * Тип поля обсервера.
 * Считается валидным если  при приведении начения к числу результат приведения не NaN
 * "Чистым" значением являетяс значение приведенное к числу
 * */
exports.default = {
    isValid: function isValid(value) {
        return value !== undefined && window.isFinite(value);
    },
    getValue: function getValue(value) {
        return value;
    },
    getPureValue: function getPureValue(value) {
        return +value;
    }
};