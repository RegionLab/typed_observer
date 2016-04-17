# typed_observer

```javasciprt

import {Observer, Int, String} from 'typed_observer';

// Описание простого типа, Соглано ему поле сможет принять значения строго равные true или false
var Bool = {
    isValid(value) {
        return value === true || value === false;
    },
    
    getValue(value) {
        return value;
    },
    
    getPureValue(value) {
        return value;
    }
}

// Описание простого типа, согласно ему поле будет сможет принимать значения указанные в массиве
function oneOf(arr) {
    return {
        isValid(value) {
            return arr.indexOf(value) >= 0
        },
        
        getValue(value) {
            return value;
        },
        
        getPureValue(value) {
            return value;
        }
    }
} 

/*********************************************************/
        Описание  поле 
/*********************************************************/
var observer = new Observer();

observer.define('firstName', String, {required: true});
observer.define('age', Input);
observer.define('married', Bool);
observer.define('gender', oneOf([0,1])); // 0 - male, 1 - female

/*********************************************************/

// Колбек на изменение любого поля
observer.onUpdate((dataHandler) => {
    console.log(data);
});

// Колбек на изменение поля firstName
observer.onUpdate('firstName', (value, dataHandler) => {
    console.log('firstName =', value);
});


observer.set('firstName', 'Josh') // Установка значения
        .freeze('firstName'); // заморозка поля(поле не сможет принимать значения)
        
observer.set('firstName', 'Mark');
observer.get('firstName'); // 'Josh'

observer.defreeze('firstName'); // размарозка поля

observer.set('firstName', 'Mark');
observer.get('firstName'); // 'Mark'

observer.lock('age'); // Блокировка вызова колбека

// Вызываться не будет, потому что вызов заблокирован ранее
observer.onUpdate('age', (value, dataHandler) => {
    console.log('firstName =', value);
});

var data = observer.get();

data.firstName = 'Josh';
observer.get('firstName') // Josh

```