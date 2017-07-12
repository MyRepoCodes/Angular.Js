angular.module('security', [
    'services.localizedMessages',
    'security.service',
    'security.interceptor',
    'security.authorization',
    'security.username',
    'security.find-account',
    'security.login',
    'security.forgot-username',
    'security.forgot-password',
     'security.question'
]);