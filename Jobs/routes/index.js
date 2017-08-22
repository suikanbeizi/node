var express = require('express');
var router = express.Router();
var crypto = require('crypto');//加密
var User = require('../models/user.js');
var formidable = require('formidable');
var fs = require('fs');
var domain = "http://localhost:3000";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});
router.get('/reg',checkNotLogin);
router.get('/reg', function(req, res, next) {
    req.session.passwordError = null;
    res.render('reg', { title: 'reg' });
});

router.post('/reg',checkNotLogin);
router.post('/reg', function(req, res, next) {
    if(req.body['password1'] !== req.body['password']){
        req.session.passwordError = '两次密码不一致';
        return res.redirect('/reg');
    }
    if( req.body['username'] === ''){
        req.session.passwordError = '用户名不能为空';
        return res.redirect('/reg');
    }
    if( req.body['password'] === '' && req.body['password1'] === ''){
        req.session.passwordError = '密码不能为空';
        return res.redirect('/reg');
    }
    req.session.passwordError = null;
    var MD5 = crypto.createHash('md5');
    var password = MD5.update(req.body.password).digest('base64');
    var newUser = new User({
        name : req.body.username,
        password : password,
    });
    User.get(newUser.name,function(err,user){
        if(user) {
            err = 'Username already exist';
        }
        if (err){
            return res.send(err);
        }
        newUser.save(function (err) {
            if (err) {
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            res.redirect('/putBasic');
        })
    })

});

router.post('/login',checkNotLogin);
router.post('/login', function(req, res, next) {
    var MD5 = crypto.createHash('md5');
    var password = MD5.update(req.body.password).digest('base64');
    User.get(req.body.username,function (err,user) {
        if(!user){
            req.session.nameError = '用户名错误';
            return res.redirect('/login');
        }
        if(user.password !== password){
            req.session.nameError = '密码错误';
            return res.redirect('/login')
        }
        req.session.user = user;
        req.session.nameError = null;
        return res.redirect('/');
    });

});

router.get('/login',checkNotLogin);
router.get('/login', function(req, res, next) {
    req.session.nameError = null;
    res.render('login', { title: 'login' });
});
//logout
router.get('/logout',checkLogin);
router.get('/logout', function(req, res, next) {
    req.session.user = null;
    // req.flash('success','logout success');
    return res.redirect('/');
});

//填写基本信息
router.get('/putBasic',checkLogin);
router.get('/putBasic',function(req, res, next){
    req.session.faviconPath = null;
    res.render('basic',{ title: '基本信息填写-我的简历'});
});

router.post('/putBasic',checkLogin);
router.post('/putBasic',function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = 'public/upload/images';
    form.keepExtensions = true;//后缀名
    form.parse(req,function (err, fields, files) {
       if(err){
           return res.redirect('/')
       }
        var extName = '';  //后缀名
        switch (files.favicon.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }

        var avatarName = Math.random() + '.' + extName;
        //图片写入地址；
        var newPath = form.uploadDir +'/'+ avatarName;
        //显示地址；
        var showUrl;
        if(extName.length === 0){
            showUrl = domain + '/upload/images/' + avatarName;
        }
        else{
            showUrl = '';
        }
        fs.renameSync(files.favicon.path, newPath);  //重命名
        req.session.faviconPath = showUrl;
        var newUserBasic = {
            username: fields.username,
            edu: fields.edu,
            workTime: fields.workTime,
            tel: fields.tel,
            email: fields.email,
            city: fields.city,
            favicon: showUrl
        };
        User.update(req.session.user.name,newUserBasic,function (err,doc) {
           if(err){
               return res.redirect('/putBasic');
           }
           res.redirect('/workExperience')

        });
    });



});

function checkLogin(req,res,next) {
    if(!req.session.user){
        req.session.nameError = '请登录';
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
