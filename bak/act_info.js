var Util = require('./util.js');


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

var doLook = function(socket,msg) { 
  console.log("Running look. Only once. jackass.");

  var room = rooms[player[socket.id].room];
//
//  if ( room == undefined ) {
//    Util.msg(socket,"An error has occurred.");
//    Util.error("Player reporting room " + player[socket.id].room + " but no room found.");
//    return;
//  }
//
//  var exits = false;
//  var info = "##4DD" + room.name + " ##FFF[##CCC" + room.vnum + "##FFF] <br />" + 
//    "##DDD" + room.desc + " <br /> <br />" + 
//    "##4E0( Exits:" ;
  Util.debug("Exits before loop: " + room.exits);
  for ( var y in room.exits )
  {
    console.log(room.exits[y]);
    //    Util.debug("Exit: " + y );
//    if ( !exits ) 
//      exits = true;
//    info = info + " " + y.toString();
  }
  if ( !exits )
  {
    Util.debug("No exits.");
//    info = info + " none!";
  }

//  info = info + ") <br /><br />";

//  for ( var x in room.players )
//  {
//    if ( player[x] && player[x].id != socket.id )
//      info = info + "##CFF&nbsp;&nbsp;&nbsp;&nbsp;"+ player[x].name + " is here. <br />";
//  }
//
//  Util.msg(socket,info);
};

module.exports.doWho = doWho;
module.exports.doLook = doLook;
