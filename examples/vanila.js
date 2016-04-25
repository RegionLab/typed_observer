import Observer from '../src/observer/observer.js';
import String from '../src/types/string.js';
import Int from '../src/types/int.js';
import BaseType from '../src/types/base_type.js';

var name = document.querySelector('#name'),
    lastName = document.querySelector('#lastName'),
    simpleField = document.querySelector('#simple_field'),
    simpleField2 = document.querySelector('#simple_field2'),
    lastName = document.querySelector('#lastName'),
    age = document.querySelector('#age'),
    result = document.querySelector('#result');

class SimpleType extends BaseType {

    constructor(name, observer) {
        super(name, observer);

        this.observer = new Observer()
            .define('field', {
                isValid: String.isValid,
                getValue: String.getValue,
                getPureValue(value) {
                    return (value || "").replace(/ /g,"")
                }
            }, {defaultValue: ' trim  ', required: true})
            .define('field2', Int);

        this.observer.onUpdate(() => {
            this.notify();
        })

    }

    getObserver() {
        return this.observer;
    }

    setField(value) {
        this.observer.set('field', value);
        this.observer.set('field2', value.replace(/\D+/g, ''))
    }

    getField(value) {
        return this.observer.get('field') || '';
    }

    setField2(value) {
        return this.observer.set('field2', value);
    }

    getField2(value) {
        return this.observer.get('field2') || '';
    }

    getPureValue() {
        return this.observer.serialize();
    }
}

var form = new Observer();
    form
        .define('name', String)
        .define('lastName', String)
        .define('age', Int)
        .define('simple', SimpleType);

form
    .onUpdate(function(e) {
       console.log('new form values', e);
        requestAnimationFrame(function() {
            result.innerHTML = JSON.stringify(form.serialize(), null, '\t');
        });
    })
    .onUpdate('name', function(e) {
        console.log('new value name', e);
    })
    .onUpdate('lastName', function(e) {
        console.log('new value lastName', e);
    })
    .onUpdate('age', function(e) {
        console.log('new value age', e);
    });

form.get('simple').getObserver().onUpdate('field', () => {
    simpleField.value = form.get('simple').getField();
}).onUpdate('field2', () => {
    simpleField2.value = form.get('simple').getField2();
})

function setValue(name, e) {
    form.set(name, e.target.value);
    var value = form.get(name) ;
    e.target.value = value != undefined ? value : '';
}

function toggleFreeze(name, e) {
    if(form.isFrozen(name)) {
        form.defreeze(name);
        e.target.textContent = 'Freeze';
    } else {
        form.freeze(name);
        e.target.textContent = 'Defreeze';
    }
}

name.addEventListener('input', setValue.bind(null, 'name'));

lastName.addEventListener('input', setValue.bind(null, 'lastName'));

age.addEventListener('input', setValue.bind(null, 'age'));

simpleField.addEventListener('input', function(e) {
    form.get('simple').setField(e.target.value);
    e.preventEvent();
});

simpleField2.addEventListener('input', function(e) {
    form.get('simple').setField2(e.target.value);
    e.preventEvent();
});

document.querySelector('#freezeName').onclick = toggleFreeze.bind(null, 'name');

document.querySelector('#freezeLastName').onclick = toggleFreeze.bind(null, 'lastName');

document.querySelector('#freezeAge').onclick = toggleFreeze.bind(null, 'age');