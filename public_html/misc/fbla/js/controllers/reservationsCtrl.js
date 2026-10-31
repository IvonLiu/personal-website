app.directive('dateTimePicker', [
  '$rootScope',
  function($rootScope) {
    return {
      require: '^ngModel',
      restrict: 'AE',
      scope: {
        ngModel: '=',
        format: '@',
        useCurrent: '@',
        location: '@'
      },
      link: function(scope, elem, attrs) {
        elem.datetimepicker({
          format: scope.format,
          useCurrent: Boolean(scope.useCurrent)
        });
        elem.data("DateTimePicker").date(moment());
        elem.on('blur', function() {
          scope.ngModel = elem.data("DateTimePicker").date().format(scope.format);
          $rootScope.$apply();
        });
      }
    };
  }
]);

app.controller('ReservationsCtrl', [
  '$scope',
  'utils',
  'reservations',
  '$timeout',
  '$state',
  function($scope, utils, reservations, $timeout, $state) {

    $scope.reservations = reservations;

    $scope.$watchGroup(['date', 'time', 'reservations'], function() {
      console.log('Datetime update: ' + $scope.date + ', ' + $scope.time);
      $scope.reservationTime = undefined;
      if ($scope.date && $scope.time && $scope.reservations) {
        $scope.findAvailableTimes();
      } else {
        $scope.availableTimes = undefined;
      }
    });

    $scope.findAvailableTimes = function() {

      var combined = $scope.date + ' ' + $scope.time;
      var datetime = moment(combined);
      datetime.milliseconds(0);
      datetime.seconds(0);
      $scope.roundDatetime(datetime);

      var timeslots = [];
      for (var i = -2; i <= 2; i++) {
        var copy = moment(datetime.format());
        copy.add(i * 30, 'm');
        timeslots.push({
          occupied: false,
          datetime: copy
        });
      }

      var occupiedCount = 0;
      for (var i=0; i<timeslots.length; i++) {
        for (var j=0; j<$scope.reservations.length; j++) {
          if ($scope.reservations[j].datetime == timeslots[i].datetime.format()) {
            timeslots[i].occupied = true;
            occupiedCount++;
          }
        }
      }

      if (occupiedCount == timeslots.length) {
        $scope.noFreeSpots = true;
      } else {
        $scope.noFreeSpots = false;
      }
      $scope.availableTimes = timeslots;
    };

    $scope.roundDatetime = function(datetime) {
      if (datetime.minutes() <= 15) {
        datetime.minutes(0);
      } else if (datetime.minutes() > 15 && datetime.minutes() <= 45) {
        datetime.minutes(30);
      } else {
        datetime.minutes(0);
        datetime.add(1, 'h');
      }
    };

    $scope.selectTimeslot = function(timeslot) {
      $scope.reservationTime = timeslot.datetime.format();
      for (var i=0; i<$scope.availableTimes.length; i++) {
        $scope.availableTimes[i].selected = false;
      }
      timeslot.selected = true;
    };

    $scope.createReservation = function() {
      $scope.reservations.$add({
        partySize: $scope.partySize,
        datetime: $scope.reservationTime,
        email: $scope.email
      });
      $scope.partySize = undefined;
      $scope.date = undefined;
      $scope.time = undefined;
      $scope.reservationTime = undefined;
      $scope.email = '';
      $scope.thankYou = true;
      $timeout(function() {
        $state.go('home');
      }, 3000);
    };

  }
]);
