import {
    isObject,
    isFunction,
    each
} from 'lodash';

export default class Observer {
    constructor() {
        this.dataValues = {};
        this.data = {};
        this.updateCbs = [];
        this.locks = [];
        this.filterVersion = 0;
    }

    define(name, type, customValidation) {
        if(name && isObject(type)) {

        }
    }

    onUpdate(name, cb) {
        if(isFunction(name)) {
            cb = name;
        }
    }

    extendUpdate(name, cb = false) {
        if(!cb && isFunction(name)) {
            Object.defineProperty(this.data, {
                configurable: true,
            })
        }
    }

}