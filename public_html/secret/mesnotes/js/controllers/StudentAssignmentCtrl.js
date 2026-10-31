app.controller('StudentAssignmentCtrl', [
  '$scope',
  '$rootScope',
  'utils',
  '$http',
  'assignment',
  function($scope, $rootScope, utils, $http, assignment) {

    $scope.assignment = assignment;    

  }
]);
