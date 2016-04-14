import {isString, isNaN, isObject} from 'lodash';
/**
 * @namespace Observer types.string
 * */

export default {
    isValid(value) {
        return isString(value)
            && isNaN(+value)
            && !isObject(value);
    },
    getValue(value) {
        return value;
    },
    getPureValue(value) {
        return value;
    }
}