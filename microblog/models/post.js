/**
 * Created by apple on 17/8/9.
 */
var mongodb = require('./db');
var ObjectId = require('mongodb').ObjectId;

function Post(username,post,time){
    this.user = username;
    this.post = post;
    if(time){
        this.time = time;
    }else{
        this.time = new Date();
    }
}
module.exports = Post;

Post.prototype.save = function (callback) {
    //存入Mongodb 的文档
    var post = {
        oid:1,
        user:this.user,
        post:this.post,
        time:this.time
    };
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }

        db.collection('posts',function (err,collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            //var doc = collection.findOne().sort({oid:-1}) ;

            //为user添加索引
            collection.ensureIndex('user');
            //写入post文档
            collection.insert(post,{safe:true},function(err,post){
                mongodb.close();
                callback(err,post);
            })
        })
    })
};

Post.get = function get(username,callback){
  mongodb.open(function (err,db) {
      if(err){
          return callback(err);
      }
      db.collection('posts',function(err,collection){
          if(err){
              mongodb.close();
              return callback(err);
          }
          //查找user属性为username的文档，如果username是null 则全部匹配
          var query ={};
          if(username){
              query.user = username;
          }
          collection.find(query).sort({time:-1}).toArray(function (err,docs) {
              mongodb.close();
              if(err){
                  callback(err,null)
              }
              //封装 posts为Post对象
              var posts=[];
              docs.forEach(function(doc,index){
                  var post = {oid:ObjectId(doc._id),user:doc.user ,post:doc.post ,time:doc.time};
                  posts.push(post);
              });
              callback(null,posts);
          });
      });
  });
};

Post.remove = function remove(id,callback){
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({_id:ObjectId(id)},{safe:true},function(err,result){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(err,result);
            });
        });
    });
};

