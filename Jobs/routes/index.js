var express = require('express');
var router = express.Router();
var crypto = require('crypto');//加密
var User = require('../models/user.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

router.get('/reg', function(req, res, next) {
    res.render('reg', { title: 'reg' });
});

router.post('/reg', function(req, res, next) {
    if(req.body['Password-again'] !== req.body['Password']){
        // req.flash('error','两次输入的口令不一致');
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
            // req.flash('error', err);

        newUser.save(function (err) {
            if (err) {

                return res.redirect('/reg');
            }
            req.session.user = newUser;
            // req.flash('success', 'reg success');
            res.redirect('/');
        })


    })
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'login' });
});
module.exports = router;
