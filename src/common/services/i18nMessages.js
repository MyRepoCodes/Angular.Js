angular.module('services.i18nMessages', [])

// List of notification messages
.constant('i18nMessages', {

    // General
    'errors.route.changeError': "Something went wrong when changing route.",

    // Default CRUD-message used by the apiService
    'crud.default.error': "Unable to load {{resource}}.",

    // Login related
    'login.reason.notAuthorized': "You do not have enough permissions to do this. Please contact your administrator.",
    'login.reason.sessionExpired': "Your session has expired. Please login again.",
    'login.reason.userExpired': "You are not assigned to a company, please contact your company administrator.",
    'login.reason.notAuthenticated': "Session expired. Please login to access your account.",
    'login.error.invalidCredentials': "The username and password combination are incorrect.",
    'login.error.serverError': "There was a problem with authenticating: {{exception}}.",

    // register user
    'crud.register.error': "Username or Email is already exists",
    'crud.users.notfound': "Your entry did not return a match in our system. Please try again.",
    'crud.users.notupdate': "User cannot update in this time",
    'crud.users.username.already': "You have already created an account. Please login with your username and password.",

    // Security
    'security.reason.email': "Your entry did not return a match in our system. Please try again.",
    'security.reason.username': "Your entry did not return a match in our system. Please try again.",
    'security.reason.question': "Answer is incorrect",

    // server error
    'crud.server.error': '500 - Internal Server Error'
});