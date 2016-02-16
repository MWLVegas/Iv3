GLOBAL.readfile = require('read-file');
GLOBAL.net = require('net');
GLOBAL.color = require('colour');
GLOBAL.io = require('socket.io');
GLOBAL.crypto = require('crypto-js');
GLOBAL.async = require('async');
GLOBAL.fs = require('fs');
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

GLOBAL.act_wiz = require('./act_wiz.js');

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

var bannedTags = ['a','img', 'object', 'iframe', 'div', 'span', 'font', 'applet', 'b', 'br', 'area', 'audio', 'aside', 'body', 'center', 'ul', 'li', 'form', 'frame', 'frameset', 'input', 'button', 'header', 'i', 'html', 'style', 'link', 'meta', 'menu', 'p', 'pre', 'ruby', 'script', 'strong', 'strike', 'textarea', 'td', 'table', 'tr', 'var'];

var emotes = [
  [':\\\)', 'icon_smile.gif'],
  [':\\\(', 'icon_sad.gif' ],
  [':D', 'icon_lol.gif' ],
  ['XD', 'icon_lol.gif' ],
  [':heart:', 'heart.gif' ],
  ['\\<3', 'heart.gif' ],
  [':P', 'icon_razz.gif' ],
  [':p', 'icon_razz.gif' ]

];

function applyEmotesFormat(body) {
  for (var i = 0; i < emotes.length; i++) {
    body = body.replace(new RegExp(emotes[i][0], 'gi'), '<img src="http:\/\/ivalicemud.com\/icon\/' + emotes[i][1] + '">');
  }
  return body;
}


String.prototype.forChat = function () {
  var str = this.trim();
  var str = this.replace(/\<3/g,":heart:");
  str = str.striptag(bannedTags);

  return applyEmotesFormat(str);
}
module.exports.forChat = String.prototype.forChat;
