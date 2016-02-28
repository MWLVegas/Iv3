Util.info(__filename + " loaded.");

var channelChat = function ( character, msg, format, targ )
{
  var name = character.name;
//  Util.debug("Chan Chat: " + name);
  if ( msg == undefined || msg.trim().length == 0 )
    return;

  msg = msg.forChat();

  if ( msg == undefined || msg.trim().length == 0 )
    return;

  format = format.replace(/%1/g,name);
  format = format.replace(/%2/g,msg);

  if ( targ == "all" || targ == undefined )
    Util.msgall(format, null, "chat");
  else if ( targ == "self" )
    Util.msg(character.player.socket,format, "chat");
  else if ( targ == "others")
  {
    for ( var x in sockets )
    {
      if ( sockets[x].name != name && sockets[x].state == 4 )
        Util.msg( sockets[x].socket,format,"chat");
    }
  }
}


var doOOC = function(character,msg) {

  var social;
  async.waterfall( [
      function(callback) { 
        social = isSocial(msg, character,  "##19B[##BBBOOC##19B] ##EEE%2");
        callback(social,callback);
      },
      function(arg,callback) {
        if ( social == false ) 
          channelChat( character, msg, "##19B[##BBBOOC##19B] ##EEE%1: %2");

        callback(null,callback);
      } ], function( err, results ) {

      });

};

var doGossip = function(socket,msg) { 
  channelChat( socket, msg,  "##90B(Gossip)##EEE %1: %2");
}

module.exports.doOOC = doOOC;
module.exports.doGossip = doGossip;

var isSocial = function(msg, character, channel) { 

  if ( msg.charAt(0) != "/" )
    return false;

  //  Util.debug("Social Received Data: " + msg);
  var data = msg.split(" ");
  var social = data[0].substring(1);
  var target = data[1];

  if ( target != undefined ) 
  {
    target = target.trim();
    if ( target.length == 0 )
      target = undefined;
  }

  var row;
  var t2 = target;
//  Util.debug("Target: " + target);

  var query = "SELECT * FROM social WHERE name=?;"
    db.query(query, social, function( err, rows, fields, target) { 
      if ( err ) { throw err; return false }

//      Util.debug("#1: Target: " + target);
//     Util.debug("T2: " + t2);

      if ( rows.length == 0 )
      {
        return false;
      }

      row = rows[0];

      var cnoarg = row.char_no_arg;
      var onoarg = row.others_no_arg;

      var cfound = row.char_found;           var ofound = row.others_found;         var vfound = row.vict_found;
      var char_not_found = row.char_not_found;         var char_self = row.char_auto;         var others_self = row.others_auto;

      if ( t2 == undefined ) // No Target
      {
//        Util.debug("No Target");
        var name = character.name;
        var target = character.name;

        if ( channel == null ) {
          Util.msg(character.player.socket,cnoarg.variable(name,target,name), "chat");
          Util.msgroom( character.room, onoarg.variable(name,target,name), character.name, "chat");
        }
        else {
          channelChat(character, cnoarg.variable(name,target,name), channel, "self");
          channelChat(character, onoarg.variable(name,target,name), channel, "others");
        }
      }
      else if ( character.name.toLowerCase() == t2.toLowerCase() || t2.toLowerCase() == "self" ) // On Self
      {
//        Util.debug("On Self: " + target);
        var name = character.name;
        var target = character.name;

        if ( channel == null ) {
          Util.msg(character.player.socket,char_self.variable(name,target,name), "chat");
          Util.msgroom( character.room, others_self.variable(name,target,name), character.name);
        }
        else { 
//          Util.debug("Character: " + character.name);
          channelChat(character, char_self.variable(name,target,name), channel, "self");
          channelChat(character, others_self.variable(name,target,name), channel, "others");
        }
      }
      else // Targeted
      {
//        Util.debug("Targeted social: " + t2);
        var targid;
        async.waterfall( [ 
            function(callback) { 
              targid = Util.findTarget(character, t2);
              callback(null,callback);
            },
            function(arg1,callback) { 
              if ( targid == null )
              {
//                Util.debug("Target not found");
                Util.msg( character.player.socket,"Player not found.","chat");
                return true;
              }

              var name = character.name;
              var targ = sockets[targid].name;

              for ( var x in sockets ) 
              {
                if ( channel == null ) // in room
                {
                  if ( sockets[x].id == targid ) // The Target
                    Util.msg( sockets[x].socket, vfound.variable(name,targ, name), "chat");
                  else if ( character.player.socket.id == sockets[x].id ) // The player
                    Util.msg( sockets[x].socket, cfound.variable(name,targ, name), "chat");
                  else if ( character.player.socket.id != sockets[x].id && sockets[x].id != targid ) // Everyone else
                    Util.msg( sockets[x].socket, ofound.variable(name,targ, name), "chat");
                }
                else // Global
                {
                  if ( sockets[x].state != 4 )
                    continue;

                  if ( x == targid ) // The Target
                    channelChat( sockets[x].character, vfound.variable(name, targ, name), channel, "self");
                  else if ( x= character.player.socket.id ) // Player
                    channelChat( sockets[x].character, cfound.variable(name, targ, name), channel, "self");
                  else if ( x != character.player.socket.id && x != targid )
                    channelChat( sockets[x].character, ofound.variable(name, targ, name), channel, "self");

                }
              }

              callback(null,callback);
            }],
            function (err, results ) {
//              Util.debug("Done with social");
            });
      }
    });
//  Util.debug("Target End: " + target);
  return true;
}
module.exports.isSocial = isSocial;
