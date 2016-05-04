'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _observer = require('../observer/observer.js');

var _observer2 = _interopRequireDefault(_observer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Класс описывает поведение простого непримитивного типа.
 *
 * */

var BaseType = function () {

    /**
     * @constructor
     * @param {string} name - имя поля к которому привязан тип
     * @param {Observer} observer - родительский observer
     * @return {BaseType}
     * */

    function BaseType(name, observer) {
        _classCallCheck(this, BaseType);

        if (observer instanceof _observer2.default) {
            this._parentObserver = observer;
            this._observerName = name;
        } else {
            throw new Error('argument observer should be Observer');
        }
    }

    /**
     * Оповещение родительского наблюдателя об изменении
     * */


    _createClass(BaseType, [{
        key: 'notify',
        value: function notify() {
            this._parentObserver.extendUpdate(this._observerName);
            return this;
        }

        /**
         * Имитация поведения примитивного типа
         * @param {*} value
         * @return {boolean} - всегда отдает true;
         * */

    }, {
        key: 'isValid',
        value: function isValid() {
            return true;
        }

        /**
         * Имитация поведение примитивного типа
         * @param {*} value
         * @return {BaseType} - всегда отдает самого себя
         * */

    }, {
        key: 'getValue',
        value: function getValue() {
            return this;
        }

        /**
         * Возвращает сериализованное представление объекта
         * */

    }, {
        key: 'getPureValue',
        value: function getPureValue() {
            console.warn('Переопределите метод');
            return {};
        }
    }]);

    return BaseType;
}();

exports.default = BaseType;