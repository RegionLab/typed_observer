import Observer from '../../src/observer/observer.js';
import String from '../../src/types/string.js';

describe("Проверка базовой функциональности типа STRING", function() {

    var observer = null;
    var propertyName = 'stringProperty',
        defaultValue = 'test';
    beforeEach(function() {
        observer = new Observer();
        observer.define(propertyName, String);
    });

    it('Должен принимать STRING значения', function() {
        observer.set(propertyName, defaultValue);
        expect(observer.get(propertyName)).to.equal(defaultValue);
    });

    it('Должен принимать любые строки', function() {
        observer.set(propertyName, '12');
        expect(observer.get(propertyName)).to.equal('12');
    });

    it('НЕ должен принимать данные которые могут неявно перобразовываться в STRING', function() {
        observer.set(propertyName, new Date());
        expect(observer.get(propertyName)).to.be.null;
    });


});