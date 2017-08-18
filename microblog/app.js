var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var settings = require('./Settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var expressLayouts = require('express-ejs-layouts');//layout
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log',{flags:'a'});//visit log
var errorLogfile = fs.createWriteStream('error.log',{flags:'a'});//error log

var index = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger({stream:accessLogfile}));//log
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);//layout
// app.use('/users', users);

//session
app.use(session({
    secret: settings.cookieSecret,
    store: new MongoStore({
        db:settings.db,
        url: 'mongodb://localhost/blog'
    })
}));
app.use(flash());//错误提示

//增加视图
app.use(function(req, res, next){
    var error = req.flash('error');
    var success = req.flash('success');
    res.locals.user = req.session.user;
    res.locals.error = error.length ? error : null;
    res.locals.success = success ? success : null;
    next();
});
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
