import {isString} from 'lodash';
/**
 * @namespace Observer types.string
 * */

export default {
    isValid(value) {
        return isString(value);
    },
    getValue(value) {
        return value+"";
    },
    getPureValue(value) {
        return value+"";
    }
}