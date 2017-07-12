angular.module('security.service', [
  'security.retryQueue',
  'security.login',
  'services.api',
  'ngCookies'
])

  .factory('security', function ($rootScope, $cookieStore, $localStorage, $state, $stateParams, $q, $location, $translate, LABVALUES, users, securityRetryQueue, apiService, localizedMessages, employers, participants, documents, utils, spouses, dependents, contacts) {

    // Redirect to the given url (defaults to '/')
    function redirect(url) {
      url = url || '/';
      $location.path(url);
    }

    //function get info login
    function getInfoLogin(deferred, res) {

      if (res.data.data.roles[0] === "Participant" || res.data.data.roles[0] === "Spouse") {

        var embed = 'employer';
        if (res.data.data.roles[0] === "Spouse") {
          embed = 'participant,participant.employer';
        }


        apiService.get('users/auth?loadingSpinnerNotShowing&ver=' + Math.random(), { embed: embed })
          .then(function (res) {
            res = res.data.data;

            //overwrite data for Spouse
            if (res.roles[0] === "Spouse") {
              res['employer'] = res.participant.employer;
            }
            service.currentUser = res;


            // Get avatar
            if (!service.isEmployer()) {
              service.getAvatar();
            }

            // Get Brand
            service.getBrand();

            // get all Notification
            if (service.isAdmin() || service.isClientManager()) {
              service.getAllNotification();
            }

            // Get Notification
            if (!service.isClinicalDirector() && !service.isAgentTheAgent()) {
              documents.getNotifications("", false).then(function (notifications) {
                service.notifications = notifications;

                // Get Health Result if Participant
                service.getHealthResult("", false).then(function () {
                  deferred.resolve(service.currentUser);
                });
              }, function () {
                // Get Health Result if Participant
                service.getHealthResult("", false).then(function () {
                  deferred.resolve(service.currentUser);
                });
              });
            } else {
              deferred.resolve(service.currentUser);
            }
          }, function (error) {
            service.currentUser = undefined;
            error.data.status = error.status;

          });
      }
      else {
        res = res.data.data;
        service.currentUser = res;

        // Get avatar
        if (!service.isEmployer()) {
          service.getAvatar();
        }

        // Get Brand
        service.getBrand();

        // get all Notification
        if (service.isAdmin() || service.isClientManager()) {
          service.getAllNotification();
        }

        if (!service.isClinicalDirector() && !service.isAgentTheAgent()) {

          // Get Notification
          documents.getNotifications("", false).then(function (notifications) {
            service.notifications = notifications;

            // Get Health Result if Participant
            service.getHealthResult("", false).then(function () {
              deferred.resolve(service.currentUser);
            });
          }, function () {
            // Get Health Result if Participant
            service.getHealthResult("", false).then(function () {
              deferred.resolve(service.currentUser);
            });
          });

        } else {

          //get count contact
          contacts.countunread("", "", false).then(function (contact) {
            service.countContactUnread = contact;
          }, function () {
            service.countContactUnread = 0;
          });

          deferred.resolve(service.currentUser);
        }
      }
    }

    // function reset all
    function resetAll() {

      // Remove authToken and currentUser cookie
      $cookieStore.remove('authToken');
      $localStorage.$reset();

      // Reset current user object
      service.currentUser = null;

      // Reset avatar
      service.setAvatarDefault();

      // Reset other
      service.currentClient = null;
      service.clientUrl = null;
      service.brand = null;

      service.benefitYearBcaList = null;
      service.currentBenefitYearBca = null;

      service.benefitYearBcsList = null;
      service.currentBenefitYearBcs = null;

      // Set the Request Header 'Authorization'
      apiService.setAuthTokenHeader(null);
    }

    // Register handler for when an item is added to the retry queue
    securityRetryQueue.onItemAddedCallbacks.push(function (retryItem) {
      if (securityRetryQueue.hasMore()) {
        // Fix authorization for first access
        resetAll();
        if ($stateParams.clientUrl) {
          redirect('/' + $stateParams.clientUrl);
        } else {
          //redirect('/login');
          $state.go('loginForm', {}, { reload: true });
        }
      }
    });

    // The public API of the service
    var service = {

      // Holds the object of the current logged in user
      currentUser: undefined,

      // Info find account
      currentAccount: undefined,

      // Avatar (base64)
      avatar: 'assets/images/default-profile.png',

      // Brand
      brand: undefined,

      // clientUrl
      clientUrl: undefined,

      // currentClient
      currentClient: undefined,

      // Reward for participant
      rewardInfo: {},

      // Get the first reason for needing a login
      getLoginReason: function () {
        return securityRetryQueue.retryReason();
      },

      // Give up trying to login and clear the retry queue
      cancelLogin: function () {
        redirect();
      },

      validateQuestion: function (token, answer, questionId, bool) {
        var deferred = $q.defer();

        // Set the Request Header 'Authorization'
        apiService.setAuthTokenHeader(token);
        var request = apiService.post('users/ValidateSecurityQuestion', { 'questionId': questionId, 'answertext': answer, 'isEncrypted': bool });
        request.then(function (res) {
          deferred.resolve(res);
        }, function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },

      allQuestions: function () {
        var deferred = $q.defer();
        var authToken = $cookieStore.get('authToken');
        // Set the Request Header 'Authorization'
        apiService.setAuthTokenHeader(authToken);

        apiService.get('questions').then(function (res) {
          deferred.resolve(res);
        }, function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      },

      // Attempt to authenticate a user by the given username and password
      login: function (username, password) {

        //resetAll();

        var deferred = $q.defer();

        var dataRequest = "grant_type=password&username=" + username + "&password=" + password;
        // Make request to API
        var request = apiService.post('token?loadingSpinnerNotShowing&ver=' + Math.random(), dataRequest);

        // When server response is received...
        request.then(function (res) {
          res = res.data;
          var authToken = res.access_token;

          // Set the authentication token in a cookie
          $cookieStore.put('authToken', authToken);

          $localStorage['refreshToken'] = {
            'issued': res['.issued'],
            'expires_in': res['expires_in'],
            'refresh_token': res['refresh_token']
          };

          // Set the Request Header 'Authorization'
          apiService.setAuthTokenHeader(authToken);

          //Get currentUser
          apiService.get('users/auth?loadingSpinnerNotShowing&ver=' + Math.random()).then(function (res) {
            getInfoLogin(deferred, res);
          }, function (error) {
            service.currentUser = undefined;
            error.data.status = error.status;

          });
        }, function (err) {
          deferred.reject({
            success: err.data.success,
            error: err.data.error,
            error_description: err.data.error_description,
            fullError: err.data,
            status: err.status
          });
        });

        return deferred.promise;
      },

      refreshToken: function (refresh_token) {
        //resetAll();

        var deferred = $q.defer();

        var dataRequest = "grant_type=refresh_token&refresh_token=" + refresh_token;
        // Make request to API
        var request = apiService.post('token', dataRequest);

        // When server response is received...
        request.then(function (res) {
          res = res.data;

          var authToken = res.access_token;

          // Set the authentication token in a cookie
          $cookieStore.put('authToken', authToken);

          $localStorage['refreshToken'] = {
            'issued': res['.issued'],
            'expires_in': res['expires_in'],
            'refresh_token': res['refresh_token']
          };

          // Set the Request Header 'Authorization'
          apiService.setAuthTokenHeader(authToken);

        }, function (err) {
          deferred.reject({
            success: err.data.success,
            error: err.data.error,
            error_description: err.data.error_description,
            status: err.status
          });
        });

        return deferred.promise;
      },

      // Get Current Employer
      findEmployerByUrl: function (clientUrl) {
        var deferred = $q.defer();

        if (!service.currentClient) {
          employers.findByUrl(clientUrl).then(function (response) {
            service.currentClient = response;
            deferred.resolve(service.currentClient);
          }, function () {
            service.currentClient = undefined;
            deferred.resolve(service.currentClient);
          });
        } else {
          deferred.resolve(service.currentClient);
        }

        return deferred.promise;
      },

      /**
       * Find Account Form
       * @param params {lastName, dateOfBirth, ssn}
       * @returns {*}
       */
      findAccount: function (params) {
        var deferred = $q.defer();

        // Make request to API
        apiService.get('users/findAccount', params).then(function (res) {
          res = res.data.data;
          service.currentAccount = res;

          deferred.resolve(service.currentAccount);
        }, function (error) {
          service.currentAccount = undefined;

          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      findAccountByUsernameAndSSN: function (params) {
        var deferred = $q.defer();

        // Make request to API
        apiService.get('users/findAccountByUsernameAndSSN', params).then(function (res) {
          res = res.data.data;
          service.currentAccount = res;

          deferred.resolve(service.currentAccount);
        }, function (error) {
          service.currentAccount = undefined;

          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },
      // Username
      createUserById: function (id, params) {
        var deferred = $q.defer();

        // Make request to API
        apiService.post('users', id, params, {}).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      changePassword: function (dataChangePassword) {
        var deferred = $q.defer();

        apiService.post('user/me/changepassword', dataChangePassword).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      changePasswordMe: function (dataChangePassword, headers) {
        var deferred = $q.defer();

        apiService.put('users/me/changesecurity', dataChangePassword, undefined, undefined, headers).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      forgetUsername: function (email) {
        var deferred = $q.defer();

        apiService.post('users/forgetUsername', { email: email }).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      forgetPasswordWithEmail: function (username) {
        var deferred = $q.defer();

        apiService.post('users/ForgetPasswordWithEmail', { username: username }).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      forgetPassword: function (username) {
        var deferred = $q.defer();

        apiService.post('users/forgetPassword', { username: username }).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      forgetPasswordWidthQuestion: function (username, question, answer) {
        var deferred = $q.defer();

        apiService.post('users/forgetPasswordWithQuestion', {
          username: username,
          questionId: question,
          answer: answer
        }).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      // Set default avatar
      setAvatarDefault: function () {
        service.avatar = 'assets/images/default-profile.png';
        $rootScope.$broadcast('security:avatar:update', service.avatar);
      },

      // Get avatar for current user
      getAvatar: function () {
        var deferred = $q.defer();
        apiService.get('users/me/avatar?loadingSpinnerNotShowing&api_key=' + encodeURIComponent(apiService.authToken)).then(function (response) {
          service.avatar = apiService.getUrl('users/me/avatar');
          $rootScope.$broadcast('security:avatar:update', service.avatar);

          deferred.resolve(service.avatar);
        }, function (error) {
          service.setAvatarDefault();

          deferred.resolve(service.avatar);
        });

        return deferred.promise;
      },

      // Get avatar for current user
      getAvatarForUser: function (id) {
        var deferred = $q.defer();
        apiService.get('users/' + id + '/avatar?loadingSpinnerNotShowing&api_key=' + encodeURIComponent(apiService.authToken)).then(function (response) {
          deferred.resolve(apiService.getUrl('users/' + id + '/avatar'));
        }, function (error) {
          deferred.resolve(false);
        });

        return deferred.promise;
      },

      // Get brand
      getBrand: function () {
        if (service.isParticipant()) {
          if (service.currentUser.employer && typeof service.currentUser.employer.clientLogos !== "undefined" && service.currentUser.employer.clientLogos.length > 0) {
            employers.getLogoUrlById(service.currentUser.employer.clientLogos[0], false).then(function (response) {
              service.brand = response;
              $rootScope.$broadcast('security:brand:updated', service.brand);
            });
          }
        } else if (service.isEmployer()) {
          if (service.currentUser.clientLogos.length > 0) {
            employers.getLogoUrlById(service.currentUser.clientLogos[0], false).then(function (response) {
              service.brand = response;
              $rootScope.$broadcast('security:brand:updated', service.brand);
            });
          }
        }
      },

      getBrandByClientUrl: function (clientUrl) {
        var deferred = $q.defer();

        if (!service.brand && clientUrl !== service.clientUrl) {
          employers.getLogoByUrl(clientUrl, false).then(function (response) {
            service.brand = response;
            service.clientUrl = clientUrl;

            $rootScope.$broadcast('security:brand:updated', response);
            deferred.resolve(response);
          }, function () {
            $rootScope.$broadcast('security:brand:updated', false);
            deferred.resolve(false);
          });
        } else {
          $rootScope.$broadcast('security:brand:updated', service.brand);
          deferred.resolve(service.brand);
        }

        return deferred.promise;
      },

      // Upload avatar for current user
      uploadAvatar: function (formData) {
        var deferred = $q.defer();

        apiService.upload('users/me/avatar', formData).then(function (response) {
          response = response.data.data;

          $rootScope.$broadcast('security:avatar:upload', response);
          service.getAvatar().then(function (rs) {
            deferred.resolve(rs);
          });


        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      uploadAvatarForUser: function (id, formData) {
        var deferred = $q.defer();

        apiService.upload('users/' + id + '/avatar', formData).then(function (response) {
          deferred.resolve(service.getAvatarForUser(id));
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      uploadPhoto: function (file) {
        var deferred = $q.defer();
        var formData = new FormData();
        formData.append('file', file);

        apiService.upload('users/photo', formData).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      patch: function (params) {
        var deferred = $q.defer();

        apiService.put('users/' + service.currentUser.id, params).then(function (response) {
          response = response.data.data;
          deferred.resolve(response);
        }, function (error) {
          error.data.status = error.status;
          deferred.reject(error.data);
        });

        return deferred.promise;
      },

      // Calculator reward
      getRewardInfo: function (healthResult) {
        var employer = service.currentUser.employer;

        var tableList = [];
        var totalReward = 0, totalReal = 0, totalPassed = 0, passed = false,
          reward, rewardEmployer, goal, result;
        var bodyMassIndex = false,
          bloodSugar = false,
          nicotinUse = false,
          healthCoaching = false,
          bloodPressure = false,
          ldlCholesterol = false,
          participation = false;

        // Check singleIncentive
        if (employer && employer.singleIncentive !== null) {
          bodyMassIndex = (employer.singleIncentive & 1) === 1;
          bloodSugar = (employer.singleIncentive & 2) === 2;
          nicotinUse = (employer.singleIncentive & 4) === 4;
          healthCoaching = (employer.singleIncentive & 8) === 8;
          bloodPressure = (employer.singleIncentive & 16) === 16;
          ldlCholesterol = (employer.singleIncentive & 32) === 32;
          participation = (employer.singleIncentive & 64) === 64;
        }

        // Check passed
        function isPassed(goal, result) {
          var s, g, r;

          if (typeof goal === 'undefined') {
            goal = '';
          }
          if (typeof result === 'undefined') {
            result = '';
          }

          // Check Boolean
          if ((goal.toLowerCase() === 'no' || goal.toLowerCase() === 'yes') && goal.toLowerCase() === result.toString().toLowerCase().trim()) {
            return true;
          }

          // Check Blood Pressure
          if (goal.indexOf('/') > -1 && result.indexOf('/') > -1) {
            s = goal.replace(/[0-9/]/g, '');
            g = goal.replace(/[<>=]/g, '');
            goal = g.split('/');

            var sys1 = parseInt(goal[0]),
              dai1 = parseInt(goal[1]),
              sys2 = parseInt(result[0]),
              dai2 = parseInt(result[1]);

            if (!((s !== '>' && s !== '>=' && s !== '=>' && s !== '<' && s !== '<=' && s !== '=<' && s !== '=') || isNaN(sys1) || isNaN(dai1) || isNaN(sys2) || isNaN(dai2))) {
              if (
                (s === '>' && sys2 > sys1 && dai2 > dai1) ||
                ((s === '>=' || s === '=>') && sys2 >= sys1 && dai2 >= dai1) ||
                (s === '<' && sys2 < sys1 && dai2 < dai1) ||
                ((s === '<=' || s === '=<') && sys2 <= sys1 && dai2 <= dai1) ||
                (s === '=' && sys2 === sys1 && dai2 === dai1)
              ) {
                return true;
              }
            }

            return false;
          }

          // Check Number
          s = goal.replace(/[0-9]/g, '');
          g = parseFloat(goal.replace(/[<>=]/g, ''));
          r = parseFloat(result);
          if (!((s !== '>' && s !== '>=' && s !== '=>' && s !== '<' && s !== '<=' && s !== '=<' && s !== '=') || isNaN(g) || isNaN(r))) {
            if (
              (s === '>' && r > g) ||
              ((s === '>=' || s === '=>') && r >= g) ||
              (s === '<' && r < g) ||
              ((s === '<=' || s === '=<') && r <= g) ||
              (s === '=' && r === g)
            ) {
              return true;
            }
          }

          return false;
        }

        // Check  Body Mass index
        if (bodyMassIndex) {
          result = healthResult.bmiValue;
          reward = parseInt(employer.bodyMassIndexReward) ? parseInt(employer.bodyMassIndexReward) : 0;
          rewardEmployer = reward;
          goal = employer.bodyMassIndexGoal ? employer.bodyMassIndexGoal : '';
          goal = goal.trim();
          totalReal += reward;

          if (isPassed(goal, result)) {
            passed = true;
            totalReward += reward;
            totalPassed++;
          } else {
            passed = false;
            reward = 0;
          }

          tableList.push({
            classes: 'body-mass-index',
            passed: passed,
            name: 'Body Mass Index',
            goal: goal,
            result: result,
            reward: reward,
            rewardEmployer: rewardEmployer,
            data: LABVALUES.bmiValue
          });
        }

        // Check  Blood Pressure
        if (bloodPressure) {
          result = healthResult.systolic1 + '/' + healthResult.diastolic1;
          reward = parseInt(employer.bloodPressureReward) ? parseInt(employer.bloodPressureReward) : 0;
          rewardEmployer = reward;
          goal = employer.bloodPressureGoal ? employer.bloodPressureGoal : '';
          goal = goal.trim();
          totalReal += reward;

          if (isPassed(goal, result)) {
            passed = true;
            totalReward += reward;
            totalPassed++;
          } else {
            passed = false;
            reward = 0;
          }

          tableList.push({
            classes: 'blood-pressure',
            passed: passed,
            name: 'Blood Pressure',
            goal: goal,
            result: result,
            reward: reward,
            rewardEmployer: rewardEmployer,
            data: LABVALUES.bloodPressure
          });
        }

        // Check Blood Sugar
        if (bloodSugar) {
          result = healthResult.glucose;
          reward = parseInt(employer.bloodSugarReward) ? parseInt(employer.bloodSugarReward) : 0;
          rewardEmployer = reward;
          goal = employer.bloodSugarGoal ? employer.bloodSugarGoal : '';
          goal = goal.trim();
          totalReal += reward;

          if (isPassed(goal, result)) {
            passed = true;
            totalReward += reward;
            totalPassed++;
          } else {
            passed = false;
            reward = 0;
          }

          tableList.push({
            classes: 'blood-sugar',
            passed: passed,
            name: 'Blood Sugar',
            goal: goal,
            result: result,
            rewardEmployer: rewardEmployer,
            reward: reward,
            data: LABVALUES.glucose
          });
        }

        // Check the LDL Cholesterol
        if (ldlCholesterol) {
          result = healthResult.ldl;
          reward = parseInt(employer.ldlCholesterolReward) ? parseInt(employer.ldlCholesterolReward) : 0;
          rewardEmployer = reward;
          goal = employer.ldlCholesterolGoal ? employer.ldlCholesterolGoal : '';
          goal = goal.trim();
          totalReal += reward;

          if (isPassed(goal, result)) {
            passed = true;
            totalReward += reward;
            totalPassed++;
          } else {
            passed = false;
            reward = 0;
          }

          tableList.push({
            classes: 'ldl-cholesterol',
            passed: passed,
            name: 'LDL Cholesterol',
            goal: goal,
            result: result,
            reward: reward,
            rewardEmployer: rewardEmployer,
            data: LABVALUES.ldl
          });
        }

        // Check use nicotine
        if (nicotinUse) {
          result = healthResult.smokerResponse ? 'Yes' : 'No';
          reward = parseInt(employer.nicotinUseReward) ? parseInt(employer.nicotinUseReward) : 0;
          rewardEmployer = reward;
          goal = employer.nicotinUseGoal ? employer.nicotinUseGoal : '';
          goal = goal.trim();
          totalReal += reward;

          if (isPassed(goal, result)) {
            passed = true;
            totalReward += reward;
            totalPassed++;
          } else {
            passed = false;
            reward = 0;
          }

          tableList.push({
            classes: 'nicotine-use',
            passed: passed,
            name: 'Nicotine Use',
            goal: goal,
            result: result,
            reward: reward,
            rewardEmployer: rewardEmployer,
            data: LABVALUES.smokerResponse
          });
        }

        service.rewardInfo = {
          bodyMassIndex: bodyMassIndex,
          bloodSugar: bloodSugar,
          nicotinUse: nicotinUse,
          healthCoaching: healthCoaching,
          bloodPressure: bloodPressure,
          ldlCholesterol: ldlCholesterol,
          participation: participation,
          tableList: tableList,
          totalReal: totalReal,
          totalReward: totalReward,
          totalPassed: totalPassed,
          totalCount: 5,
          passedPercent: (totalPassed / 5) * 100
        };
      },

      // Get health result for participant
      getHealthResult: function () {
        var deferred = $q.defer();

        if (service.isParticipant()) {
          participants.getHealthResult("", false).then(function (healthResult) {
            service.getRewardInfo(healthResult);
            service.currentUser.healthResult = healthResult;

            deferred.resolve(healthResult);
          }, function () {
            if (service.currentUser) {
              service.currentUser.healthResult = false;
            }
            service.currentUser.healthResult = false;

            deferred.resolve(false);
          });
        } else {
          deferred.resolve(false);
        }

        return deferred.promise;
      },

      // Logout the current user and redirect
      logout: function (redirectTo) {
        resetAll();
        if (arguments.length === 0) {
          if ($stateParams.clientUrl) {
            redirectTo = '/' + $stateParams.clientUrl + '/login';
          } else {
            //redirectTo = '/login';
            $state.go('loginForm', {}, { reload: true });
          }
        }

        // Redirect to supplied route
        redirect(redirectTo);
      },

      // Ask the backend to see if a user is already authenticated - this may be from a previous session.
      requestCurrentUser: function () {
        // Otherwise check if a session exists on the server
        var deferred = $q.defer(),
          authToken = $cookieStore.get('authToken');
        if (authToken) {
          // Set the Request Header 'Authorization'
          apiService.setAuthTokenHeader(authToken);

          if (!service.isAuthenticated()) {
            apiService.get('users/auth?loadingSpinnerNotShowing&ver=' + Math.random()).then(function (res) {

              getInfoLogin(deferred, res);

            }, function () {
              resetAll();
              deferred.resolve(false);
            });
          } else {
            deferred.resolve(service.currentUser);
          }
        } else {
          deferred.resolve(false);
        }
        return deferred.promise;
      },

      updateCurrentUser: function (currentUser, path) {
        // If successful, set current user object
        service.currentUser = utils.updateCurrentInfo(service.currentUser, currentUser, path);
        $rootScope.$broadcast('security:current:upload', service.currentUser);

        return service.currentUser;

      },

      // Is the current user authenticated?
      isAuthenticated: function () {
        //return !!service.currentUser;
        if (service.currentUser && service.currentUser.isNeedToChangePassword) {
          return false;
        } else {
          return !!service.currentUser;
        }

      },

      isCookies: function () {
        if (service.currentUser) {
          if ($cookieStore.get('userId_' + service.currentUser.userId)) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },

      /***
       * Health Coach Manager can see every Client and Participant. Then the Health Coach Manager assigns Participants who need help to the appropriate Health Coach.
       * A Health Coach can only see the Participants that have been assigned to him by the Health Coach Manager
       * Clinical Director is not quite Admin. Clinical Director, Health Coach Manager, and Health Coach should not be able to delete Participants or Clients. But they can all see the health data of the Participants and Clients.
       * Admin has full access of every thing in the system- health and management.
       * Admin can see list with Clinical Director. But Clinical Director can't see Admin
       *
       * On the health side it goes
       * 1. Health Coach
       * 2. Health Coach Manager
       * 3. Clinical Director
       *
       * On Participant Management side it goes
       * 1. Client
       * 2. Agent
       * 3. Client Manager
       * 4. Admin
       *
       *
       * Participant = 0,
       *                 - See: Clinical Director, Health Coach Manager, Health Coach
       * Employer = 1,
       *                 - See: Clinical Director, Health Coach Manager, Health Coach
       * AgentTheAgent = 2
       * HealthCoach = 3,
       * HealthCoachManager = 4,
       * ClientManager = 5,
       * ClinicalDirector = 6,
       * Admin = 7
       ************
       ************
       * Level 0 - Participant Participant is the most basic user. Participants are employees who have chosen to participate in the PULSE wellness program.
       *           They can request health coaches to assist with their health.
       * Level 1 - Employer The Employer is the client (one company).
       *           They login and can add, edit, delete participants.
       *           They will also have a dashboard that shows them the "overall health" of the participants in their company.
       *           HOWEVER, they will NEVER have access to the participant's health results. They can only see the COMBINED health results.
       * Level 2 - Agent The Agent is the person who brings the employers to PULSE. They can login and see their list of employers.
       *           When they click on an employer then they are able to see the list of employees under the employer.
       * Level 3 - Health Coach The Health Coach will have a number of participants with multiple employers.
       *           They are assigned a list of participants who they will contact and help on a regular basis.
       * Level 4 - Health Coach Manager The Health Coach Manager can add health coaches to the system.
       *           The Health Coach Manager receives the health coach requests from the participants, and assigns participants to health coaches.
       *           The health coach manager can see a list of all participants assigned to each health coach, and change coaches if the request is made by the participant.
       * Level 5 - Client Manager The client manager can add a new client (employer) to PULSE and create their account information and temporary login.
       *           That sends a notification to the Employer so the Employer can login and start uploading participants.
       * Level 6 - Clinical Director The clinical director can access all participant health results to analyze the health of the participant, and reach out to the participant if there is a severe health issue.
       * Level 7 - Admin The admin can add, edit, or delete any user.​
       * Level 8 - Supper Admin The admin can add, edit, or delete any user.​
       * Level 9 - Spouse. Like Participant but just control themselves.
       */

      // Role Constant
      roles: {
        spouse: 9,
        superadmins: 8,
        admin: 7,
        clinicalDirector: 6,
        clientManager: 5,
        healthCoachManager: 4,
        healthCoach: 3,
        agent: 2,
        employer: 1,
        participant: 0
      },

      // Is the current user an administrator?
      isInRole: function (role) {
        if (!!service.currentUser) {
          var roles = service.currentUser.roles;
          for (var i = 0; i < roles.length; i++) {
            if (roles[i] === role) {
              return true;
            }
          }
        }

        return false;
      },

      isSpouse: function () {
        return service.isInRole("Spouse");
      },

      isSuperAdmin: function () {
        return service.isInRole("SuperAdmin");
      },

      isAdmin: function () {
        return service.isInRole("Admin");
      },

      // Is the current user an clinical director?
      isClinicalDirector: function () {
        return service.isInRole("ClinicalDirector");
      },

      // Is the current user an client manager?
      isClientManager: function () {
        return service.isInRole("ClientManager");
      },

      // Is the current user an health coach manager?
      isHealthCoachManager: function () {
        return service.isInRole("HealthCoachManager");
      },

      // Is the current user an health coach?
      isHealthCoach: function () {
        return service.isInRole("HealthCoach");
      },

      // Is the current user an agent the agent?
      isAgentTheAgent: function () {
        return service.isInRole("Agent");
      },

      // Is the current user an employer?
      isEmployer: function () {
        return service.isInRole("Employer");
      },

      // Is the current user an participant?
      isParticipant: function () {
        return service.isInRole("Participant");
      },

      // Get Uploaded By Name
      getUploadedByName: function (uploadedBy) {
        var uploadedName = '';
        if (angular.isObject(uploadedBy) && !angular.isArray(uploadedBy)) {

          if (uploadedBy.userRole) {
            if (uploadedBy.userRole === service.roles.clinicalDirector) {
              uploadedName = 'Clinical Director';
            } else if (uploadedBy.userRole === service.roles.clientManager) {
              if (uploadedBy.firstName !== undefined || uploadedBy.lastName !== undefined || uploadedBy.username !== undefined) {
                uploadedName = utils.getFullName(uploadedBy);
              } else {
                uploadedName = 'Client Manager';
              }
            } else if (uploadedBy.userRole === service.roles.healthCoachManager) {
              uploadedName = 'Health Coach Manager';
            } else if (uploadedBy.userRole === service.roles.healthCoach) {
              uploadedName = 'Health Coach';
            } else if (uploadedBy.userRole === service.roles.agent) {
              uploadedName = 'Agent';
            } else if (uploadedBy.userRole === service.roles.employer) {
              uploadedName = 'Client';
            }
          } else {
            uploadedName = uploadedBy.roleName;
          }
        }

        return uploadedName;
      },

      /** Benefit year for participant **/
      isParticipantBeniCompSelect: function () {

        if (!service.isParticipant() && !service.isSpouse()) {
          return false;
        }

        if (service.isParticipant()) {
          if (service.currentUser.employer && !!service.currentUser.employer.products.beniCompSelect && service.currentUser.products.beniCompSelect) {
            return true;
          }
        }

        if (service.isSpouse()) {
          if (service.currentUser.employer && !!service.currentUser.employer.products.beniCompSelect && service.currentUser.participant.products.beniCompSelect) {
            return true;
          }
        }


        return false;
      },

      /** Benefit year for participant have BeniCompSelect **/
      isParticipantHaveBeniCompSelect: function () {

        if (!service.isParticipant() && !service.isSpouse()) {
          return false;
        }

        if (service.isParticipant()) {
          if (service.currentUser.employer && !!service.currentUser.employer.products.beniCompSelect && service.currentUser.products.beniCompSelect) {
            return true;
          }
        }

        if (service.isSpouse()) {
          if (service.currentUser.employer && !!service.currentUser.employer.products.beniCompSelect && service.currentUser.participant.products.beniCompSelect) {
            return true;
          }
        }


        return false;
      },

      /** Benefit year for participant have BeniCompAdvantage **/
      isParticipantHaveBeniCompAdvantage: function () {

        if (!service.isParticipant() && !service.isSpouse()) {
          return false;
        }

        if (service.isParticipant()) {
          if (service.currentUser.employer && !!service.currentUser.employer.products.beniCompAdvantage && service.currentUser.products.beniCompAdvantage) {
            return true;
          }
        }

        if (service.isSpouse()) {
          if (service.currentUser.employer && !!service.currentUser.employer.products.beniCompAdvantage && service.currentUser.participant.products.beniCompAdvantage) {
            return true;
          }
        }


        return false;
      },

      isCurrentBenefitYear: function (by) {
        if (!by) {
          return false;
        }

        var currentTime = new Date().getTime(),
          startTime = new Date(utils.dateToShort(by.registerStartDate)).getTime(),
          //endTime = new Date(utils.dateToShort(by.registerEndDate)).getTime(),
          endTime = new Date(by.registerEndDate.getFullYear(), by.registerEndDate.getMonth() + 1, by.registerEndDate.getDate()).getTime();

        if (startTime <= currentTime && currentTime <= endTime) {
          return true;
        }

        return false;
      },

      isOpeningBenefitYear: function (by) {
        if (!by) {
          return false;
        }

        var currentTime = new Date().getTime(),
          startTime = new Date(utils.dateToShort(by.registerStartDate)).getTime(),
          endTime = new Date(utils.dateToShort(by.registerEndDate)).getTime();

        if (startTime <= currentTime && currentTime <= endTime) {
          return true;
        }

        return false;
      },

      // For BCA
      // Array
      benefitYearBcaList: null,

      // Object
      currentBenefitYearBca: null,

      // Return promise
      getBenefitYearBca: function () {
        var deferred = $q.defer();

        if (!service.benefitYearBcaList) {
          employers.getEmployerWithIncentive({ id: service.currentUser.employer.id }).then(function (response) {
            service.benefitYearBcaList = [];

            _.forEach(response.incentives, function (item) {
              item.startDate = utils.dateServerToLocalTime(item.startDate);
              item.endDate = utils.dateServerToLocalTime(item.endDate);
              item.registerStartDate = utils.dateServerToLocalTime(item.registerStartDate);
              item.registerEndDate = utils.dateServerToLocalTime(item.registerEndDate);
              service.benefitYearBcaList.push(item);
            });

            deferred.resolve(service.benefitYearBcaList);
          }, function () {
            deferred.resolve([]);
          });
        } else {
          deferred.resolve(service.benefitYearBcaList);
        }

        return deferred.promise;
      },

      // Return promise
      getCurrentBenefitYearBca: function () {
        var deferred = $q.defer();

        if (!service.currentBenefitYearBca) {
          service.getBenefitYearBca().then(function (response) {
            _.forEach(response, function (item) {
              if (service.isCurrentBenefitYear(item)) {
                service.currentBenefitYearBca = item;
                return;
              }
            });
            deferred.resolve(service.currentBenefitYearBca);
          });
        } else {
          deferred.resolve(service.currentBenefitYearBca);
        }

        return deferred.promise;
      },

      // Check benefit year opening
      checkBenefitYearBcaOpening: function () {
        var deferred = $q.defer();

        if (service.currentBenefitYearBca) {
          deferred.resolve(service.isOpeningBenefitYear(service.currentBenefitYearBca));
        } else {
          service.getCurrentBenefitYearBcs().then(function () {
            deferred.resolve(service.isOpeningBenefitYear(service.currentBenefitYearBca));
          });
        }

        return deferred.promise;
      },

      // Check benefit year disable
      checkBenefitYearBcaDisable: function () {
        var deferred = $q.defer();

        if (service.currentBenefitYearBca) {
          deferred.resolve(!service.currentBenefitYearBca);
        } else {
          service.getCurrentBenefitYearBcs().then(function () {
            deferred.resolve(!service.currentBenefitYearBca);
          });
        }

        return deferred.promise;
      },

      // For BCS
      // Array
      benefitYearBcsList: null,

      // Object
      currentBenefitYearBcs: null,

      // Return promise
      getBenefitYearBcs: function () {
        var deferred = $q.defer();

        if (!service.isParticipantBeniCompSelect()) {
          deferred.resolve(null);
          return deferred.promise;
        }

        if (!service.benefitYearBcsList) {
          employers.getBenefitYearBcs(service.currentUser.employer.id, false).then(function (response) {
            service.benefitYearBcsList = response;
            deferred.resolve(service.benefitYearBcsList);
          }, function () {
            deferred.resolve([]);
          });
        } else {
          deferred.resolve(service.benefitYearBcsList);
        }

        return deferred.promise;
      },

      // Return promise
      getCurrentBenefitYearBcs: function () {
        var deferred = $q.defer();

        if (!service.isParticipantBeniCompSelect()) {
          deferred.resolve(null);
          return deferred.promise;
        }

        if (!service.currentBenefitYearBcs) {
          service.getBenefitYearBcs().then(function (response) {
            _.forEach(response, function (item) {
              if (service.isCurrentBenefitYear(item)) {
                service.currentBenefitYearBcs = item;
                return;
              }
            });
            deferred.resolve(service.currentBenefitYearBcs);
          });
        } else {
          deferred.resolve(service.currentBenefitYearBcs);
        }

        return deferred.promise;
      },

      // Check benefit year opening
      checkBenefitYearBcsOpening: function () {
        var deferred = $q.defer();

        if (!service.isParticipantBeniCompSelect()) {
          deferred.resolve(false);
          return deferred.promise;
        }

        if (service.currentBenefitYearBcs) {
          deferred.resolve(service.isOpeningBenefitYear(service.currentBenefitYearBcs));
        } else {
          service.getCurrentBenefitYearBcs().then(function () {
            deferred.resolve(service.isOpeningBenefitYear(service.currentBenefitYearBcs));
          });
        }

        return deferred.promise;
      },

      // Check benefit year disable
      checkBenefitYearBcsDisable: function () {
        var deferred = $q.defer();

        if (!service.isParticipantBeniCompSelect()) {
          deferred.resolve(false);
          return deferred.promise;
        }

        if (service.currentBenefitYearBcs) {
          deferred.resolve(!service.currentBenefitYearBcs);
        } else {
          service.getCurrentBenefitYearBcs().then(function () {
            deferred.resolve(!service.currentBenefitYearBcs);
          });
        }

        return deferred.promise;
      },
      /** End Benefit year for participant **/

      /** START: Get All Notification **/
      allNotification: null,

      getAllNotification: function () {
        var deferred = $q.defer();

        users.getAllNotifications().then(function (response) {
          service.allNotification = response;
          deferred.resolve(service.spouseInfo);
        });
        return deferred.promise;
      },

      setReadNotification: function (API, data, typle) {
        var newData = {};
        if (typle && typle === 'multiple') {

          newData = {
            ids: data
          };

          API.updateFiledIsRead(newData).then(function () {

            service.getAllNotification();

          });

        } else {

          if (!data.isRead) {
            newData = {
              id: data.id,
              isRead: true
            };

            API.patch(newData).then(function () {

              service.getAllNotification();

            });
          }
        }
      },


      /** END: Get All Notification **/


      /** Spouse And Dependent for participant **/
      spouseInfo: null,
      dependentList: [],
      spouseActiveList: [],
      dependentsActiveList: [],

      // Spouse Info
      getSpouse: function () {
        var deferred = $q.defer();

        spouses.getByParticipantId(service.currentUser.id).then(function (response) {
          service.spouseInfo = response;
          deferred.resolve(service.spouseInfo);
        });

        // if (!service.spouseInfo) {
        //   spouses.getByParticipantId(service.currentUser.id).then(function (response) {
        //     service.spouseInfo = response;
        //     deferred.resolve(service.spouseInfo);
        //   });
        // } else {
        //   deferred.resolve(service.spouseInfo);
        // }

        return deferred.promise;
      },

      // Spouse List Active
      getListSpouseActive: function () {
        var deferred = $q.defer();

        var params = {
          id_participant: service.currentUser.id
        };

        var headers = {
          'X-Filter': JSON.stringify([
            {
              property: "isDeleted",
              operator: "equal",
              condition: "or",
              value: false
            }
          ])
        };

        participants.getListSpouse(params, headers)
          .then(function (response) {
            service.spouseActiveList = response.data;

            angular.forEach(service.spouseActiveList, function (item, key) {
              service.spouseActiveList[key]['userId'] = item.applicationUserId;
            });

            deferred.resolve(service.spouseActiveList);
          });

        // if (!service.spouseInfo) {
        //   spouses.getByParticipantId(service.currentUser.id).then(function (response) {
        //     service.spouseInfo = response;
        //     deferred.resolve(service.spouseInfo);
        //   });
        // } else {
        //   deferred.resolve(service.spouseInfo);
        // }

        return deferred.promise;
      },


      updateSpouse: function (spouseInfo) {
        _.each(spouseInfo, function (val, key) {
          if (_.isObject(val)) {
            service.spouseInfo[key] = _.clone(val);
          } else {
            service.spouseInfo[key] = val;
          }
        });
      },

      // Dependent
      getDependents: function (header) {
        var deferred = $q.defer();

        dependents.getByParticipantId(service.currentUser.id, header).then(function (response) {
          service.dependentList = response;
          deferred.resolve(service.dependentList);
        });

        // if (service.dependentList.length === 0) {
        //   dependents.getByParticipantId(service.currentUser.id).then(function (response) {
        //     service.dependentList = response;
        //     deferred.resolve(service.dependentList);
        //   });
        // } else {
        //   deferred.resolve(service.dependentList);
        // }

        return deferred.promise;
      },

      // Dependent List Active
      getListDependentsActive: function () {
        var deferred = $q.defer();

        var params = {
          id_participant: service.currentUser.id
        };

        var headers = {
          'X-Filter': JSON.stringify([
            {
              property: "isDeleted",
              operator: "equal",
              condition: "or",
              value: false
            }
          ])
        };

        participants.getListDependents(params, headers)
          .then(function (response) {
            service.dependentsActiveList = response.data;

            angular.forEach(service.dependentsActiveList, function (item, key) {
              service.dependentsActiveList[key]['userId'] = item.applicationUserId;
            });

            deferred.resolve(service.dependentsActiveList);
          });

        return deferred.promise;
      },

      updateDependents: function (dependentList) {
        service.dependentList = dependentList;
      }
    };

    return service;
  });
