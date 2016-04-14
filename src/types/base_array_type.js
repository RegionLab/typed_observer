import {
    each,
    isArray,
    isUndefined,
    isFunction,
    noop
} from 'lodahs';
import BaseType from './base_type.js';

export default class BaseArrayObserver extends BaseType {

    /**
     * @constructor
     * @param {string} name - имя поля к которому привязан тип
     * @param {Observer} observer - родительский observer
     * @return {BaseType}
     * */
    constructor(name, parentObserver) {
        super(name, parentObserver);
        /**
         * @type {Array}
         * */
        this._array = [];
        this.updateItemCbs = {};
    }

    /**
     * @type {number} кол-во элементов в массиве
     * */
    get length() {
        return this._array.length;
    }

    removeOnUpdate(index, cb) {
        if(this.updateItemCbs) {

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
        this.clear();
        Array.unobserve(this._array, this.bindedObserver);
    }

}