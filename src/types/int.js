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