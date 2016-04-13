import {
    isObject,
    isFunction,
    isUndefined,
    each,
    defer,
} from 'lodash';

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
        /**
         * @desc список блокировок обновлений, блокировка ставится только на общие обновления
         * @type {Array}
         * */
        this.locks = [];
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
    }

    /**
     * @param {string} name - имя поля
     * @param {object} type - описание типа поля
     * @param {*} defaultValue - дефолтное значение для поля
     * */
    define(name, type, defaultValue) {
        if(name && isObject(type)) {
            if(!isUndefined(defaultValue)) {
                this.defaultValues[name] = isFunction(defaultValue) ? defaultValue : type.getPureValue(defaultValue);
            }
            Object.defineProperty(this.data, {
                configurable: true,
                enumerable: true,
                get() {
                    return this.dataValues[name];
                },
                set(value) {
                    if(type.isValid(value)) {
                        value =  type.getValue(value);
                        if(this.dataValues[name] != value) {
                            this.dataValues[name] = value
                        }
                    }
                }
            })
        }
    }

    /**
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
        return !isUndefined(this.data[name]);
    }
    /**
     * Удаление поля
     * @param {string} name - имя поля
     * @return {Observer} this
     * */
    delete(name) {
        if(this.has(name)) {
            delete this.data[name];
            delete this.dataValues[name];
            delete this.defaultValues[name];
            this.dataHandlers.delete(name);
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