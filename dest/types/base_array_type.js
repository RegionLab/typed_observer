'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _lodash = require('lodash');

var _base_type = require('./base_type.js');

var _base_type2 = _interopRequireDefault(_base_type);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseArrayObserver = function (_BaseType) {
    _inherits(BaseArrayObserver, _BaseType);

    /**
     * @constructor
     * @param {string} name - имя поля к которому привязан тип
     * @param {Observer} parentObserver - родительский observer
     * @return {BaseArrayObserver}
     * */

    function BaseArrayObserver(name, parentObserver) {
        _classCallCheck(this, BaseArrayObserver);

        /**
         * @type {Array}
         * */

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BaseArrayObserver).call(this, name, parentObserver));

        _this._array = [];
        _this.updateItemCbs = {};
        _this.onArrayUpdate = _this.updateArrayHandler.bind(_this);
        Array.observe(_this._array, _this.onArrayUpdate);
        return _this;
    }

    /**
     * @type {number} кол-во элементов в массиве
     * */


    _createClass(BaseArrayObserver, [{
        key: 'removeOnUpdate',
        value: function removeOnUpdate(index, cb) {
            if (this.updateItemCbs[index]) {
                (0, _lodash.remove)(this.updateItemCbs[index], function (updateCb) {
                    return updateCb === cb;
                });
            }
        }
    }, {
        key: 'updateArrayHandler',
        value: function updateArrayHandler(events) {
            var _this2 = this;

            _get(Object.getPrototypeOf(BaseArrayObserver.prototype), 'notify', this).call(this);

            _.each(events, function (event) {
                _this2.notify(event.name);
            });
        }
    }, {
        key: 'get',
        value: function get(index) {
            if (this.length > index && this._array[index]) {
                return this._array[index];
            }
            return null;
        }
    }, {
        key: 'notify',
        value: function notify(index) {
            var _this3 = this;

            if ((0, _lodash.isArray)(this.updateItemCbs[index]) && this.updateItemCbs[index].length) {
                (0, _lodash.each)(this.updateItemCbs[index], function (cb) {
                    cb(_this3.get(index));
                });
            }
        }

        /**
         * Навешивает обработчик на изменение
         * @param {number} index - индекс элемента при изменении которого происхойдет
         * */

    }, {
        key: 'onUpdate',
        value: function onUpdate(index, cb) {
            if (index >= this.length) {
                console.error('Невозможно навесить обработчик на обновление ', index, '-го элемента');
            } else {
                if (!this.updateItemCbs[index]) {
                    this.updateItemCbs[index] = [];
                }
                this.updateItemCbs[index].push(cb);
                return this.removeOnUpdate.bind(this, index, cb);
            }
            return _lodash.noop;
        }

        /**
         * Установка массива
         * Установка массива  происходит без потери ссылки, т.е мы не присваиваем массив, а всегда только заполняем
         * @param {Array} array
         * @return {BaseArrayObserver} this
         * */

    }, {
        key: 'setArray',
        value: function setArray(array) {
            var _this4 = this;

            if ((0, _lodash.isArray)(array)) {
                this.clear();
                (0, _lodash.each)(array, function (item) {
                    _this4.push(item);
                });
            }
        }
    }, {
        key: 'push',
        value: function push(item) {
            if (!(0, _lodash.isUndefined)(item)) {
                this._array.push(item);
            }
        }

        /**
         * Очистка массива без потери ссылки
         * @return {BaseArrayObserver} this
         * */

    }, {
        key: 'clear',
        value: function clear() {
            this._array.length = 0;
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            Array.unobserve(this._array, this.onArrayUpdate);
            this.clear();
        }
    }, {
        key: 'length',
        get: function get() {
            return this._array.length;
        }
    }]);

    return BaseArrayObserver;
}(_base_type2.default);

exports.default = BaseArrayObserver;