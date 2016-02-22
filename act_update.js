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
  for ( var x in player ) {
    if ( player[x].state != 4 )
      continue;


    info = ( Number(player[x].hp)/Number(player[x].max_hp))*100 + ":" + (Number(player[x].mana)/Number(player[x].max_mana))*100;

    player[x].sock.emit("barUpdate",info);

  }

}



