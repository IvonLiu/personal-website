app.controller('TeacherAssignmentCtrl', [
  '$scope',
  '$rootScope',
  '$stateParams',
  'utils',
  '$http',
  'assignment',
  function($scope, $rootScope, $stateParams, utils, $http, assignment) {

    $scope.assignment = assignment;

    $scope.updateAssignment = function() {
      var assignment = {
        name: $scope.assignment.name,
        max: $scope.assignment.max
      };
      $http.post('https://mesnotes.parseapp.com/classes/'+$stateParams.classId+'/assignments/'+$stateParams.assignmentId, assignment).then(function(response) {
        $scope.assignment = Parse.Object.fromJSON(response.data);
        console.log('Update assignment successful');
      }, utils.handleError);
    };

    $scope.deleteAssignment = function() {
      console.log('Hello deleting');
      $http.delete('https://mesnotes.parseapp.com/classes/'+$stateParams.classId+'/assignments/'+$stateParams.assignmentId, assignment).then(function(response) {
        //console.log('Assignment successfully deleted');
        console.log(JSON.stringify(response.data));
      }, utils.handleError);
    };

  }
]);
