
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.facebook = function(req, res){
  res.sendfile('views/facebook.html');
};
exports.login = function(req, res){
  res.render('login');
};
exports.register = function(req, res){

  res.render('register');
};

exports.errorWithReason = function(req, res){
  res.render('error',{"reason":req.params.id});
};
exports.error = function(req, res){
  res.render('error');
};
exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};