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
  $http.post('/api/addPostId').
  success(function(data) {
    $scope.form.id = data.id;
    $scope.form.version = 0;
  });
  $scope.submitPost = function () {
    $http.put('/api/post/' + $scope.form.id, $scope.form).
    success(function(data) {
      if(data)
        $location.url('/');
    }).
    error(function(data,status) {
      if(status==409)
        alert("Ktoś w miedzyczasie podmienił wersje")
    });
  };
}


// function AddCommentCtrl($scope, $http, $routeParams) {
//   $scope.form = {};
//   $scope.submitComment = function () {
//     $http.post('/api/comment/'+ $routeParams.id, $scope.form).
//     success(function(data) {
//       $location.path('/');
//     }).
//     error(function(data) {
//       $location.url('/');
//       alert("Nie masz uprawnien!")
//     });
//   };
// }

function ReadPostCtrl($scope, $http, $location, $routeParams) {
  $scope.pagination=[];
  $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
      $scope.post = data.post;
      var commentsNumber=data.post.commentsNumber;
      var numberOfPages=(commentsNumber%2 == 0) ? parseInt(commentsNumber/2) : parseInt(commentsNumber/2)+1;

      for(var i=0;i<numberOfPages;i++)
      {
        $scope.pagination.push(i+1)
        
      }
      // $scope.comments = data.post.comments;
    });
  $scope.getCommentPage = function (page) {
    $http.get('/api/comment/' + $routeParams.id+'/'+page).
    success(function(data) {
      $scope.post.comments = data.comments;

    })
  }
  $scope.form = {};
  $scope.submitComment = function () {
    $http.put('/api/comment/'+ $routeParams.id, $scope.form).
    success(function(data) {
      $location.path('/');
    }).
    error(function(data) {
      $location.url('/');
      alert("Nie masz uprawnien!")
    });
  };
  $scope.deleteAllComments = function () {
    $http.delete('/api/comments/'+ $routeParams.id).
    success(function(data) {
      $location.path('/');
    }).
    error(function(data) {
      $location.url('/');
      alert("Nie masz uprawnien!")
    });
  };
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
      if(data)
        $location.url('/readPost/' + $routeParams.id);
      }).
      error(function(data,status) {
      if(status==409)
        alert("Ktoś w miedzyczasie podmienił wersje")
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
