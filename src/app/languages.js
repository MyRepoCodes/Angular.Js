angular.module('languages', [
    'pascalprecht.translate',
    'localization'
])

.config(function($translateProvider, $localizationProvider) {
    var languages = $localizationProvider.$get();
    for(var lang in languages) {
        $translateProvider.translations(lang, languages[lang]);
    }

    $translateProvider.preferredLanguage('en_US');
})

.controller('LanguagesController', function($scope, $translate) {
    $scope.changeLanguage = function(key) {
        $translate.use(key);
    };
});
