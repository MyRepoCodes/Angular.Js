angular.module('app.configs', [])

  .constant('CONFIGS', {
    baseURL: function () {
      if (location.host === "*****************************") {
        return "***********************";
      } else if (location.host === "**********************") {
        return "**************************";
      } else if (location.host === "**********************") {
        return "*************************";
      } else if (location.host === "*****************************") { //demo BSS
        return location.protocol + "*****************************";
      } else if (location.host === "**************************") { // dev BSS
        return location.protocol + "********************";
      } else { // For dev Smartdatainc
        return location.protocol + "************************";
      }
    },
    google: {
      apiKey: '************************************',
      clientId: '*****************************************.apps.googleusercontent.com',
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ],
      calendarId: null
    },
    passwordMinLength: 8,
    countPerPage: 25
  });
