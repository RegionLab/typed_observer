import {
    each,
    isArray,
    isUndefined,
    isFunction,
    noop,
    remove
} from 'lodahs';

import BaseType from './base_type.js';

export default class BaseArrayObserver extends BaseType {

    /**
     * @constructor
     * @param {string} name - имя поля к которому привязан тип
     * @param {Observer} parentObserver - родительский observer
     * @return {BaseArrayObserver}
     * */
    constructor(name, parentObserver) {
        super(name, parentObserver);
        /**
         * @type {Array}
         * */
        this._array = [];
        this.updateItemCbs = {};
        this.onArrayUpdate = this.updateArrayHandler.bind(this);
        Array.observe(this._array, this.onArrayUpdate);
    }

    /**
     * @type {number} кол-во элементов в массиве
     * */
    get length() {
        return this._array.length;
    }

    removeOnUpdate(index, cb) {
        if(this.updateItemCbs[index]) {
            remove(this.updateItemCbs[index], (updateCb) => {
                return updateCb === cb;
            })
        }
    }

    updateArrayHandler(events) {

        super.notify();

        _.each(events, (event) => {
            this.notify(event.name);
        });

    }

    get(index) {
        if(this.length > index && this._array[index]) {
            return this._array[index];
        }
        return null;
    }

    notify(index) {
        if(isArray(this.updateItemCbs[index]) && this.updateItemCbs[index].length) {
            each(this.updateItemCbs[index], (cb) => {
                cb(this.get(index));
            })
        }
    }

    /**
     * Навешивает обработчик на изменение
     * @param {number} index - индекс элемента при изменении которого происхойдет
     * */
    onUpdate(index, cb) {
        if(index >= this.length) {
            console.error('Невозможно навесить обработчик на обновление ', index, '-го элемента');
        } else {
            if(!this.updateItemCbs[index]) {
                this.updateItemCbs[index] = [];
            }
            this.updateItemCbs[index].push(cb);
            return this.removeOnUpdate.bind(this, index, cb);
        }
        return noop;
    }




    /**
     * Установка массива
     * Установка массива  происходит без потери ссылки, т.е мы не присваиваем массив, а всегда только заполняем
     * @param {Array} array
     * @return {BaseArrayObserver} this
     * */
    setArray(array) {
        if(isArray(array)) {
            this.clear();
            each(array, (item) => {
                this.push(item);
            })
        }
    }

    push(item) {
        if(!isUndefined(item)) {
            this._array.push(item);
        }
    }

    /**
     * Очистка массива без потери ссылки
     * @return {BaseArrayObserver} this
     * */
    clear() {
        this._array.length = 0;
    }

    destroy() {
        Array.observe(this._array, this.onArrayUpdate);
        this.clear();
    }

}