/**
 * Created by apple on 17/8/18.
 */
var setting = require('../Setting.js');
var Db = require('mongodb').Db;
var connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

module.exports = new Db(setting.db,new Server(setting.host,27017,{}));