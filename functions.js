Util.info(__filename + " loaded.");


var commandList = [];
var aliasList = [];
var invalid = "Invalid command.";

loadFunctions();
loadAliases();

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

    var social = false;
    async.waterfall( [
        function(callback) {
          if ( cmd.substring(0,1) == "/" )
          {
          social = act_comm.isSocial(cmd + " " + data, socket,  null);
          }
//          Util.debug("Social: " + social + " Data: " + data);
          callback(social,callback);
        },
        function(arg,callback) {

          if ( social == false) 
          {
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
            if ( aliasList[cmd] )
            {
              checkCommand(aliasList[cmd].alias + " " + data, socket);
              return;
            }

            Util.msg(socket,invalid);
            return;
          }
          else {
 //           Util.debug("Social found.");
          }


          callback(null,callback);
        } ], function( err, results ) {

        });
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


  async.waterfall( [ 
      function(callback) { 
  save.savePlayer( player[socket.id]);
  Util.msg(socket,"Saving!");
  callback(null, callback);
      },
      function(arg, callback) { 
  //  character.removePlayer( player[socket.id] );
  Util.msgroom( player[socket.id].room, player[socket.id].name + " slowly fades out of sight.", player[socket.id].name);
  socket.emit("disco","disco");
  callback(null,callback) } ], function( err, results) { Util.debug("Player has quit"); });

//  setTimeout( function() { character.removePlayer( player[socket.id] ); }, 10);
  //  socket.disconnect();
};


var doSave = function(socket) {
  save.savePlayer( player[socket.id] );
  Util.msg(socket,"Saved!");
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


function loadAliases() {
  setTimeout( function() {
    createAlias("l", "look");
    createAlias("oco", "ooc");
    createAlias("gos", "gossip");

    createAlias("n", "north");
    createAlias("s", "south");
    createAlias("e", "east");
    createAlias("w", "west");
    createAlias("u", "up");
    createAlias("d", "down");
  },1000);

}

function loadFunctions() {
  // Command table

  setTimeout( function() {

    createCommand("north", act_move.doNorth);
    createCommand("south", act_move.doSouth);
    createCommand("east", act_move.doEast);
    createCommand("west", act_move.doWest);
    createCommand("up", act_move.doUp);
    createCommand("down", act_move.doDown);

    createCommand("say", doSay);
    createCommand("ooc", act_comm.doOOC);
    createCommand("gossip", act_comm.doGossip);

    createCommand("look", act_info.doLook);
    createCommand("whois", act_info.doWhois);


    createCommand("who", act_info.doWho);
    createCommand("quit", doQuit);

    createCommand("copyover", act_wiz.doCopyover,500);
    createCommand("asave", act_wiz.doAsave,500);
    createCommand("reboot", doReboot,500);
    createCommand("socket", doSocket, 500);
    createCommand("push", doPush, 500);

    createCommand("olc", olc.doOlc, 500);
    createCommand("edit", olc.doEdit, 500);
    createCommand("done", olc.doDone, 500);

    createCommand("save", doSave);

    Util.info("Command list loaded");

  }, 1000);
  Util.info(commandList);
}

function createAlias(name,alias) {
  aliasList[name] = {name: name, alias: alias };
}

function createCommand(name, func, level) {
  if ( level == undefined )
    level = -1;

  commandList[name] = {name: name, funct: func, level: level};
}
