import Observer from '../src/observer/observer.js';
import Any from '../src/types/any.js';
import spyon from 'chai-spies';
import {defer} from 'lodash';

chai.use(spyon);

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
        observer.define('resetName', Any, {
            defaultValue: 13
        });
        observer.set('resetName', 'resetValue');
        expect(observer.get('resetName')).to.equal('resetValue');
        observer.reset();
        expect(observer.get('resetName')).to.equal(13);
    });

    it('При обновлении значения должно происходить вызов функции', function(done) {
        var fakeUpdateCb = chai.spy(function(values) {
            console.log('update observer', values)
        });
        var fakeFieldUpdateCb = chai.spy(function(value, values) {
            console.log('update field name', value);
        });

        observer.onUpdate(fakeUpdateCb);
        observer.onUpdate('name', fakeFieldUpdateCb);

        observer.set('name', 2);

        defer(function() {
            fakeUpdateCb.should.have.been.called();
            fakeFieldUpdateCb.should.have.been.called();
            // Если значение фильтра не изменилось, то оповещение происходить не должно
            observer.set('int', 2);

            defer(function() {
                fakeUpdateCb.should.have.been.called.exactly(1);
                fakeFieldUpdateCb.should.have.been.called.exactly(1);
                done()
            })
        })
    });

    it('При блокировке обновлений свойства, не должно распространяться ', function() {

    });

});