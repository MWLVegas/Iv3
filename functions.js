Util.info(__filename + " loaded.");


var commandList = [];
var aliasList = [];
var invalid = "Invalid command.";

loadFunctions();
loadAliases();

module.exports.commandList = commandList;
module.exports.aliasList = aliasList;
module.exports.invalid = invalid;

var checkCommand = function(data, character)
{
  var orig = data;

  if ( character == undefined )
  {
    Util.debug("No commands from undf character");
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
          social = act_comm.isSocial(cmd + " " + data, character,  null);
          }
//          Util.debug("Social: " + social + " Data: " + data);
          callback(social,callback);
        },
        function(arg,callback) {

          if ( social == false ) 
          {
            if ( character.player != undefined && character.player.edit != -1 ) // player[socket.id].edit != -1 ) // check OLC
            {
              olc.doOlc(character,orig);
              return;
            }

            if ( commandList[cmd] )
            {
              if ( character.level < commandList[cmd].level )
              {
                Util.msg(character.player.socket,invalid);
                return;
              }
              commandList[cmd].funct(character, data);
              return;
            }
            if ( aliasList[cmd] )
            {
              checkCommand(aliasList[cmd].alias + " " + data, character);
              return;
            }

            Util.msg(character.player.socket,invalid);
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

var doSay = function (character, msg) {
  //  Util.info(player[socket.id].name);
  if ( msg.trim().length == 0 )
  {
    Util.msg(character.player.socket,"Say what?");
    return;
  }

  Util.msgall( "##2BC" + character.name + " says '##7EF"+msg.forChat()+"##2BC'", character.room, "chat");
};

var doQuit = function (character, msg) {

  if ( character.player == null )
    return;

  async.waterfall( [ 
      function(callback) { 
  save.savePlayer( character ); //player[socket.id]);
  Util.msg(character.player.socket,"Saving!");
  callback(null, callback);
  sockets[ character.player.id ].state = 0;
      },
      function(arg, callback) { 
  //  character.removePlayer( player[socket.id] );
  Util.msgroom( character.room, character.name + " slowly fades out of sight.", character.name);
  character.player.socket.emit("disco","disco");

//  character.player.socket.disconnect();
  callback(null,callback) } ], function( err, results) { Util.debug("Player has quit"); });

//  setTimeout( function() { character.removePlayer( player[socket.id] ); }, 10);
  //  socket.disconnect();
};


var doSave = function(character) {
  save.savePlayer( character );
  Util.msg(character.player.socket,"Saved!");
}

var doSocket = function(character) {
  for ( var x in sockets )
  {
        var str = "[%*$15$] %*$20$ (%*) - %*";
        var arr = [ sockets[x].ip, sockets[x].player.name, sockets[x].state, sockets[x].id ];
        Util.msg( character.player.socket, str.color(true), "info", arr);
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
//    createCommand("gossip", act_comm.doGossip);

    createCommand("look", act_info.doLook);
    createCommand("whois", act_info.doWhois);


    createCommand("who", act_info.doWho);
    createCommand("quit", doQuit);

    createCommand("gameinfo", doGameinfo);
    createCommand("copyover", act_wiz.doCopyover,500);
//    createCommand("asave", act_wiz.doAsave,500);
    createCommand("socket", doSocket, 500);
///    createCommand("push", doPush, 500);

//    createCommand("olc", olc.doOlc, 500);
//    createCommand("edit", olc.doEdit, 500);
//    createCommand("done", olc.doDone, 500);

    createCommand("save", doSave);

    Util.info("Command list loaded");

  }, 1000);
//  Util.info(commandList);
}

function createAlias(name,alias) {
  aliasList[name] = {name: name, alias: alias };
}

function createCommand(name, func, level) {
  if ( level == undefined )
    level = -1;

  commandList[name] = {name: name, funct: func, level: level};
}


var doGameinfo = function( character ) {
  var info = [];

  info.push("Rooms: " + Object.keys(rooms).length );
  info.push("Mobs: " + mobs.length );
  info.push("Sockets: " + Object.keys(sockets).length );
  info.push("Players: " + players.length );
  info.push("Characters: " + characters.length );
  for ( var x in info )
  {
    Util.msg(character.player.socket,info[x]);
  }
    
}

