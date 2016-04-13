import {
    isObject,
    isFunction,
    isUndefined,
    each
} from 'lodash';

export default class Observer {
    constructor() {
        this.dataValues = {};
        this.data = {};
        this.updateCbs = [];
        this.locks = [];
        this.filterVersion = 0;
        this.defaultValues = {};
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
     * @param {string|function} name - имя поля или функция обработчик
     * @param {function} cb - обработчик изменения поля
     * @return {Observer} this
     * */
    onUpdate(name, cb) {
        if(isFunction(name)) {
            cb = name;
        } else {
            if(!this.dataHandlers.has(name)) {
                this.dataHandlers.set(name, []);
            }
            var cbs = this.dataHandlers.get(name);
        }
    }

    extendUpdate(name, cb = false) {
        if(!cb && isFunction(name)) {

        }
    }

}