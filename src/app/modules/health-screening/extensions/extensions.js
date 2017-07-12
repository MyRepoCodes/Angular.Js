angular.module('app.modules.health-screening.extensions', [
  'google.places',
  'app.configs',
  'app.modules.health-screening.extensions.gapi'
])

.config(function (GAuthorizeProvider, CONFIGS) {
  // Init Google Calender
  GAuthorizeProvider.configure({
    apiKey: CONFIGS.google.apiKey,
    clientId: CONFIGS.google.clientId,
    scopes: CONFIGS.google.scopes
  });

  // Load Google Map API
  var head = document.getElementsByTagName('head')[0];
  var js = document.createElement('script');
  js.src = 'https://maps.googleapis.com/maps/api/js?key=' + CONFIGS.google.apiKey + '&libraries=places';
  head.appendChild(js);
});

