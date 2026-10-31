app.controller('LoginCtrl', [
  '$scope',
  '$rootScope',
  '$state',
  'utils',
  '$http',
  '$window',
  function($scope, $rootScope, $state, utils, $http, $window) {

    $scope.logIn = function() {
      Parse.User.logIn($scope.logInUsername, $scope.logInPassword).then(function(user) {
        $rootScope.currentUser = user;
        $scope.$apply();
        $scope.postLogIn();
      }, utils.handleError);

      $scope.logInUsername = '';
      $scope.logInPassword = '';
    }

    $scope.signUp = function() {
      var user = new Parse.User();
      user.set("username", $scope.signUpUsername);
      user.set("email", $scope.signUpEmail);
      user.set("password", $scope.signUpPassword);

      var roleQuery = new Parse.Query(Parse.Role);
      roleQuery.equalTo("name", $scope.userType);

      roleQuery.first().then(function(role) {
        user.set("userType", role);
        user.signUp(null).then(function(user) {
          role.getUsers().add(user);
          role.save().then(function(role) {
            $rootScope.currentUser = user;
            $scope.$apply();
            $scope.postLogIn();
          }, utils.handleError);
        }, utils.handleError);
      }, utils.handleError);

      $scope.signUpUsername = '';
      $scope.signUpEmail = '';
      $scope.signUpPassword = '';
      $scope.userType = 'student';
    }

    $scope.postLogIn = function() {
      $state.go('dash');
    };

  }
]);
