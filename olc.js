
var doOlc = function(socket, data) {
  var cmd;

  if ( data.indexOf(" ") == -1 )
    cmd = data.toString().trim();
  else
  {
    cmd = data.substring(0,data.indexOf(" "));
  }

  data = data.substring(cmd.length).trim();
  cmd = cmd.toLowerCase();
  Util.debug("OLC Cmd: " + cmd);

  if ( olc_table[cmd] )
    olc_table[cmd].funct(socket, data);
  else
    Util.msg(socket,"Invalid OLC Command");
};

var doDesc = function(socket, data) {
  Util.debug("Running debug.");
  var room =  player[socket.id].room;
  rooms[room].desc = data;
  Util.msg(socket,"Description updated.");
};


module.exports.doOlc = doOlc;
module.exports.loadOLC = loadOLC;

var loadOLC = function() {
  setTimeout( function() {

    OLCcreateCommand("desc", doDesc);

  }, 1500);

}

function OLCcreateCommand(name, func) {
  Util.debug("OLC Command: " + name);
  olc_table[name] = { name: name, funct: func };
}

var olc_table = [];
loadOLC();

