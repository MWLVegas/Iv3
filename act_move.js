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

var canMove = function(socket, dir ) {
  var vnum = player[socket.id].room;

  Util.debug("Attempting to move " + dir );
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
    Util.msg(socket,"You do not seem to be able to go that way.");
    return false;
  }

  var toRoom = exits[dir];

  if ( !rooms[toRoom] ) {
    Util.msg(socket,"The room you are heading to does not seem to exist.");
    return false;
  }

  var name = player[socket.id].name;
  var msg;
  if ( dir == "up" || dir == "down" )
    msg = dir + "wards";
  else
    msg = "to the " + dir;

  async.waterfall([ function(callback) {
  Util.msgroom(vnum, name + " has left " + msg, name);
  Util.msg(socket,"You leave "+msg);
  Room.playerFromRoom( socket );
  callback(null,callback);
  }, function(arg, callback) {
  Room.playerToRoom(  socket, toRoom );
  callback(null,callback)
  }], function( err, results ) { 
  act_info.doLook( socket, "");
  return;
  });
}


module.exports.doNorth = doNorth;
module.exports.doSouth = doSouth;
module.exports.doEast = doEast;
module.exports.doWest = doWest;
module.exports.doUp = doUp;
module.exports.doDown = doDown;
