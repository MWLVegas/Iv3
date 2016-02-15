GLOBAL.readfile = require('read-file');
GLOBAL.net = require('net');
GLOBAL.color = require('colour');
GLOBAL.io = require('socket.io');
GLOBAL.crypto = require('crypto-js');
GLOBAL.async = require('async');
var striptags = require('striptags');

   GLOBAL.room = require('./room.js');
   GLOBAL.login = require('./login.js');
   GLOBAL.Util = require('./util.js');
   GLOBAL.database = require('./database.js');
   GLOBAL.io = require('./socket.js');
   GLOBAL.functions = require('./functions.js');
   GLOBAL.character = require('./character.js');
   GLOBAL.config = require('./config.js');
   GLOBAL.save = require('./save.js');

String.prototype.cap = function() {
   return this.charAt(0).toUpperCase() + this.toLowerCase().slice(1);
}

module.exports.cap = String.prototype.cap;



String.prototype.color = function(pre) {

  var str;
  
  if ( pre )
    str = "<span style='color:#fff; white-space:pre-wrap'>" + this;
  else
    str =  "<span style='color:#fff; white-space:pre-wrap'>" + this;


  do {
    var pos = str.indexOf("##");
    var color = str.substr(pos+2,3);
//    Util.debug("Pos: " + pos + " Color: " + color);
  if ( pre )    
    str = str.replace("##"+color, "</span><span style='white-space: pre; color:#" + color + ";'>");
  else
        str = str.replace("##"+color, "</span><span style='word-wrap: break-word; color:#" + color + ";'>");

  }
  while (str.indexOf("##") != -1 );
str = str.replace(/(?:\r\n|\r|\n|\n\r)/g, '<br \>');
  return str + "</span>";
  
}

module.exports.color = String.prototype.color;

String.prototype.striptag = function() {
  return striptags(this);
}

module.exports.striptag = String.prototype.striptag;
