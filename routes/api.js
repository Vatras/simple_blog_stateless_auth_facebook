//

var Post   = require('../models/post'); // get our mongoose model
var User = require('../models/user');
var data = {
  "posts": []
};

function deleteDummies(){
  var now = new Date().getTime();
  Post.remove({'text':"", date: {$lt : now-1440000}}, function(err) {
      if (err) throw "deleteDummies error"
  })
}

exports.deleteDummiesCron = function(){ //runs everyday at 01:00:00 am

  var now = new Date()
  var next = new Date()
  next.setHours(1)
  next.setMinutes(0)
  next.setSeconds(0)
  next.setDate(now.getDate()+1)
  setTimeout(function(){
    deleteDummies();
    setInterval(deleteDummies,1440000);
  },next.getTime())

}
//cache the data to minimize select queries to db
function fetchData(){
  Post.find({'text':{$ne : ""}},function (err,resp) {
    tempPosts = resp || [];
    data.posts = [];
    if (tempPosts) {
      tempPosts.forEach(function (post) {
        data.posts.push({
          id: post._id,
          title: post.title,
          //text: post.text.substr(0, 50) + '...'
        });
      });
    }
  });
}
fetchData();
// GET
exports.posts = function (req, res) {

  res.json({
    posts: data.posts
  });
};

exports.post = function (req, res) {
  var id = req.params.id;

  Post.findOne({_id:id},function (err,post) {
    if(err)
      res.json(false);
    else
      res.json({'post':{
        id: post._id,
        title: post.title,
        //text: post.text.substr(0, 50) + '...',
        version: post.version,
        comments: (post.comments)? post.comments.slice(0,2) : [],
        commentsNumber: (post.comments)? post.comments.length : 0
      }})
  })
};

// POST
exports.addUser = function (req, res) {
  User.findOne({'email':req.body.email},function(err,user){
    if(!user)
    {
      var newUser=User({ "email" : req.body.email, "password" : req.body.password});
      newUser.save(function(err){
        if (err)
        {
         res.redirect("/error")
        }

        console.log('User created!');
        res.redirect("/")
      });

    }
    else{
      res.redirect("/error/User already exists")
    }
  })
}


exports.addPostId = function (req, res) {
  var newPost=Post({"date": new Date().getTime(),
                    "text": "",
                    "title": "",
                    "version": 0})

  newPost.save(function(err,post){
    res.json({id: post._id})
    if (err) throw err;
  })
}
exports.addPost = function (req, res) {
  //data.posts.push(req.body);
  req.body.text
  req.body.title

  // var newPost=Post({
  //  "text": req.body.text,
  //  "title": req.body.title,
  //  "date": new Date().getTime(),
  //  "version": 1
  // })
  newPost.save(function(err){
        if (err) throw err;

  console.log('Post created!');
    fetchData()
  });
  res.json(req.body);
};

// PUT

exports.editPost = function (req, res) {
  var id = req.params.id;
  var version = req.body.version;
  Post.findOne({_id: id,
                'version':version},function (err,post) {
    if(err)
      res.json(false);
    else if(post)
    {
      post.text=req.body.text;
      post.title=req.body.title;
      post.version++;
      post.save(function(err){

      if(err)
        res.json(false);
      fetchData()
      res.json(true);
      })
    }
    else
    {
      res.status(409);
      res.json(false);
    }
  })
};

// DELETE
exports.deletePost = function (req, res) {
  var id = req.params.id;

  Post.remove({ _id: id }, function(err) {
    if(err)
      res.json(false);

    fetchData()
    res.json(true);
  })

};

exports.addComment = function (req, res) {
  var id = req.params.id;
  var comment = req.body.text;
  var author = req.body.author;
  Post.findOne({_id: id},function (err,post) {
    if(err)
      res.json(false);
    else
    {
      if(typeof post.comments == "undefined")
        post.comments=[];
      post.comments.push({'author':author,'text':comment})
      post.save(function(err){
        if(err)
          res.json(false);
        fetchData()
        res.json(true);
      })
    }
  })
};
exports.deleteAllComments = function (req, res) {
  var id = req.params.id;

  Post.findOne({ _id: id }, function(err,post) {
    if(err)
      res.json(false);
    if(!post)
      res.json(false);
    post.comments=[];
    post.save(function(err){
      if(err)
        res.json(false);
      res.json(true);
    })

  })

};

exports.getCommentPage = function (req, res) {
  var id = req.params.id;
  var page = req.params.page;
  var from =(page-1)*2
  if (page<1)
    res.json(false);
  Post.findOne({_id:id},function (err,post) {
    if(err || post.comments.length<from)
      res.json(false);
    else
      res.json({
        comments: (post.comments)? post.comments.slice(from,from+2) : []
      })
  })
  }