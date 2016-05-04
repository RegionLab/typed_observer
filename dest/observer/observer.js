'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _any = require('../types/any.js');

var _any2 = _interopRequireDefault(_any);

var _base_type = require('../types/base_type.js');

var _base_type2 = _interopRequireDefault(_base_type);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @namespace Observer
 * */

/**
 * @typedef {object} Observer~FieldSettings
 * @property {boolean} lockUpdate - Блокировка на вызов колбеков
 * @property {boolean} frozen - заморозка свойства
 * @property {boolean} required - обязательное поле
 * @property {*} defaultValue - значение по умолчанию
 * */

/**
 * @callback Observer~updateItemCallback
 * @param {*} value - значение
 * @param {object} data - хендлер для принятия значений
 * */

/**
 * @callback Observer~updateCallback
 * @param {object} data - хендлер для принятия значений
 * @return {undefined}
 * */

var Observer = function () {
    function Observer() {
        _classCallCheck(this, Observer);

        /**
         * @desc объект для хранения значений
         * @type {Object}
         * */
        this.dataValues = {};

        /**
         * @desc объект для принятия значения
         * @type {Object}
         * */
        this.data = {};
        /**
         * @desc список колбеков вызываемых при обновлении любого свойства
         * @type {Array<Observer~updateCallback>}
         * */
        this.updateCbs = [];

        /**
         * @type {Map}
         * @desc карта для хранения настроек полей
         * */
        this.fieldSettings = new Map();
        /**
         * @desc идентификатор версии
         * @type {number}
         * */
        this.filterVersion = 0;

        this._frozen = false;

        this._lock = false;
    }

    /**
     * Проверка является ли свойство замороженным
     * @param {string} [name] - имя поля
     * @return {boolean}
     * */


    _createClass(Observer, [{
        key: 'isFrozen',
        value: function isFrozen(name) {
            if (name) {
                var settings = this.getFieldSettings(name);
                return settings.frozen;
            }
            return this._frozen;
        }

        /**
         * Заморозка поля или фильтра в общем
         * Если функция вызывается с аргументов, то считается что идет попытка заморозки поля
         * Иначе замараживается весь наблюдатель
         * @param {string} [name] - имя поля для заморозки
         * @return {Observer}
         * */

    }, {
        key: 'freeze',
        value: function freeze(name) {
            if (name) {
                if (this.has(name) && !this.isFrozen(name)) {
                    var settings = this.getFieldSettings(name);
                    settings.frozen = true;
                }
            } else {
                this._frozen = true;
            }

            return this;
        }

        /**
         * Установка дефолтного значения для свойства
         * @param {string} name - имя свойства
         * @param {*} value - дефолтное значение
         * */

    }, {
        key: 'setDefaultValue',
        value: function setDefaultValue(name, value) {
            if (name && this.has(name)) {
                var settings = this.getFieldSettings(name);
                if (settings.type.isValid(value)) {
                    settings.defaultValue = value;
                } else {
                    console.error('Observer', name, 'Значение не валидно');
                }
            }
            return this;
        }

        /**
         * Разморозка поля
         * @param {string} [name] - имя свойства
         * @return {Observer} this
         * */

    }, {
        key: 'defreeze',
        value: function defreeze(name) {
            if (name) {
                if (this.has(name) && this.isFrozen(name)) {
                    var settings = this.getFieldSettings(name);
                    settings.frozen = false;
                }
            } else {
                this._frozen = false;
            }

            return this;
        }
    }, {
        key: 'validate',
        value: function validate() {
            var settings = null,
                value = null,
                validate = {};
            for (var i in this.data) {
                if (this.has(i)) {
                    settings = this.getFieldSettings(i);
                    validate[i] = !settings.type.isValid(this.get(i)) && settings.required;
                }
            }
            return true;
        }

        /**
         * Проверка валидности данных исходя из правил валидации.
         * Если значение поля не валидно, то если поле является обязательным данные считаются невалидными.
         * @return {boolean}
         * */

    }, {
        key: 'isValid',
        value: function isValid() {
            var settings = null,
                value = null;
            for (var i in this.data) {
                if (this.has(i)) {
                    settings = this.getFieldSettings(i), value = this.get(i);

                    if (!settings.type.isValid(value) && settings.required) {
                        return false;
                    }
                }
            }
            return true;
        }

        /**
         * Сериализует полученные данные исходя из настроек поля
         * @return {object} - объект с сериализованными данными
         * */

    }, {
        key: 'serialize',
        value: function serialize() {
            var ret = {};
            for (var i in this.data) {
                if (this.has(i)) {
                    var settings = this.getFieldSettings(i);
                    var value = this.get(i);
                    if (!settings.type.isValid(value) && settings.required) {
                        return {};
                    }
                    ret[i] = settings.type.getPureValue(value);
                }
            }
            return ret;
        }

        /**
         * @param {string} name - имя поля
         * @param {object} type - описание типа поля
         * @param {Observer~FieldSettings} [settings] - дефолтное значение для поля(Если функция, то она будет вызываться для получения значения)
         * */

    }, {
        key: 'define',
        value: function define(name, type, settings) {
            if (!this.fieldSettings.has(name)) {
                type = type || _any2.default;

                if (name && (0, _lodash.isObject)(type)) {

                    // Инициализируем настройки
                    var settings = settings || {};
                    if ((0, _lodash.isFunction)(type) /*.__proto__ === BaseType*/) {
                            // по другому никак, хотя...
                            type = new type(name, this);
                            this.dataValues[name] = type;
                        }
                    if (settings.type) {
                        type = settings.type;
                    } else {
                        settings.type = type;
                    }

                    if (!this.dataValues[name]) {
                        this.dataValues[name] = (0, _lodash.isFunction)(settings.defaultValue) ? settings.defaultValue() : settings.defaultValue;
                    }

                    this.fieldSettings.set(name, settings);

                    var self = this;
                    Object.defineProperty(this.data, name, {
                        configurable: true,
                        enumerable: true,
                        get: function get() {
                            return self.dataValues[name];
                        },
                        set: function set(value) {
                            if (!self._frozen && !self.isFrozen(name)) {
                                if (type.isValid(value)) {
                                    value = type.getValue(value);
                                    if (self.dataValues[name] != value) {
                                        self.dataValues[name] = value;
                                        console.warn('OBSERVER', name, 'changed');
                                        self.filterVersion++;
                                        self.extendUpdate(name);
                                    } else {
                                        console.warn('OBSERVER', name, 'not changed');
                                    }
                                } else {
                                    console.warn('OBSERVER', name, 'not valid');
                                }
                            } else {
                                console.warn('OBSERVER', name, 'observer is frozen');
                            }
                        }
                    });
                }
            }
            return this;
        }

        /**
         * Сброс значения свйоства
         * Если указано имя свойства, то происходит сброс до дефолтного значения этого свойтсва.
         * Если имя не указано, то происходит сброс до дефолтного состояния
         * @param {string} [name] - Имя поля
         * @return {Observer}
         * */

    }, {
        key: 'reset',
        value: function reset(name) {
            var _this = this;

            if (name) {
                if (this.has(name) && !this.isFrozen(name)) {
                    var settings = this.getFieldSettings(name);
                    this.data[name] = settings.defaultValue;
                }
            } else {
                var keys = Object.keys(this.data);
                (0, _lodash.each)(keys, function (key) {
                    var settings = _this.fieldSettings.get(key);
                    _this.data[key] = settings.defaultValue;
                });
            }
            return this;
        }

        /**
         * Устанавливает значение поля
         *
         * @param {string} name - имя поля
         * @param {*} value - имя поля
         * @return {Observer} this
         * */

    }, {
        key: 'set',
        value: function set(name, value) {
            if (this.has(name)) {
                this.data[name] = value;
            }
            return this;
        }

        /**
         * Получение значения поля
         * @param {string} [name] - имя поля
         * @return {*|null} значение поля, если поля нет, то вернется null
         * */

    }, {
        key: 'get',
        value: function get(name) {
            if (name) {
                if (this.data.hasOwnProperty(name)) {
                    debugger;
                    return this.data[name];
                }
                return null;
            }
            return this.data;
        }

        /**
         * Проверка наличия поля
         * @param {string} name - имя поля
         * @return {boolean}
         * */

    }, {
        key: 'has',
        value: function has(name) {
            return this.data.hasOwnProperty(name);
        }
        /**
         * Удаление поля
         * @param {string} name - имя поля
         * @return {Observer} this
         * */

    }, {
        key: 'delete',
        value: function _delete(name) {
            if (name && this.has(name)) {
                delete this.data[name]; // уаление хэндлера поля
                delete this.dataValues[name]; // удаление значения поля
                this.fieldSettings.delete(name);
            }
            return this;
        }
    }, {
        key: 'removeUpdate',
        value: function removeUpdate(name, cb) {
            if ((0, _lodash.isFunction)(name)) {
                (0, _lodash.remove)(this.updateCbs, function (updateCb) {
                    return updateCb === name;
                });
            } else {
                if (this.has(name)) {
                    var settings = this.getFieldSettings(name);
                    if ((0, _lodash.isArray)(settings.cbs) && settings.cbs.length) {
                        (0, _lodash.remove)(settings.cbs, function (updateCb) {
                            return updateCb === cb;
                        });
                    }
                }
            }
        }

        /**
         * Навешивает обработчик на обновления.
         * Если первым аргументов передается строка, то считаем что навешиваем обработчик на одно свойство,
         * Иначе считаем что обработчик навешивается на любое обновления.
         *
         * @param {string|Observer~updateCallback} name - имя поля или функция обработчик
         * @param {Observer~updateCallback|Observer~updateItemCallback} [cb] - обработчик изменения поля
         * @return {Observer} this
         * */

    }, {
        key: 'onUpdate',
        value: function onUpdate(name, cb) {
            if ((0, _lodash.isFunction)(name)) {
                this.updateCbs.push(name);
            } else {
                if (this.has(name)) {
                    var settings = this.getFieldSettings(name);
                    if (!settings.cbs) {
                        settings.cbs = [];
                    }
                    settings.cbs.push(cb);
                }
            }
            return this;
        }

        /**
         * Получение настроек свойства
         *
         * @param {string} name - имя свойства
         * @return {Observer~FieldSettings|null} - настройки поля
         * */

    }, {
        key: 'getFieldSettings',
        value: function getFieldSettings(name) {
            if (name) {
                return this.fieldSettings.get(name);
            }
            return null;
        }

        /**
         * Запрет на распространение обновлений
         *
         * @param {string} [name] - имя поля
         * @return {Observer} this
         * */

    }, {
        key: 'lockUpdate',
        value: function lockUpdate(name) {
            if (name) {
                if (this.has(name)) {
                    var settings = this.getFieldSettings(name);
                    settings.lockUpdate = true;
                }
            } else {
                this._lock = true;
            }
            return this;
        }

        /**
         * Снятие запрета на распространение обновлений
         *
         * @param {string} [name] - имя поля
         * @return {Observer} this
         * */

    }, {
        key: 'unlockUpdate',
        value: function unlockUpdate(name) {
            if (name) {
                if (this.has(name)) {
                    var settings = this.getFieldSettings(name);
                    settings.lockUpdate = false;
                }
            } else {
                this._lock = false;
            }
            return this;
        }

        /**
         * Проверка свойства на блокировку распространения обновления
         * Если имя свойства не указано, то вернется результат проверка блокировки наблюдателя
         *
         * @param {string} [name] - имя свойства
         * @return {boolean}
         * */

    }, {
        key: 'isLockUpdate',
        value: function isLockUpdate(name) {
            if (name) {
                var settings = this.getFieldSettings(name);
                return Boolean(settings.lockUpdate);
            }
            return Boolean(this._lock);
        }

        /**
         * Рассылка обновлений
         *
         * @param {string} [name] - имя измененного свойства
         * @return {Observer} this
         * */

    }, {
        key: 'extendUpdate',
        value: function extendUpdate(name) {
            var _this2 = this;

            var lock = this.isLockUpdate(name);
            if (!lock) {
                if (name) {
                    var settings = this.getFieldSettings(name);
                    if ((0, _lodash.isArray)(settings.cbs) && settings.cbs.length) {
                        var cbs = settings.cbs;

                        (0, _lodash.each)(cbs, function (cb) {
                            (0, _lodash.defer)(cb, _this2.get(name), _this2.data);
                        });
                    }
                    (0, _lodash.each)();
                }
                (0, _lodash.each)(this.updateCbs, function (cb) {
                    (0, _lodash.defer)(cb, _this2.data);
                });
            } else {
                console.warn('OBSERVER IS LOCK');
            }

            return this;
        }

        /**
         * Удаление всех данных
         * */

    }, {
        key: 'destroy',
        value: function destroy() {
            for (var name in this.data) {
                this.delete(name);
            }
            this.updateCbs.length = 0;
            this.filterVersion = 0;
        }
    }]);

    return Observer;
}();

exports.default = Observer;