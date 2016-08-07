'use strict';

/* Controllers */

function IndexCtrl($scope, $http) {
  $http.get('/api/posts').
    success(function(data, status, headers, config) {
      $scope.posts = data.posts;
    });
}

function AddPostCtrl($scope, $http, $location) {
  $scope.form = {};
  $scope.submitPost = function () {
    $http.post('/api/post', $scope.form).
      success(function(data) {
        $location.path('/');
      }).
      error(function(data) {
      $location.url('/');
      alert("Nie masz uprawnien!")
      });
  };
}

function ReadPostCtrl($scope, $http, $routeParams) {
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    });
}

function EditPostCtrl($scope, $http, $location, $routeParams) {
  $scope.form = {};
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.form = data.post;
    });

  $scope.editPost = function () {
    $http.put('/api/post/' + $routeParams.id, $scope.form).
      success(function(data) {
        $location.url('/readPost/' + $routeParams.id);
      }).
      error(function(data) {
      $location.url('/');
      alert("Nie masz uprawnien!")
      });
  };
}

function DeletePostCtrl($scope, $http, $location, $routeParams) {
  var obj= {
    method: 'DELETE',
    withCredentials: true,
    url: '/api/post/' + $routeParams.id
    // headers:{
    //   'Accept':'application/json',
    //   'Content-Type':'application/json; charset=utf-8',
    //   'Access-Control-Request-Headers': 'X-Requested-With, content-type, accept, origin, withcredentials'
    // }
  }
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
    })

  $scope.deletePost = function () {
    $http(obj).
      success(function(data) {
        $location.url('/');
      }).
      error(function(data) {
      $location.url('/');
      alert("Nie masz uprawnien!")
      });
  };

  $scope.home = function () {
    $location.url('/');
  };
}
