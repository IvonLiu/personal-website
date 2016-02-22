app.controller('ReviewsCtrl', [
  '$scope',
  'utils',
  'reviews',
  function($scope, utils, reviews) {

    $scope.reviews = reviews;

    $scope.addReview = function() {
      var now = moment();
      $scope.reviews.$add({
        timestamp: now.format('MM/DD/YYYY hh:mm A'),
        millis: now.unix(),
        email: $scope.email,
        name: $scope.name,
        content: $scope.content
      });
      $scope.email = '';
      $scope.name = '';
      $scope.content = '';
    }
  }
]);
