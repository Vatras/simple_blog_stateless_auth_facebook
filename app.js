/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var cookieParser = require('cookie-parser')
var config = require('./config'); // get our config file
var User   = require('./models/user'); // get our mongoose model
var auth = require("./auth.js")();
var jwt = require("jwt-simple");
var cfg = require("./auth_config.js");
var users = require("./users.js");
var app = module.exports = express.createServer();


// Configuration
mongoose.connect(config.database);
app.configure(function(){
  app.set('superSecret', config.secret);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(auth.initialize());
  app.use(morgan('dev'));
  //app.use(bodyParser);//express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/partials/:name', routes.partials);

// JSON API

app.get('/api/posts', api.posts);

app.get('/api/post/:id', api.post);
app.post('/api/post', api.addPost);
app.put('/api/post/:id', api.editPost);
app.delete('/api/post/:id', auth.authenticate(), api.deletePost);

app.post("/token", function(req, res) {
  if (req.body.email && req.body.password) {
    var email = req.body.email;
    var password = req.body.password;
    var user = users.find(function(u) {
      return u.email === email && u.password === password;
    });
    if (user) {
      var payload = {id: user.id,date: new Date().getTime()};
      var token = jwt.encode(payload, cfg.jwtSecret)
      res.cookie('JWT',token, { maxAge: 900000, httpOnly: true });
      res.json({token: token});
    } else {
      res.status(401);
    }
  } else {
    res.status(401);
  }
});

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
