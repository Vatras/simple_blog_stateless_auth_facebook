//

var Post   = require('../models/post'); // get our mongoose model
var User = require('../models/user');
var data = {
  "posts": []
};

//cache the data to minimize select queries to db
function fetchData(){
  Post.find({},function (err,resp) {
    tempPosts = resp || [];
    data.posts = [];
    if (tempPosts) {
      tempPosts.forEach(function (post) {
        data.posts.push({
          id: post._id,
          title: post.title,
          text: post.text.substr(0, 50) + '...'
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
        text: post.text.substr(0, 50) + '...'
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
exports.addPost = function (req, res) {
  //data.posts.push(req.body);
  var newPost=Post({
   "text": req.body.text,
   "title": req.body.title,
   "date": new Date().getTime()
  })
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

  Post.findOne({_id: id},function (err,post) {
    if(err)
      res.json(false);
    else
    {
      post.text=req.body.text;
      post.title=req.body.title;
      post.save(function(err){

      if(err)
        res.json(false);
      fetchData()
      res.json(true);
      })
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