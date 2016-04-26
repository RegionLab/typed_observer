import angular from 'angular';

import Observer from '../src/observer/observer.js';
import String from '../src/types/string.js';
import Int from '../src/types/int.js';
import BaseType from '../src/types/base_type.js';


angular.module('Observer', [])
    .factory('Observer.SimpleType', function() {
        return class extends BaseType {

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

                this.observer.onUpdate('field', (value) => {
                    this.observer.set('field2', value.replace(/\D+/g, ''))
                })

                this.observer.onUpdate(() => {
                    this.notify();
                })

            }

            getObserver() {
                return this.observer;
            }

            setField(value) {
                this.observer.set('field', value);
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
    })
    .service('Observer.Model', ['Observer.SimpleType', function(SimpleType) {
        return function(){
            return new Observer()
                .define('name', String)
                .define('lastName', String)
                .define('age', Int)
                .define('simple', SimpleType);
        }
    }])
    .controller('Observer.Ctrl', ['$scope', 'Observer.Model', function($scope, createModel) {
        $scope.result = '';

        $scope.model = createModel();

        $scope.values = $scope.model.get();

        $scope.simple = $scope.model.get('simple').getObserver().get();

        $scope.model.onUpdate(function() {
            $scope.result = JSON.stringify($scope.model.serialize(), null, '\t');
        });

        $scope.toggleFreeze = function(name, e) {
            if(form.isFrozen(name)) {
                form.defreeze(name);
                e.target.textContent = 'Freeze';
            } else {
                form.freeze(name);
                e.target.textContent = 'Defreeze';
            }
        }

        $scope.$on('$destroy', function() {
            $scope.model.destroy()
        });

    }]);

angular.bootstrap(document.querySelector('body'), ['Observer']);