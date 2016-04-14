import {
    isArray,
    isObject,
    isFunction,
    isUndefined,
    each,
    defer,
    remove,
    noop
} from 'lodash';

import AnyType from '../types/any.js';

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
    isFrozen(name) {
        if(name) {
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
    freeze(name) {
        if(name) {
            if(this.has(name) && !this.isFrozen(name)) {
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
    setDefaultValue(name, value) {
        if(name && this.has(name)) {
            var settings = this.getFieldSettings(name);
            if(settings.type.isValid(value)) {
                settings.defaultValue = value;
            } else {
                console.error('Observer', name, 'Значение не валидно');
            }
        }
    }

    /**
     * Разморозка поля
     * @param {string} [name] - имя свойства
     * @return {Observer} this
     * */
    defreeze(name) {
        if(name) {
            if(this.has(name) && this.isFrozen(name)) {
                var settings = this.getFieldSettings(name);
                settings.frozen = false;
            }
        } else {
            this._frozen = false;
        }

        return this;
    }

    /**
     * Проверка валидности данных исходя из правил валидации.
     * Если значение поля не валидно, то если поле является обязательным данные считаются невалидными.
     * @return {boolean}
     * */
    isValid() {
        for(var i in this.data) {
            if(this.has(i)) {
                var settings = this.getFieldSettings(i);
                var value = this.get(i);
                if(!settings.type.isValid(value) && settings.required) {
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
    serialize() {
        var ret = {};
        for(var i in this.data) {
            if(this.has(i)) {
                var settings = this.getFieldSettings(i);
                var value = this.get(i);
                if(!settings.type.isValid(value) && settings.required) {
                    return {};
                }
                ret[i] = settings.type.getPureValue(value);
            }
        }
    }

    /**
     * @param {string} name - имя поля
     * @param {object} type - описание типа поля
     * @param {Observer~FieldSettings} [settings] - дефолтное значение для поля(Если функция, то она будет вызываться для получения значения)
     * */
    define(name, type, settings) {
        if(!this.fieldSettings.has(name)) {
            type = type || AnyType;
            if(name && isObject(type)) {

                // Инициализируем настройки
                var settings = settings || {};
                if(settings.type) {
                    type = settings.type;
                } else {
                    settings.type = type;
                }

                this.dataValues[name] = isFunction(settings.defaultValue) ? settings.defaultValue() : settings.defaultValue;

                this.fieldSettings.set(name, settings);


                var self = this;
                Object.defineProperty(this.data, name, {
                    configurable: true,
                    enumerable: true,
                    get: function () {
                        return self.dataValues[name];
                    },
                    set: function(value) {
                        if(!self._frozen && !self.isFrozen(name)) {
                            if(type.isValid(value)) {
                                value =  type.getValue(value);
                                if(self.dataValues[name] != value) {
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
                })

            }
        }
    }

    /**
     * Сброс значения свйоства
     * Если указано имя свойства, то происходит сброс до дефолтного значения этого свойтсва.
     * Если имя не указано, то происходит сброс до дефолтного состояния
     * @param {string} [name] - Имя поля
     * @return {Observer}
     * */
    reset(name) {
        if(name) {
            if(this.has(name) && !this.isFrozen(name)) {
                var settings = this.getFieldSettings(name);
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
        if(this.has(name)) {
            this.data[name] = value;
        }
        return this;
    }

    /**
     * Получение значения поля
     * @param {string} [name] - имя поля
     * @return {*|null} значение поля, если поля нет, то вернется null
     * */
    get(name) {
        if(name) {
            if(this.data[name]) {
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
    has(name) {
        return this.data.hasOwnProperty(name);
    }
    /**
     * Удаление поля
     * @param {string} name - имя поля
     * @return {Observer} this
     * */
    delete(name) {
        if(name && this.has(name)) {
            delete this.data[name]; // уаление хэндлера поля
            delete this.dataValues[name]; // удаление значения поля
            this.fieldSettings.delete(name);
        }
        return this;
    }


    removeUpdate(name, cb) {
        if(isFunction(name)) {
            remove(this.updateCbs, (updateCb) => {
                return updateCb === cb;
            })
        } else {
            if(this.has(name)) {
                var settings = this.getFieldSettings(name);
                if(isArray(settings.cbs) && settings.cbs.length) {
                    remove(settings.cbs, (updateCb) => {
                        return updateCb === cb;
                    })
                }

            }
        }
    }

    /**
     * Навешивает обработчик на обновления.
     * Если первым аргументов передается строка, то считаем что навешиваем обработчик на одно свойство,
     * Иначе считаем что обработчик навешивается на любое обновления.
     * @param {string|Observer~updateCallback} name - имя поля или функция обработчик
     * @param {Observer~updateCallback|Observer~updateItemCallback} [cb] - обработчик изменения поля
     * @return {Observer} this
     * */
    onUpdate(name, cb) {
        if(isFunction(name)) {
            cb = name;
            this.updateCbs.push(cb);
            return this.removeUpdate.bind(this, cb)
        } else {
            if(this.has(name)) {
                var settings  = this.getFieldSettings(name);
                if(!settings.cbs) {
                    settings.cbs = [];
                }
                settings.cbs.push(cb);
                return this.removeUpdate.bind(this, name, cb)
            }
        }
        return noop;
    }

    /**
     * Получение настроек свойства
     * @param {string} name - имя свойства
     * @return {Observer~FieldSettings|null} - настройки поля
     * */
    getFieldSettings(name) {
        if(name) {
            return this.fieldSettings.get(name);
        }
        return null;
    }

    /**
     * Запрет на распространение обновлений
     * @param {string} [name] - имя поля
     * @return {Observer} this
     * */
    lockUpdate(name) {
        if(name) {
            if(this.has(name)) {
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
     * @param {string} [name] - имя поля
     * @return {Observer} this
     * */
    unlockUpdate(name) {
        if(name) {
            if(this.has(name)) {
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
     * @param {string} [name] - имя свойства
     * @return {boolean}
     * */
    isLockUpdate(name) {
        if(name) {
            var settings = this.getFieldSettings(name);
            return Boolean(settings.lockUpdate);
        }
        return Boolean(this._lock);
    }

    /**
     * Рассылка обновлений
     * @param {string} [name] - имя измененного свойства
     * @return {Observer} this
     * */
    extendUpdate(name) {
        var lock = this.isLockUpdate(name);
        if(!lock) {
            if(name) {
                var settings = this.getFieldSettings(name);
                if(isArray(settings.cbs) && settings.cbs.length) {
                    var cbs = settings.cbs;

                    each(cbs, (cb) => {
                        defer(cb, this.get(name), this.data);
                    })
                }
                each()
            }
            each(this.updateCbs, (cb) => {
                defer(cb, this.data);
            });
        } else {
            console.warn('OBSERVER IS LOCK');
        }

        return this;
    }

    destroy() {
        for(var name in this.data) {
            this.delete(name);
        }
        this.updateCbs.length = 0;
        this.filterVersion = 0;
    }

}