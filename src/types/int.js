/**
 * @namespace Observer types.int
 * */

/**
 *
 * Тип поля обсервера.
 * Считается валидным если  при приведении начения к числу результат приведения не NaN
 * "Чистым" значением являетяс значение приведенное к числу
 * */
export default {
    isValid(value) {
        return !isNaN(+value)
    },
    getValue(value) {
        return +value;
    },
    getPureValue(value) {
        return +value;
    }
}