Util.info(__filename + " loaded.");

var doNorth = function(socket, msg )
{
  if ( !canMove(socket,"north") )
    return;
}

var doSouth = function(socket,msg)
{
  if ( !canMove(socket,"south") )
    return;
}

var doEast = function(socket,msg)
{
  if ( !canMove(socket,"east") )
    return;
}

var doWest = function(socket,msg)
{
  if ( !canMove(socket,"west") )
    return;
}

var doUp = function(socket,msg)
{
  if ( !canMove(socket,"up") )
    return;
}

var doDown = function(socket,msg)
{
  if ( !canMove(socket,"down") )
    return;
}

var canMove = function( character, dir ) {
  var vnum = character.room;//player[socket.id].room;

//  Util.debug("Attempting to move " + dir );
  if ( vnum == -1 ) {
    Util.error("Player tried to move and is not in room!");
    return false;
  }

  if ( !rooms[vnum] ) {
    Util.error("Player is in an invalid room!");
    return false;
  }

  var exits = rooms[vnum].exits; //JSON.parse(rooms[vnum].exits);


  if ( !exits[dir] )
  {
    Util.msg(character.player.socket,"You do not seem to be able to go that way.");
    return false;
  }

  var toRoom = exits[dir];

  if ( !rooms[toRoom] ) {
    Util.msg(character.player.socket,"The room you are heading to does not seem to exist.");
    return false;
  }

  var name = character.name;//player[socket.id].name;
  var msg;
  if ( dir == "up" || dir == "down" )
    msg = dir + "wards";
  else
    msg = "to the " + dir;

  async.waterfall([ function(callback) {
    Util.msgroom(vnum, name + " has left " + msg, name);
    Util.msg(character.player.socket,"You leave "+msg);
    var stuff = Rooms.playerFromRoom( character );

    callback(stuff,callback);
  }, function(arg, callback) {
    Rooms.playerToRoom( character, toRoom );
    callback(null,callback)
  }], function( err, results ) { 
    act_info.doLook( character, "");
    return;
  });
}


module.exports.doNorth = doNorth;
module.exports.doSouth = doSouth;
module.exports.doEast = doEast;
module.exports.doWest = doWest;
module.exports.doUp = doUp;
module.exports.doDown = doDown;
