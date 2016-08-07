/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api');

var session = require('cookie-session');//cookie session to achieve stateless server!
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var cookieParser = require('cookie-parser')
var config = require('./config'); // get our config file
var auth = require("./auth.js")();
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
  app.use(cookieParser(config.secret));
  app.use(session({secret: "superSecret"}));
  app.use(auth.initialize());
  app.use(auth.passport.session());
  //app.use(auth.parseToken);
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

app.get('/auth/facebook', auth.authenticateFacebook());

app.get('/auth/facebook/callback',auth.authenticateFacebook());

app.get('/customLogin', auth.authenticateCustom(), routes.index);
app.get('/partials/:name', routes.partials);

// JSON API

app.get('/api/posts', api.posts);

app.get('/api/post/:id',api.post);
app.post('/api/post', auth.ensureAuthenticated,  api.addPost);
app.put('/api/post/:id', auth.ensureAuthenticated,api.editPost);
app.delete('/api/post/:id', auth.ensureAuthenticated, api.deletePost);

app.post("/token", auth.createToken);

app.get('/register', routes.register);
app.get('/error/:id', routes.errorWithReason);
app.get('/error', routes.error);
app.post('/register', api.addUser);
app.get('*', routes.index);

// Start server

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
