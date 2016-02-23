Util.info(__filename + " loaded.");

var channelChat = function ( socket, msg, format, targ )
{
  var name = player[socket.id].name;

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
    Util.msg(socket,format, "chat");
  else if ( targ == "others")
  {
    for ( var x in player )
    {
      if ( player[x].name != player[socket.id].name && player[x].state == 4  )
        Util.msg(player[x].sock,format,"chat");
    }
  }
}


var doOOC = function( socket,msg) {

  var social;
  async.waterfall( [
      function(callback) { 
        social = isSocial(msg, socket,  "##19B[##BBBOOC##19B] ##EEE%2");
        callback(social,callback);
      },
      function(arg,callback) {
        if ( social == false ) 
          channelChat( socket, msg, "##19B[##BBBOOC##19B] ##EEE%1: %2");

        callback(null,callback);
      } ], function( err, results ) {

      });

};

var doGossip = function(socket,msg) { 
  channelChat( socket, msg,  "##90B(Gossip)##EEE %1: %2");
}

module.exports.doOOC = doOOC;
module.exports.doGossip = doGossip;

var isSocial = function(msg, socket, channel) { 

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
  Util.debug("Target: " + target);

  var query = "SELECT * FROM social WHERE name=?;"
    db.query(query, social, function( err, rows, fields, target) { 
      if ( err ) { throw err; return false }

      Util.debug("#1: Target: " + target);
      Util.debug("T2: " + t2);

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
          Util.debug("No Target");
          var name = player[socket.id].name;
          var target = player[socket.id].name;

          if ( channel == null ) {
            Util.msg(socket,cnoarg.variable(name,target,name), "chat");
            Util.msgroom( player[socket.id].room, onoarg.variable(name,target,name), player[socket.id].name, "chat");
          }
          else {
            channelChat(socket, cnoarg.variable(name,target,name), channel, "self");
            channelChat(socket, onoarg.variable(name,target,name), channel, "others");
          }
        }
        else if ( player[socket.id].name.toLowerCase() == t2.toLowerCase() || t2.toLowerCase() == "self" ) // On Self
        {
          Util.debug("On Self: " + target);
          var name = player[socket.id].name;
          var target = player[socket.id].name;

          if ( channel == null ) {
            Util.msg(socket,char_self.variable(name,target,name), "chat");
            Util.msgroom( player[socket.id].room, others_self.variable(name,target,name), player[socket.id].name);
          }
          else { 
            channelChat(socket, char_self.variable(name,target,name), channel, "self");
            channelChat(socket, others_self.variable(name,target,name), channel, "others");
          }
        }
        else // Targeted
        {
          Util.debug("Targeted social: " + t2);
          var targid;
          async.waterfall( [ 
              function(callback) { 
                targid = Util.findTarget(socket, t2);
                callback(null,callback);
              },
              function(arg1,callback) { 
                if ( targid == null )
                {
                  Util.debug("Target not found");
                  Util.msg(socket,"Player not found.","chat");
                  return true;
                }

                var name = player[socket.id].name;
                var targ = player[targid].name;

                for ( var x in player ) 
                {
                  if ( channel == null ) // in room
                  {
                    if ( player[x].id == targid ) // The Target
                      Util.msg( player[x].sock, vfound.variable(name,targ,player[x].name), "chat");
                    else if ( player[x].id == player[socket.id].id ) // The player
                      Util.msg( player[x].sock, cfound.variable(name,targ,player[x].name), "chat");
                    else if ( player[x].id != player[socket.id].id && player[x].id != player[targid].id ) // Everyone else
                      Util.msg( player[x].sock, ofound.variable(name,targ,player[x].name), "chat");
                  }
                  else // Global
                  {
                    if ( player[x].state != 4 )
                      continue;

                    if ( player[x].id == targid ) // The Target
                      channelChat( player[x].sock, vfound.variable(name, targ, player[x].name), channel, "self");
                    else if ( player[x].id == player[socket.id].id ) // The player
                      channelChat( player[x].sock, cfound.variable(name, targ, player[x].name), channel, "self");
                    else if ( player[x].id != player[socket.id].id && player[x].id != player[targid].id ) // Everyone else
                      channelChat( player[x].sock, ofound.variable(name, targ, player[x].name), channel, "self");

                  }
                }

                callback(null,callback);
              }],
              function (err, results ) {
                Util.debug("Done with social");
              });
      }
    });
  Util.debug("Target End: " + target);
  return true;
}
module.exports.isSocial = isSocial;
