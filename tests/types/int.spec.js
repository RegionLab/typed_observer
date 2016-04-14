import Observer from '../../src/observer/observer.js';
import Int from '../../src/types/int.js';

describe("Проверка базовой функциональности типа Int", function() {

    var observer = null;
    before(function() {
        observer = new Observer();
        observer.define('intProperty', Int);
    });

    beforeEach(function() {
        observer.set('intProperty', 12);
    });

    it('Должен принимать только INT значения', function() {
        expect(observer.get('intProperty')).to.equal(12);
    });

    it('НЕ должен принимать строки', function() {
        observer.set('intProperty', 'qwe');
        expect(observer.get('intProperty')).to.equal(12);
    });

    it('Должен принимать строковое представления числа', function() {
        observer.set('intProperty', '13');
        expect(observer.get('intProperty')).to.equal(13);
    });

    it('НЕ должен принимать данные которые могут неявно перобразовываться в INT', function() {
        observer.set('intProperty', new Date());
        expect(observer.get('intProperty')).to.equal(12);
    });


});