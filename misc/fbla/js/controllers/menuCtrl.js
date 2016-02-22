app.controller('MenuCtrl', [
  '$scope',
  'utils',
  '$state',
  function($scope, utils, $state) {
    $state.go('.food');
  }
]);

app.controller('FoodMenuCtrl', [
  '$scope',
  'utils',
  '$state',
  '$firebaseArray',
  function($scope, utils, $state, $firebaseArray) {
    var ref = new Firebase('https://fbla-website.firebaseio.com/menu/food')
    $scope.menu = $firebaseArray(ref);
  }
]);

app.controller('DrinksMenuCtrl', [
  '$scope',
  'utils',
  '$state',
  '$firebaseArray',
  function($scope, utils, $state, $firebaseArray) {
    var ref = new Firebase('https://fbla-website.firebaseio.com/menu/drinks')
    $scope.menu = $firebaseArray(ref);
  }
]);

app.controller('BakeryMenuCtrl', [
  '$scope',
  'utils',
  '$state',
  '$firebaseArray',
  function($scope, utils, $state, $firebaseArray) {
    var ref = new Firebase('https://fbla-website.firebaseio.com/menu/bakery')
    $scope.menu = $firebaseArray(ref);
  }
]);
