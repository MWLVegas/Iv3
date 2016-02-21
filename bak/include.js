GLOBAL.readfile = require('read-file');
GLOBAL.net = require('net');
GLOBAL.color = require('colour');
GLOBAL.io = require('socket.io');
GLOBAL.crypto = require('crypto-js');
GLOBAL.async = require('async');
GLOBAL.fs = require('fs');
GLOBAL.moment = require('moment');
GLOBAL.CronJob = require('cron').CronJob;

var striptags = require('striptags');

GLOBAL.Room = require('./room.js');
GLOBAL.login = require('./login.js');
GLOBAL.Util = require('./util.js');
GLOBAL.database = require('./database.js');
GLOBAL.sio = require('./socket.js');
GLOBAL.functions = require('./functions.js');
GLOBAL.character = require('./character.js');
GLOBAL.config = require('./config.js');
GLOBAL.save = require('./save.js');

GLOBAL.act_info = require('./act_info.js');
GLOBAL.act_wiz = require('./act_wiz.js');
GLOBAL.act_move = require('./act_move.js');
GLOBAL.olc = require('./olc.js');
GLOBAL.act_update = require('./act_update.js');

String.prototype.cap = function() {
  return this.charAt(0).toUpperCase() + this.toLowerCase().slice(1);
}

module.exports.cap = String.prototype.cap;

String.prototype.color = function(pre) {

  var str;

  str =  "<span style='color:#fff; white-space:pre-wrap'>" + this;


  do {
    var pos = str.indexOf("##");
    var color = str.substr(pos+2,3);
    //    Util.debug("Pos: " + pos + " Color: " + color);
    str = str.replace("##"+color, "</span><span style='white-space:pre-wrap; word-wrap: break-word; color:#" + color + ";'>");

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

String.prototype.firstWord = function () {

  if ( this.indexOf(" ") == -1 )
    return this.toString().trim();

  return this.substring(0,data.indexOf(" ")).trim();

}
module.exports.firstWord = String.prototype.firstWord;
Number.prototype.lengthFormat = function() {

  var str = "";
  function numberEnding (number) {
    return (number > 1) ? 's ' : ' ';
  }

  var temp = Math.floor(this);
  var years = Math.floor(temp / 31536000);
  if (years) {
    str = str + years + ' year' + numberEnding(years);
  }
  //TODO: Months! Maybe weeks?
  var days = Math.floor((temp %= 31536000) / 86400);
  if (days) {
    str = str +  days + ' day' + numberEnding(days);
  }
  var hours = Math.floor((temp %= 86400) / 3600);
  if (hours) {
    str = str + hours + ' hour' + numberEnding(hours);
  }
  var minutes = Math.floor((temp %= 3600) / 60);
  if (minutes) {
    str = str + minutes + ' minute' + numberEnding(minutes);
  }
  var seconds = temp % 60;
  if (seconds) {
    str = str + seconds + ' second' + numberEnding(seconds);
  }

  return str.trim();
};

module.exports.lengthFormat = Number.prototype.lengthFormat;

