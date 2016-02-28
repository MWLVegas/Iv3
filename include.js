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

GLOBAL.config = require('./config.js');
GLOBAL.Util = require('./util.js');
GLOBAL.Dec = require('./declares.js');

GLOBAL.Rooms = require('./room.js');
GLOBAL.Mobs = require('./mobs.js');
GLOBAL.Objs = require('./objs.js');

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
GLOBAL.act_comm = require('./act_comm.js');

String.prototype.cap = function() {
  return this.charAt(0).toUpperCase() + this.toLowerCase().slice(1);
}

module.exports.cap = String.prototype.cap;

String.prototype.color = function(pre) {

  var data =  "<span style='color:#fff; white-space:pre-wrap'>" + this;
makeRandomColor();

  do {
    var pos = data.indexOf("##");
    var color = data.substr(pos+2,3);
//        Util.debug("Pos: " + pos + " Color: " + color);
    data = data.replace("##"+color, "</span><span style='white-space:pre-wrap; word-wrap: break-word; color:#" + color + ";'>");
  }
  while (data.indexOf("##") != -1 );

  data = data.replace(/\{G/g,'</span><span style="color:#55ff55">');
  data = data.replace(/\{C/g,'</span><span style="color:#55ffff">');
  data = data.replace(/\{R/g,'</span><span style="color:#ff5555">');
  data = data.replace(/\{M/g,'</span><span style="color:#ff55ff">');
  data = data.replace(/\{Y/g,'</span><span style="color:#ffff55">');
  data = data.replace(/\{W/g,'</span><span style="color:#fff">');
  data = data.replace(/\{\*/g,'</span><span style="color:'+config.randColor+'">');
  data = data.replace(/\{X/g,'</span><span style="color:#fff">');
  data = data.replace(/\{x/g,'</span><span style="color:#fff">');
  data = data.replace(/\{d/g,'</span><span style="color:#fff">');
  data = data.replace(/\{b/g,'</span><span style="color:#0000AA">');
  data = data.replace(/\{g/g,'</span><span style="color:#00AA00">');
  data = data.replace(/\{c/g,'</span><span style="color:#00AAAA">');
  data = data.replace(/\{r/g,'</span><span style="color:#AA0000">');
  data = data.replace(/\{m/g,'</span><span style="color:#AA00AA">');
  data = data.replace(/\{y/g,'</span><span style="color:#FFAA00">');
  data = data.replace(/\{w/g,'</span><span style="color:#AAAAAA">');
  data = data.replace(/\{D/g,'</span><span style="color:#555555">');
  data = data.replace(/\{B/g,'</span><span style="color:#5555FF">');

  data = data.replace(/(?:\r\n|\r|\n|\n\r)/g, '<br \>');
  return data + "</span>";

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

String.prototype.variable = function(user, target) {

  var str = this;

  str = str.replace(/\$n/g, user);
  str = str.replace(/\$m/g, "him");
  str = str.replace(/\$s/g, "his");
  str = str.replace(/\$e/g, "he");

  str = str.replace(/\$N/g, target);
  str = str.replace(/\$M/g, "him");
  str = str.replace(/\$S/g, "his");
  str = str.replace(/\$E/g, "he");


  return str;
}

module.exports.variable = String.prototype.variable;

function Character() {
  this.name = "";
  this.short_desc = "";
  this.long_desc = "";

  this.isnpc = false;

  this.hp = 20;
  this.maxhp = 20;
  this.mana = 20;
  this.maxmana = 20;

  this.room = -1;

  this.level = 1;
  this.gil = 0;
  this.exp = 0;

  this.mob = null;
  this.player = null;

  this.job = 0;

  this.guid = Util.createguid();

  characters[this.guid] = this;
  //  characters.push(this);
}

function Room(id) {
  this.id = id;
  this.name = "New Room";
  this.area = "";
  this.desc = "";

  this.exits = {};
  this.in_room = [];
  this.obj_in_room = [];
}

function Mob(id) {
  this.index = -1;
}

function Player(id) {
  this.socket = null;
  this.id = null;
  this.pass = "";
  this.account = "";
  this.orig_name = "";
  this.title = "";

  this.editor = -1;
  this.edit = -1;
}

function Socket(sock) {
  this.socket = sock;
  this.character = null;
  this.player = null;
  this.ip = sock.client.conn.remoteAddress.substr(7);
  this.id = sock.id;
  this.state = 0;
  this.guid = Util.createguid();
}

module.exports.Room = Room;
module.exports.Mob = Mob;
module.exports.Character = Character;
module.exports.Player = Player;
module.exports.Socket = Socket;

function makeRandomColor(){
  config.randColor = '#'+Math.random().toString(16).substr(-6);
/*
    var c = '';
      while (c.length < 7) {
            c += (Math.random()).toString(16).substr(-6).substr(-1)
                }
        config.randColor = "#"+c;
        */
}
