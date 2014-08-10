var app = angular.module('toofer', ['ab-base64', 'hljs', 'ngCookies', 'ngRoute', 'ui.bootstrap']);

app.filter('decode', function(base64) {
  return function(input) {
    return base64.decode(input || '');
  };
});

app.directive('loading', function () {
  return {
    restrict: 'AE',
    replace: 'false',
    template: '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
  }
});

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';

  $httpProvider.interceptors.push(function($q, AlertService) {
    return {
      responseError: function(rejection) {
        if (rejection.status == 0) {
          AlertService.add('danger', 'Could not connect to fleet!');
        }

        return $q.reject(rejection);
      }
    };
  });
}]);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/dashboard', {
        templateUrl: 'partials/dashboard.html'
      })
      .when('/machines', {
        templateUrl: 'partials/machines-list.html',
        controller: 'MachinesController'
      })
      .when('/units', {
        templateUrl: 'partials/units-list.html',
        controller: 'UnitsController'
      })
      .when('/units/:name', {
        templateUrl: 'partials/units-show.html',
        controller: 'UnitsController'
      })
      .otherwise({
        redirectTo: '/dashboard'
      });
  }
]);

app.controller('HeaderController', function HeaderController($scope, $location) {
  $scope.isActive = function (viewLocation) {
    return ~$location.path().indexOf(viewLocation);
  };
});

app.controller('MachinesController', function MachinesController($scope, CoreOSService) {
  $scope.fetchMachines = function fetchMachines() {
    CoreOSService.listMachines(function (error, data) {
      if (!error) {
        $scope.machines = data.machines;
      }
    });
  }
});

app.controller('MasterController', function($scope, $cookieStore) {
  var mobileView = 992;

  $scope.getWidth = function getWidth() {
    return window.innerWidth;
  };

  $scope.$watch($scope.getWidth, function(newValue, oldValue) {
    if (newValue >= mobileView) {
      if (angular.isDefined($cookieStore.get('toggle'))) {
        if ($cookieStore.get('toggle') == false) {
          $scope.toggle = false;
        } else {
          $scope.toggle = true;
        }
      } else {
        $scope.toggle = true;
      }
    } else {
      $scope.toggle = false;
    }
  });

  $scope.toggleSidebar = function toggleSidebar() {
    $scope.toggle = ! $scope.toggle;

    $cookieStore.put('toggle', $scope.toggle);
  };

  window.onresize = function onResize() {
    $scope.$apply();
  };
});

app.controller('UnitsController', function UnitsController($scope, $routeParams, $location, AlertService, CoreOSService) {
  $scope.destroyUnit = function destroyUnit(unit) {
    CoreOSService.destroyUnit(unit, function (error, data) {
      if (!error) {
        AlertService.add('success', 'Unit successfully destroyed');

        $location.path('/units');
      }
    });
  },
  $scope.fetchUnit = function fetchUnit() {
    CoreOSService.getUnit($routeParams.name, function (error, data) {
      if (!error) {
        $scope.unit = data;
      }
    });
  },
  $scope.fetchUnits = function fetchUnits() {
    CoreOSService.listUnits(function (error, data) {
      if (!error) {
        $scope.units = data.units;
      }
    });
  },
  $scope.changeUnitState = function changeUnitState(unit, state) {
    CoreOSService.changeUnitState(unit.name, state, function(error, data) {
      if (!error) {
        $scope.fetchUnit();
      }
    });
  },
  $scope.restartUnit = function restartUnit(unit) {
    CoreOSService.changeUnitState(unit.name, 'loaded', function(error, data) {
      $scope.fetchUnit();
    });

    CoreOSService.changeUnitState(unit.name, 'launched', function(error, data) {
      $scope.fetchUnit();
    });
  }
});

app.factory('AlertService', function($rootScope) {
  $rootScope.alerts = [];

  return {
    add: function (type, message) {
      var self = this;

      $rootScope.alerts.push({
        type: type,
        msg: message,
        close: function() {
          self.closeAlert(this)
        }
      });
    },

    closeAlert: function (alert) {
      this.closeAlertIndex($rootScope.alerts.indexOf(alert));
    },

    closeAlertIndex: function (index) {
      $rootScope.alerts.splice(index, 1);
    }
  };
});

app.factory('CoreOSService', function CoreOSService($http) {
  return {
    changeUnitState: function changeUnitState(name, state, callback) {
      $http.put('/api/v1-alpha/units/' + name, JSON.stringify({
        desiredState: state
      }))
      .success(function (data) {
        callback(null, data);
      })
      .error(function (error, status, headers, config, statusText) {
        callback({ error: error, status: status, statusText: statusText });
      });
    },
    destroyUnit: function destroyUnit(unit, callback) {
      $http.delete('/api/v1-alpha/units/' + unit.name, {
        data: {
          fileContents: unit.fileContents 
        }})
        .success(function (data) {
          callback(null, data);
        })
        .error(function (error, status, headers, config, statusText) {
          callback({ error: error, status: status, statusText: statusText });
        });
    },
    getUnit: function getUnit(name, callback) {
      $http.get('/api/v1-alpha/units/' + name)
        .success(function (data) {
          callback(null, data);
        })
        .error(function (error, status, headers, config, statusText) {
          callback({ error: error, status: status, statusText: statusText });
        });
    },
    listMachines: function listMachines(callback) {
      $http.get('/api/v1-alpha/machines')
        .success(function (data) {
          callback(null, data);
        })
        .error(function (error, status, headers, config, statusText) {
          callback({ error: error, status: status, statusText: statusText });
        });
    },
    listUnits: function listUnits(callback) {
      $http.get('/api/v1-alpha/units')
        .success(function (data) {
          callback(null, data);
        })
        .error(function (error, status, headers, config, statusText) {
          callback({ error: error, status: status, statusText: statusText });
        });
    }
  };
});