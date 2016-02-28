Util.info(__filename + " loaded.");

var minute_update;
var second_update;
var tick_update;

var SECOND = 1000;
var MINUTE = SECOND * 60;
var PULSE_PER_SECOND = 4;

var tick_timer = SECOND * 30;

var timezone = 'America/Los_Angeles';

var loadTimers = function() {

  setInterval( every_tick, tick_timer );
  setInterval( every_minute, MINUTE );
  setInterval( every_second, SECOND);

};

module.exports.loadTimers = loadTimers;

var every_tick = function() {
  tick_timer = SECOND * ( Math.random() * (95 - 45) + 45 ) * SECOND;
};

var every_minute = function() {
};

var every_second = function() {
  updateClientBars();
};



function updateClientBars() {
  var info;

  for ( var x in sockets ) {
    if ( sockets[x].state != 4 )
      continue;


    info = sockets[x].character.hp +":"+ sockets[x].character.maxhp+ ":" + sockets[x].character.mana + ":" + sockets[x].character.maxmana;

    sockets[x].socket.emit("barUpdate",info);

  }

}



