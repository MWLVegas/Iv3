
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
    cmd = data.trim().toLowerCase();
  else
  {
    cmd = data.substring(0,data.indexOf(" ").toLowerCase())
  }
    data = data.substring(cmd.length).trim();

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

var doWho = function(socket,msg) {

  Util.msg(socket, "<br />##3C3======================", "info");
var count = 0;
  for ( var x in player )
  {
    if ( player[x].state == 4)
    {
      count++;
      var str = "[%*$-3$] %*".toString();
      var arr = [ player[x].level,player[x].name ];
       Util.msg(socket, str, "info", arr );
    }
  }
  Util.msg(socket, "<br />##3C3======================", "info");
  Util.msg(socket, "Players Online: " + count);

};

var doSay = function (socket, msg) {
//  Util.info(player[socket.id].name);
   if ( msg.trim().length == 0 )
   {
     Util.msg(socket,"Say what?");
     return;
   }

   Util.msgall( "##2BC" + player[socket.id].name + " says '##7EF"+msg.toString().trim().striptag()+"##2BC'", player[socket.id].room, "chat");
};

var doQuit = function (socket, msg) {
  socket.emit("disconnect","Goodbye!");
  socket.disconnect();
};

var doOoc = function( socket,msg) {
     if ( msg.trim().length == 0 )
      {
         Util.msg(socket,"OOC what?");
            return;
      }

        Util.msgall( "##19B[##BBBOOC##19B] ##EEE" + player[socket.id].name + ": "+msg.toString().trim().striptag(), null, "chat");
};

var doGossip = function( socket,msg) {
     if ( msg.trim().length == 0 )
      {
         Util.msg(socket,"Gossip what?");
            return;
      }

        Util.msgall( "##90B(Gossip)##EEE " + player[socket.id].name + ": "+msg.toString().trim().striptag(), null, "chat");
};

var doSave = function(socket) {
  save.savePlayer( player[socket.id] );
}

var doReboot = function(socket) {
  for ( var x in player )
  {
    var sock = player[x].sock;
    save.savePlayer( player[x]);
    socket.emit("info", "<img src='http://kefka.redcrown.net/images/fmv/disex.png'><br />");
    socket.emit("info", "##0AFThe bright flash of the Light of Judgement covers the land!".color());
  }
  process.exit();

}

var doSocket = function( socket) {
  for ( var x in player )
  {
        var str = "[%*$15$] %*$20$ (%*) - %*";
        var arr = [ player[x].ip, player[x].name, player[x].state, player[x].id ];
        Util.msg(socket,str.color(true),"info", arr);
  }

}

function loadFunctions() {
// Command table

  setTimeout( function() {

    createCommand("say", doSay);
    createCommand("ooc", doOoc);
    createCommand("gossip", doGossip);

    createCommand("who", doWho);
    createCommand("quit", doQuit);

    createCommand("reboot", doReboot,500);
    createCommand("socket", doSocket, 500);

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


//loadFunctions();
