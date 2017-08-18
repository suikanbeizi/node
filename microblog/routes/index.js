var express = require('express');
var router = express.Router();
var crypto = require('crypto');//加密
var User = require('../models/user.js');
var Post = require('../models/post.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  Post.get(null,function (err,posts) {
      if(err){
          posts = [];
      }
      res.render('index',{
          posts:posts
      })
  })
});
router.get('/u/:user', function(req, res, next) {
    User.get(req.params.user,function (err, user) {
        if(!user){
            req.flash('error','user not exist');
            return res.redirect('/');
        }
        Post.get(user.name,function (err,posts) {
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('user',{
                title: user.name,
                posts: posts
            });
        })
    })
});
router.post('/post',checkLogin);
router.post('/post', function(req, res, next) {
    var currentUser = req.session.user;
    var post = new Post(currentUser.name,req.body.post);
    post.save(function (err) {
        if(err){
            return res.redirect('/');
        }
        req.flash('success','post success');
        res.redirect('/u/'+ currentUser.name);
    })
});
//删除user文章
router.get('/delArticle/:id',function (req, res, next) {
    Post.remove(req.params.id,function(err,result){
        if(!result){
            req.flash('error','remove failed');
            return res.redirect('/')
        }
        req.flash('success','remove success');
        return res.redirect('/')
    });
});

router.get('/reg',checkNotLogin);
router.get('/reg', function(req, res, next) {
  res.render('reg',{
      title:'user-reg',
  })
});
router.post('/reg',checkNotLogin);
router.post('/reg', function(req, res, next) {
    if(req.body['Password-again'] !== req.body['Password']){
        req.flash('error','两次输入的口令不一致');
        return res.redirect('/reg');
    }
    var MD5 = crypto.createHash('md5');
    var password = MD5.update(req.body.Password).digest('base64');

    var newUser = new User({
        name : req.body.username,
        password : password,
    });

    User.get(newUser.name,function(err,user){
        if(user) {
            err = 'Username already exist';
            }
        if (err)
            req.flash('error', err);

        newUser.save(function (err) {
            if (err) {

                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success', 'reg success');
            res.redirect('/');
        })


    })
});

router.get('/login',checkNotLogin);
router.get('/login', function(req, res, next) {
    res.render('login',{
        title:'login'
    })
});

router.post('/login',checkNotLogin);
router.post('/login', function(req, res, next) {
    var MD5 = crypto.createHash('md5');
    var password = MD5.update(req.body.password).digest('base64');

    User.get(req.body.username,function (err,user) {
       if(!user){
           req.flash('error','user not exist');
           return res.redirect('/login');
       }
       if(user.password !== password){
           req.flash('error','password error');
           return res.redirect('/login')
       }

       req.session.user = user;
       req.flash('success','login success');
       return res.redirect('/');
    });
});
router.get('/logout',checkLogin);
router.get('/logout', function(req, res, next) {
    req.session.user = null;
    req.flash('success','logout success');
    return res.redirect('/');
});

function checkLogin(req,res,next) {
    if(!req.session.user){
        return res.redirect('/login')
    }
    next();
}
function checkNotLogin(req,res,next) {
    if(req.session.user){
        return res.redirect('/')
    }
    next();
}
module.exports = router;
