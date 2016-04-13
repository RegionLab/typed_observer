import {
    isObject,
    isFunction,
    isUndefined,
    each,
    defer,
    remove,
} from 'lodash';
import AnyType from '../types/any.js';

/**
 * @namespace Observer
 * */

export default class Observer {
    constructor() {
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

        this.fieldSettings = new Map();
        /**
         * @desc идентификатор версии
         * @type {number}
         * */
        this.filterVersion = 0;
        /**
         * @desc дефолтные значения
         * @type {number}
         * */
        this.defaultValues = {};
        /**
         * @desc карта для хранения список колбеков
         * @type {number}
         * */
        this.dataHandlers = new Map();

        this.frozen = false;
    }

    /**
     * Проверка является ли свойство замороженным
     * @param {string} name - имя поля
     * @return {boolean}
     * */
    isFrozen(name) {
        var settings = this.fieldSettings.get(name);
        return settings.frozen;
    }

    /**
     * Заморозка поля или фильтра в общем
     * Если функция вызывается с аргументов, то считается что идет попытка заморозки поля
     * Иначе замараживается весь наблюдатель
     * @param {string} name - имя поля для заморозки
     * @return {Observer}
     * */
    freeze(name) {
        if(name) {
            if(this.has(name) && !this.isFrozen(name)) {
                var settings = this.fieldSettings.get(name);
                settings.frozen = true;
            }
        } else {
            this.frozen = true;
        }

        return this;
    }

    /**
     * Разморозка поля
     * */
    defreeze(name) {
        if(name) {
            if(this.has(name) && this.isFrozen(name)) {
                var settings = this.fieldSettings.get(name);
                settings.frozen = false;
            }
        } else {
            this.frozen = false;
        }

        return this;
    }

    /**
     * @param {string} name - имя поля
     * @param {object} type - описание типа поля
     * @param {*} defaultValue - дефолтное значение для поля(Если функция, то она будет вызываться для получения значения)
     * */
    define(name, type, defaultValue) {
        if(!this.fieldSettings.has(name)) {
            type = type || AnyType;
            if(name && isObject(type)) {
                this.dataValues[name] = void 0;
                var settings = {};
                this.fieldSettings.set(name, settings);
                if(!isUndefined(defaultValue)) {
                    settings.defaultValue = isFunction(defaultValue) ? defaultValue : type.getPureValue(defaultValue);
                }
                var self = this;
                Object.defineProperty(this.data, name, {
                    configurable: true,
                    enumerable: true,
                    get: function () {
                        return self.dataValues[name];
                    },
                    set: function(value) {
                        if(!self.frozen && !self.isFrozen(name)) {
                            if(type.isValid(value)) {
                                value =  type.getValue(value);
                                if(self.dataValues[name] != value) {
                                    self.dataValues[name] = value;
                                    self.extendUpdate(name);
                                }else {
                                    console.warn('OBSERVER', name, 'not changed');
                                }
                            } else {
                                console.warn('OBSERVER', name, 'not valid');
                            }
                        } else {
                            console.warn('OBSERVER', name, 'observer is frozen');
                        }
                    }
                })
            }
        }
    }

    /**
     * Сброс значения свйоства
     * Если указано имя свойства, то происходит сброс до дефолтного значения этого свойтсва.
     * Если имя не указано, то происходит сброс до дефолтного состояния
     * @param {string} name - Имя поля
     * @return {Observer}
     * */
    reset(name) {
        if(name) {
            if(this.has(name) && !this.isFrozen(name)) {
                var settings = this.fieldSettings.get(name);
                this.data[name] = settings.defaultValue;
            }
        } else {
            var keys = Object.keys(this.data);
            each(keys, (key) => {
                var settings = this.fieldSettings.get(key);
                this.data[key] = settings.defaultValue;
            })
        }
    }

    /**
     * Устанавливает значение поля
     *
     * @param {string} name - имя поля
     * @param {*} value - имя поля
     * @return {Observer} this
     * */
    set(name, value) {
        if(this.has(name) && !isUndefined(value)) {
            this.data[name] = value;
        }
        return this;
    }

    /**
     * Получение значения поля
     * @param {string} name - имя поля
     * @return {*|null} значение поля, если поля нет, то вернется null
     * */
    get(name) {
        if(this.data[name]) {
            return this.data[name];
        }
        return null;
    }

    /**
     * Проверка наличия поля
     * @param {string} name - имя поля
     * @return {boolean}
     * */
    has(name) {
        return this.data.hasOwnProperty(name);
    }
    /**
     * Удаление поля
     * @param {string} name - имя поля
     * @return {Observer} this
     * */
    delete(name) {
        if(this.has(name)) {
            delete this.data[name]; // уаление хэндлера поля
            delete this.dataValues[name]; // удаление значения поля
            this.fieldSettings.delete(name);
            this.dataHandlers.delete(name); // удаление колбеков привязанных к изменению поля
        }
        return this;
    }


    removeUpdate(cb) {

    }

    /**
     * Навешивает обработчик на обновления.
     * Если первым аргументов передается строка, то считаем что навешиваем обработчик на одно свойство,
     * Иначе считаем что обработчик навешивается на любое обновления.
     * @param {string|Observer~updateCallback} name - имя поля или функция обработчик
     * @param {Observer~updateCallback} cb - обработчик изменения поля
     * @return {Observer} this
     * */
    onUpdate(name, cb) {
        if(isFunction(name)) {
            cb = name;
            this.updateCbs.push(cb);
        } else {
            if(!this.dataHandlers.has(name)) {
                this.dataHandlers.set(name, []);
            }
            var cbs = this.dataHandlers.get(name);
            cbs.push(cb);
        }
    }
    /**
     * @callback Observer~updateCallback
     * @param {*} value - значение
     * */

    getValues() {
        return this.data
    }

    /**
     * Рассылка обновлений
     * */
    extendUpdate(name) {
        if(name) {
            if(this.dataHandlers.has(name)) {
                var cbs = this.dataHandlers.get(name);
                /**
                 * @callback Observer~updateCallback
                 * @param {*} value - значение
                 * */
                each(cbs, (cb) => {
                    defer(cb, this.get(name), this.data);
                })
            }
            each()
        }
        each(this.updateCbs, (cb) => {
            defer(cb, this.data);
        })
    }

}