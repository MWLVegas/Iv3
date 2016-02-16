var act_info = require ("./act_info.js");
var act_wiz = require ("./act_wiz.js");

var commandList = [];
var invalid = "Invalid command.";

loadFunctions();

var checkCommand = function(data, socket)
{
  if ( socket == undefined )
  {
    Util.debug("No commands from undf socket.");
    return;
  }

  var cmd;

  if ( data.indexOf(" ") == -1 )
    cmd = data.toString().trim();
  else
  {
    cmd = data.substring(0,data.indexOf(" "));
  }
  data = data.substring(cmd.length).trim();

  cmd = cmd.toLowerCase();
  if ( commandList[cmd] )
  {
    if ( player[socket.id].level < commandList[cmd].level )
    {
      Util.msg(socket,invalid);
      return;
    }
    commandList[cmd].funct(socket, data);
    return;
  }
  Util.msg(socket,invalid);
}

module.exports.checkCommand = checkCommand;

var doSay = function (socket, msg) {
  //  Util.info(player[socket.id].name);
  if ( msg.trim().length == 0 )
  {
    Util.msg(socket,"Say what?");
    return;
  }

  Util.msgall( "##2BC" + player[socket.id].name + " says '##7EF"+msg.forChat()+"##2BC'", player[socket.id].room, "chat");
};

var doQuit = function (socket, msg) {

  character.removePlayer( player[socket.id] );
  socket.emit("disconnect","Goodbye!");
  socket.disconnect();
};

var doOoc = function( socket,msg) {
  if ( msg.trim().length == 0 )
  {
    Util.msg(socket,"OOC what?");
    return;
  }

  Util.msgall( "##19B[##BBBOOC##19B] ##EEE" + player[socket.id].name + ": "+msg.forChat(), null, "chat");
};

var doGossip = function( socket,msg) {
  if ( msg.trim().length == 0 )
  {
    Util.msg(socket,"Gossip what?");
    return;
  }

  Util.msgall( "##90B(Gossip)##EEE " + player[socket.id].name + ": "+msg.forChat(), null, "chat");
};

var doSave = function(socket) {
  save.savePlayer( player[socket.id] );
}

var doReboot = function(socket) {

  async.waterfall( [
      function(callback) {
        for ( var x in player )
        {
          var sock = player[x].sock;
          save.savePlayer( player[x]);
          character.removePlayer( player[socket.id] );
          socket.emit("info", "<img src='http://kefka.redcrown.net/images/fmv/disex.png'><br />");
          socket.emit("info", "##0AFThe bright flash of the Light of Judgement covers the land!".color());
        }
        callback(null,null);
      }], function(err, results ) {
        Util.info("Save complete.");
        setTimeout( function(){ 
          process.exit(); }, 500);
      });

}

var doSocket = function( socket) {
  for ( var x in player )
  {
    var str = "[%*$15$] %*$20$ (%*) - %*";
    var arr = [ player[x].ip, player[x].name, player[x].state, player[x].id ];
    Util.msg(socket,str.color(true),"info", arr);
  }

}

var doPush = function( socket, msg )
{
  for ( var x in player )
  {
    if ( player[x].state == 4 )
    {
      player[x].sock.emit("info",msg);
    }
  }

}



function loadFunctions() {
  // Command table

  setTimeout( function() {

    createCommand("say", doSay);
    createCommand("ooc", doOoc);
    createCommand("gossip", doGossip);

    createCommand("look", act_info.doLook);
    createCommand("who", act_info.doWho);
    createCommand("quit", doQuit);

    createCommand("copyover", act_wiz.doCopyover,500);
    createCommand("asave", act_wiz.doAsave,500);
    createCommand("reboot", doReboot,500);
    createCommand("socket", doSocket, 500);
    createCommand("push", doPush, 500);

    createCommand("olc", olc.doOlc, 500);

    createCommand("save", doSave);

    Util.info("Command list loaded");

  }, 1000);
  Util.info(commandList);
}


function createCommand(name, func, level) {
  if ( level == undefined )
    level = -1;

  commandList[name] = {name: name, funct: func, level: level};
}
