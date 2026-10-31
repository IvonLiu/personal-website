var app = angular.module('mesnotes', ['ui.router', 'parse']);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider
      .state('index', {
        abstract: true,
        views: {
          '@': {
            templateUrl: 'layout.html',
            controller: 'IndexCtrl'
          },
          'navbar@index': {
            templateUrl: 'partials/navbar.html',
            controller: 'NavbarCtrl'
          }
        }
      })
      .state('sidebar', {
        parent: 'index',
        abstract: true,
        views: {
          'main@index': {
            templateUrl: 'partials/sidebar.html'
          }
        }
      })

    .state('home', {
        parent: 'index',
        url: '/home',
        views: {
          'main@index': {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
          }
        }
      })

    .state('dash', {
      parent: 'sidebar',
      url: '/dash',
      views: {
        'content@sidebar': {
          templateUrl: '',
          controller: 'DashCtrl'
        }
      }
    })
      .state('dash.student', {
        url: '',
        views: {
          'content@sidebar': {
            templateUrl: 'partials/dash.student.html',
            controller: 'StudentCtrl'
          },
          'side@sidebar': {
            templateUrl: 'partials/anything.side.html'
          }
        }
      })
      .state('dash.teacher', {
        url: '',
        views: {
          'content@sidebar': {
            templateUrl: 'partials/dash.teacher.html',
            controller: 'TeacherCtrl'
          },
          'side@sidebar': {
            templateUrl: 'partials/anything.side.html',
          }
        }
      })

    .state('joinClass', {
      parent: 'index',
      url: '/join',
      views: {
        'main@index': {
          templateUrl: 'partials/joinclass.html',
          controller: 'JoinClassCtrl'
        }
      }
    })
    .state('createClass', {
      parent: 'index',
      url: '/create',
      views: {
        'main@index': {
          templateUrl: 'partials/createclass.html',
          controller: 'CreateClassCtrl'
        }
      }
    })

    .state('cls', {
      parent: 'sidebar',
      url: '/classes/{classId}',
      views: {
        'content@sidebar': {
          templateUrl: '',
          controller: 'ClassCtrl'
        }
      },
      resolve: {
        clsResponse: ['$stateParams', '$http', 'utils', 'classes', 'assignments', 'saPairs',
          function($stateParams, $http, utils, Classes, Assignments, SAPairs) {
            console.log("Resolving clsResponse");

            return $http.get('https://mesnotes.parseapp.com/classes/' + $stateParams.classId).then(function(response) {
              o = {
                cls: Parse.Object.fromJSON(response.data.cls),
                students: response.data.students.map(function(student) {
                  return Parse.Object.fromJSON(student);
                }),
                assignments: response.data.assignments.map(function(assignment) {
                  return Parse.Object.fromJSON(assignment);
                }),
                saPairs: response.data.saPairs.map(function(saPair) {
                  return Parse.Object.fromJSON(saPair);
                })
              };

              return Parse.Promise.when(o.saPairs.map(function(saPair) {
                return saPair.student.fetch();
              })).then(function(results) {
                return Parse.Promise.when(o.saPairs.map(function(saPair) {
                  return saPair.assignment.fetch();
                }));
              }, utils.handleError).then(function(results) {
                return o;
              }, utils.handleError);
            }, utils.handleError);
          }
        ]
      }
    })
      .state('cls.student', {
        url: '',
        views: {
          'content@sidebar': {
            templateUrl: 'partials/cls.student.html',
            controller: 'StudentClassCtrl'
          },
          'side@sidebar': {
            templateUrl: 'partials/anything.side.html'
          }
        }
      })
      .state('cls.teacher', {
        url: '',
        views: {
          'content@sidebar': {
            templateUrl: 'partials/cls.teacher.html',
            controller: 'TeacherClassCtrl'
          },
          'side@sidebar': {
            templateUrl: 'partials/anything.side.html'
          }
        }
      })
      .state('cls.assignment', {
        url: '/assignments/{assignmentId}',
        views: {
          'content@sidebar': {
            templateUrl: '',
            controller: 'AssignmentCtrl'
          }
        },
        resolve: {
          assignment: ['$stateParams', '$http',
            function($stateParams, $http) {
              return $http.get('https://mesnotes.parseapp.com/classes/' + $stateParams.classId + '/assignments/' + $stateParams.assignmentId).then(function(response) {
                // do stuff with response
                // return object or promise.
                return Parse.Object.fromJSON(response.data);
              });
            }
          ]
        }
      })
        .state('cls.assignment.student', {
          url: '',
          views: {
            'content@sidebar': {
              templateUrl: 'partials/cls.assignment.student.html',
              controller: 'StudentAssignmentCtrl'
            },
            'side@sidebar': {
              templateUrl: 'partials/anything.side.html'
            }
          }
        })
        .state('cls.assignment.teacher', {
          url: '',
          views: {
            'main@cls': {
              templateUrl: 'partials/cls.assignment.teacher.html',
              controller: 'TeacherAssignmentCtrl'
            },
            'side@sidebar': {
              templateUrl: 'partials/anything.side.html'
            }
          }
        })

    .state('login', {
      parent: 'index',
      url: '/login',
      views: {
        'main@index': {
          templateUrl: 'partials/login.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('settings', {
      parent: 'sidebar',
      url: '/settings',
      views: {
        'content@sidebar': {
          templateUrl: 'partials/settings.html'
        },
        'side@sidebar': {
          templateUrl: 'partials/anything.side.html'
        }
      }
    });

    //$locationProvider.html5Mode({ enabled: true, requireBase: false });
    $urlRouterProvider.otherwise('home');
  }
]);

app.run(['$rootScope', '$state',
  function($rootScope, $state) {

    $rootScope.currentUser = Parse.User.current();

    $rootScope.logOut = function() {
      Parse.User.logOut();
      $rootScope.currentUser = null;
      $state.go('home');
    };

  }
]);

/**
 * Make sure user is logged in
 * when accessing certain state
 */
app.run(['$rootScope', '$state',
  function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if (toState.includes !== 'home' && toState.name !== 'login' && !$rootScope.currentUser) {
        event.preventDefault();
        $state.go('login');
      }
    });
  }
]);

app.config([
  'parseRepositoriesProvider',
  function(provider) {
    provider.init(Parse, '4BotGmEw6Q8FGNBBkw1VMSTZoqfD0XNXSSBUELGZ', 'kivaKuOmrNlw0ilHB4VJqKJtBgBZgCJ5o16fXDc2');
  }
]);

app.factory('authInterceptor', function($rootScope, $q, $window) {
  return {
    request: function(config) {
        config.headers = config.headers || {};
        if ($rootScope.currentUser) {
          config.headers.sessionToken = $rootScope.currentUser.get('sessionToken');
        }
        /*if (config.url.indexOf('mesnotes.parseapp.com') > -1) {
          console.log(config);
          console.log(JSON.stringify(config));
        }*/
        return config;
      }
      /*,
          response: function (response) {
            if (response.status === 403) {
              // handle the case where the user is not authenticated
            }
            return response || $q.when(response);
          }*/
  };
});

app.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});

app.factory('utils', [function() {
  var utils = {

    handleError: function(error) {
      console.log(error);
    },

    generateClassGrid: function(cls) {
      var students = cls.students;
      var assignments = cls.assignments;
      var saPairs = cls.saPairs;

      var grid = [];

      for (var i = 0; i < students.length; i++) {
        var student = {};
        student.user = students[i];
        student.assignments = [];
        for (var j = 0; j < assignments.length; j++) {
          var found = false;
          for (var k = 0; k < saPairs.length; k++) {
            if (saPairs[k].student.getUsername() == student.user.getUsername()) {
              if (saPairs[k].assignment.name == assignments[j].name) {
                student.assignments.push({
                  assignment: assignments[j],
                  obtained: saPairs[k].obtained
                });
                found = true;
                break;
              }
            }
          }
          if (!found) {
            student.assignments.push({
              assignment: assignments[j],
              obtained: 0
            });
          }
        }
        grid.push(student);
      }
      return grid;
    }

  };
  return utils;
}]);

app.factory('classes', [
  'parseRepositories',
  '$q',
  function(repos, $q) {
    var Cls = repos.CreateRepository('Class', {});

    repos.GettersAndSetters(Cls, [{
      angular: 'name',
      parse: 'name'
    }, {
      angular: 'teacher',
      parse: 'teacher'
    }]);

    return Cls;
  }
]);

app.factory('assignments', [
  'parseRepositories',
  '$q',
  function(repos, $q) {
    var Assignment = repos.CreateRepository('Assignment', {});

    repos.GettersAndSetters(Assignment, [{
      angular: 'name',
      parse: 'name'
    }, {
      angular: 'max',
      parse: 'max'
    }, {
      angular: 'cls',
      parse: 'cls'
    }]);

    return Assignment;
  }
]);

app.factory('saPairs', [
  'parseRepositories',
  '$q',
  function(repos, $q) {
    var SAPair = repos.CreateRepository('StudentAssignmentPair', {});

    repos.GettersAndSetters(SAPair, [{
      angular: 'student',
      parse: 'student'
    }, {
      angular: 'assignment',
      parse: 'assignment'
    }, {
      angular: 'cls',
      parse: 'cls'
    }, {
      angular: 'obtained',
      parse: 'obtained'
    }]);

    return SAPair;
  }
]);

app.controller('IndexCtrl', [
  '$scope',
  '$rootScope',
  'utils',
  '$http',
  '$state',
  '$window',
  function($scope, $rootScope, utils, $http, $state) {

  }
]);

app.controller('DashCtrl', [
  '$scope',
  '$rootScope',
  '$state',
  function($scope, $rootScope, $state) {
    if ($rootScope.currentUser) {
      $rootScope.currentUser.get('userType').fetch().then(function(userType) {
        if (userType.get('name') == 'student') {
          $state.go('dash.student');
        } else if (userType.get('name') == 'teacher') {
          $state.go('dash.teacher');
        } else {
          $state.go('home');
        }
      });
    } else {
      $state.go('home');
    }
  }
]);


app.controller('ClassCtrl', [
  '$scope',
  '$rootScope',
  '$state',
  'clsResponse',
  'classes',
  function($scope, $rootScope, $state, clsResponse, Classes) {
    if ($rootScope.currentUser) {
      var cls = clsResponse.cls;
      var query = $rootScope.currentUser.relation('classes').query();
      query.get(cls.id).then(function(cls) {
        // User is a part of this class
        $rootScope.currentUser.get('userType').fetch().then(function(userType) {
          params = {
            classId: cls.id
          };
          if (userType.get('name') == 'student') {
            $state.go('cls.student', params);
          } else if (userType.get('name') == 'teacher') {
            $state.go('cls.teacher', params);
          } else {
            console.log('User is neither student nor teacher');
            $state.go('home');
          }
        });
      }, function(error) {
        // User does not have permission to access this class
        console.log(error);
        $state.go('home');
        // TODO throw 403 error or something
      });
    } else {
      console.log('User not logged in');
      $state.go('home');
    }
  }
]);

app.controller('AssignmentCtrl', [
  '$scope',
  '$rootScope',
  '$state',
  '$stateParams',
  function($scope, $rootScope, $state, $stateParams) {
    if ($rootScope.currentUser) {
      $rootScope.currentUser.get('userType').fetch().then(function(userType) {
        if (userType.get('name') == 'student') {
          $state.go('cls.assignment.student', $stateParams);
        } else if (userType.get('name') == 'teacher') {
          $state.go('cls.assignment.teacher', $stateParams);
        } else {
          console.log('User is neither student nor teacher');
          $state.go('home');
        }
      }, function(error) {
        console.log(error);
        $state.go('home');
      });
    } else {
      console.log('User not logged in');
      $state.go('home');
    }
  }
]);
