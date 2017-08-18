/**
 * Created by apple on 17/8/8.
 */
// 操作数据库
var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.time = new Date();
}
module.exports = User;

User.prototype.save = function save (callback) {
    //存入mongodb 的文档
    var user={
        name:this.name,
        password:this.password,
        time:this.time
    };
    
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取user的集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //为name属性添加索引
            collection.ensureIndex('name',{unique:true});

            //写入user文档

            collection.insert(user,{safe:true},function (err,user) {
                mongodb.close();
                callback(err,user);
            })
        })
    })
};

User.get = function get(username ,callback) {
  mongodb.open(function (err,db) {
      if(err){
          return callback(err);
      }
      //读取user的集合
      db.collection('users',function(err,collection){
          if(err){
              mongodb.close();
              return callback(err);
          }
          //查找name 属性为username的文档
          collection.findOne({name:username},function (err,doc) {
              mongodb.close();
              if(doc){
                  //封装文档为 User 对象
                  var user = new User(doc)
                  callback(err,user);
              }else{
                  callback(err,null);
              }
          })
      })
  })
};