/**
 * Created by apple on 17/8/8.
 */
//数据库连接
var setting = require('../Settings.js');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

module.exports = new Db(setting.db , new Server(setting.host,27017,{}))