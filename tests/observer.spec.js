import Observer from '../src/observer/observer.js';
import Any from '../src/types/any.js';

describe("Проверка базовой функциональности наблюдателя", function() {

    var observer = null;
    before(function() {
        observer = new Observer();
    });

    it('Должен создать свойство', function() {
        observer.define('name');
        expect(observer.has('name')).to.be.true;
    });

    it('Должен сохранять значения свойства', function() {
        observer.set('name', 'value');
        expect(observer.get('name')).to.equal('value');
    });

    it('Должен заморживать свойство', function() {
        observer.freeze('name');
        observer.set('name', 'value1');
        expect(observer.get('name')).to.equal('value');
    });

    it('Должен размораживать свойство', function() {
        observer.freeze('name');
        observer.set('name', 'value1');
        expect(observer.get('name')).to.equal('value');
        observer.defreeze('name');
        observer.set('name', 'value1');
        expect(observer.get('name')).to.equal('value1');
    });

    it('Должен сбрасывать значение', function() {
        observer.define('resetName', Any, 13);
        observer.set('resetName', 'resetValue');
        expect(observer.get('resetName')).to.equal('resetValue');
        observer.reset();
        expect(observer.get('resetName')).to.equal(13);
    });

});