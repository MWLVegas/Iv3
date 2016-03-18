Util.info(__filename + " loaded.");

var doWho = function(character) {

  Util.msg(character.player.socket, "<br />##3C3======================", "info");
  var count = 0;

  var order = [];

  for ( var x in sockets )
  {
    if ( sockets[x].state == 4 )
    {
      order.push( sockets[x].id );
    }
  }

  order.sort( function(b,a) { return sockets[a].character.level - sockets[b].character.level});
  // player[a].level - player[b].level});


for ( var y in order )
{
  var x = order[y];
  //    for ( var a in sockets[x].character )
  //    {
  //      Util.debug(a + " : " + sockets[x].character[a]);
  //    }

  //    Util.debug("Checking " + x);
  count++;
  var str = "[%*$-3$ %*$10$] %*".toString();
  var arr = [ sockets[x].character.level, classTable[ sockets[x].character.job].name, sockets[x].character.name ];
  Util.msg( character.player.socket, str, "info", arr );
}
Util.msg(character.player.socket, "<br />##3C3======================", "info");
Util.msg(character.player.socket, "Players Online: " + count);

};

var doLook = function(character,msg) { 

  var room = rooms[character.room];
  var id = character.room;

  if ( room == undefined ) {
    //    Util.msg(socket,"An error has occurred.");
    Util.error("Player reporting room " + character.room + " but no room found.");
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

  for ( var x in room.in_room)
  {
    Util.debug("In Room: " + x + " : " + room.in_room[x].name );
    if ( character.player != null && character.name != room.in_room[x].name )
      info = info + "##CFF&nbsp;&nbsp;&nbsp;&nbsp;"+ room.in_room[x].name + " is here. <br />";
  }

  Util.msg(character.player.socket,info);
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

var doHelp = function(character, msg, wildcard) {

  if ( msg == undefined || msg.trim().length == 0 )
  {
    doHelp(character,"summary");
    return;
  }

  var query;
  if ( wildcard == true ) {
     query = "SELECT * FROM help_files WHERE keyword LIKE ?";
  }
  else
    query = "SELECT * FROM help_files WHERE keyword=?";
  var search = msg;

  db.query(query, wildcard ? [ "%"+msg+"%"] : [ msg ], function ( err, rows, field ) {
      Util.debug("Checking " + query + " with " + search);

    if ( err) throw err;
    if ( rows.length == 0 )
    {
      if ( wildcard ) {
      Util.msg(character.player.socket,"No helpfile was found with that topic.");
      }
      else
      { 
        Util.debug("No help found: Checking with Wildcard");
        doHelp( character,msg,true); 
      }
      return;
    }
    var found = false;
    for ( var i in rows ) {
      var id = rows[i].id;
      var keyword = rows[i].keyword;
      var level = rows[i].level;
      var desc = rows[i].descript;
      var see_also = rows[i].see_also;

      if ( level > character.level )
        continue;

      if ( !found ) { // First helpfile found
        found = true;
        Util.msg(character.player.socket,"##CFA"+keyword+"<p><hr width=80% />##FFF"+desc+"<p>");
        if ( see_also.trim().length > 0 )
        {
          Util.msg(character.player.socket,"<br />");
          var see = see_also.split("\n");
          for ( var x in see ) {

            Util.msg(character.player.socket,"##0CCSEE ALSO: " + see[x]);
          }
        }
        Util.msg(character.player.socket,"<br />");

      }
      else // already displayed a helpfile
      {
        Util.msg(character.player.socket,"##05AAdditional Help Found: " + keyword);
      }
    }

    if ( !found )
    {
      Util.msg(character.player.socket,"No helpfile was found with that topic.");
      return;
    }
  });
}

module.exports.doHelp = doHelp;
module.exports.doWho = doWho;
module.exports.doLook = doLook;
module.exports.doWhois = doWhois;
