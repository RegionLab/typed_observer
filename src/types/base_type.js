import 'lodahs';
import Observer from '../observer/observer.js';

/**
 * Класс описывает поведение простого непримитивного типа.
 *
 * */
export default class BaseType {

    /**
     * @constructor
     * @param {string} name - имя поля к которому привязан тип
     * @param {Observer} observer - родительский observer
     * @return {BaseType}
     * */
    constructor(name, observer){
        if(observer instanceof Observer) {
            this._parentObserver = observer;
            this._observerName = name;
        } else {
            throw new Error('argument observer should be Observer');
        }
    }

    /**
     * Оповещение родительского наблюдателя об изменении
     * */
    notify() {
        this._parentObserver.extendUpdate(this._observerName);
        return this;
    }

    /**
     * Имитация поведения примитивного типа
     * @param {*} value
     * @return {boolean} - всегда отдает true;
     * */
    isValid() {
        return true
    }

    /**
     * Имитация поведение примитивного типа
     * @param {*} value
     * @return {BaseType} - всегда отдает самого себя
     * */
    getValue() {
        return this;
    }

    /**
     * Возвращает сериализованное представление объекта
     * */
    getPureValue() {
        console.warn('Переопределите метод');
        return {};
    }
}