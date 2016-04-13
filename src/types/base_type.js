import 'lodahs';

export default class BaseType {
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
        return value;
    }
}