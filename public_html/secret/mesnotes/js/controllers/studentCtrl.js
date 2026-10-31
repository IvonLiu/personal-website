app.controller('StudentCtrl', [
  '$scope',
  '$rootScope',
  'utils',
  '$http',
  'classes',
  function($scope, $rootScope, utils, $http, Classes) {
    
    $scope.classes = [];

    $http.get('https://mesnotes.parseapp.com/classes').then(function(response) {
      $scope.classes = response.data.map(function(cls) {
        return Parse.Object.fromJSON(cls);
      });
    }, utils.handleError);

  }
]);