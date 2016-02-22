Util.info(__filename + " loaded.");

var doWho = function(socket,msg) {

  Util.msg(socket, "<br />##3C3======================", "info");
  var count = 0;
  for ( var x in player )
  {
    if ( player[x].state == 4)
    {
      count++;
      var str = "[%*$-3$ %*$10$] %*".toString();
      var arr = [ player[x].level, classTable[ player[x].class].name, player[x].name ];
      Util.msg(socket, str, "info", arr );
    }
  }
  Util.msg(socket, "<br />##3C3======================", "info");
  Util.msg(socket, "Players Online: " + count);

};

var doLook = function(socket,msg) { 

  var room = rooms[player[socket.id].room];

  if ( room == undefined ) {
    Util.msg(socket,"An error has occurred.");
    Util.error("Player reporting room " + player[socket.id].room + " but no room found.");
    return;
  }

  var exits = false;
  var info = "<br />##4DD" + room.name + " ##FFF[##CCC" + room.vnum + "##FFF] <br />" + 
    "##DDD" + room.desc + " <br /> <br />" + 
    "##4E0[Exits:" ;

  var roomExits = room.exits;//JSON.parse(room.exits);

  for ( var y in roomExits )
  {
    if ( !exits ) 
      exits = true;
    info = info + " " + y;
  }
  if ( !exits )
  {
    info = info + " none!";
  }

  info = info + "] <br /><br />";

  for ( var x in room.players )
  {
    if ( player[x] && player[x].id != socket.id )
      info = info + "##CFF&nbsp;&nbsp;&nbsp;&nbsp;"+ player[x].name + " is here. <br />";
  }

  Util.msg(socket,info);
};

var doWhois = function(socket,msg) {

  var name = msg.firstWord();

  var query = "SELECT logoff FROM players WHERE name=?;";
  db.query(query, [ name ], function (err, rows, field) {
    if (err) throw err;
    if ( rows.length == 0 )
    {
      Util.msg("That player was not found.");
      return;
    }
    for ( var i in rows ) {
      var stamp = rows[i].logoff;
      var logoff = new Date(stamp);
      var curr = moment() / 1000;

      var remainingDate = moment(curr).diff(logoff);
//      var inp = moment.seconds(remainingDate).format("D H m s");
      Util.msg(socket,name.cap() + " was last seen " + remainingDate.lengthFormat() + " ago.");
        return;

      }
  });
}

module.exports.doWho = doWho;
module.exports.doLook = doLook;
module.exports.doWhois = doWhois;
