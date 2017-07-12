angular.module('stickies', [])

.service('$stickies',
    function($rootScope) {

        this.data = {};

        this.get = function(key) {
            return this.data[key];
        };
        this.set = function(key, value, type) {
            this.data[key] = {message: value, type: type};
        };
        this.remove = function(key) {
            $rootScope.$broadcast('stickies:remove', {key: key, data: this.data[key]});
            delete this.data[key];
        };
    }
);

