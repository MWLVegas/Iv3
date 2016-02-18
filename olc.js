
var doOlc = function(socket, data) {
  var cmd;

  if ( data.indexOf(" ") == -1 )
    cmd = data.toString().trim();
  else
  {
    cmd = data.substring(0,data.indexOf(" "));
  }

  data = data.substring(cmd.length).trim();
  cmd = cmd.toLowerCase();
  Util.debug("OLC Cmd: " + cmd);

  if ( olc_table[cmd] )
    olc_table[cmd].funct(socket, data);
  else
    Util.msg(socket,"Invalid OLC Command");
};

var doDesc = function(socket, data) {
  Util.debug("Running debug.");
  var room =  player[socket.id].room;
  rooms[room].desc = data;
  Util.msg(socket,"Description updated.");
};

var doRoom = function(socket,dat) {
  var info = dat.split(" ");

  if ( !info[0] || !info[1] )
  {
    Util.msg(socket,"Syntax: olc room <direction> <vnum>");
    return;
  }

  var vnum = player[socket.id].room;
  var toRoom = +info[1];
  var dir = info[0].substring(0,1).toLowerCase();
  var create = info[2];

  if ( toRoom == "NaN" )
  {
    Util.msg(socket,"That's not a valid room.");
    return;
  }

  dir = getDir(dir);

  if ( !goodDir(dir) )
  {
    Util.msg(socket,"That is not a valid direction.");
    return;
  }

  if ( !rooms[vnum] ) {
    if ( create != undefined )
    {
      async.waterfall([ function( callback) {
        createRoom(vnum);
        callback(null,callback);
      }, function(arg,callback) {

      }], function( err, results ) {
        Util.msg(socket,"Room created.");
      });
    }
    else
    {
      Util.msg(socket,"Room does not exist.");
      return;
    }
  }

  if ( rooms[vnum].exits[dir] )
  {
    Util.msg(socket,"That direction already exists.");
    return;
  }

  linkRoom(vnum,toRoom,dir);
  Util.msg(socket,"One-Way Link Created");

};

var getDir = function(dir) {
  switch( dir.toLowerCase().substring(0,1)) {
    case "s": dir = "south"; break;
    case "n": dir = "north"; break;
    case "w": dir = "west"; break;
    case "e": dir = "east"; break;
    case "d": dir = "down"; break;
    case "u": dir = "up"; break;
  }
  return dir;

}

var doUnlink = function(socket, dat ) {
  var dir = dat.substring(0,1);
  var room = player[socket.id].room;

  dir = getDir(dir);
  if ( !goodDir(dir) )
  {
    Util.msg(socket,"Invalid direction.");
    return;
  }

  if ( !rooms[room].exit[dir] )
  {
    Util.msg(socket,"That direction doesn't exist.");
    return;
  }

  delete rooms[room].exit[dir];
  Util.msg(socket,"Exit deleted.");

}

var doLink = function(socket,dat) {
  var info = dat.split(" ");

  if ( !info[0] || !info[1] )
  {
    Util.msg(socket,"Syntax: olc link <direction> <vnum>");
    return;
  }

  var vnum = player[socket.id].room;
  var toRoom = +info[1];
  var dir = info[0].substring(0,1).toLowerCase();
  var create = info[2];

  Util.debug("Attempting to link room: " + vnum + " " + dir + "to " + toRoom); 

  if ( toRoom == "NaN" )
  {
    Util.msg(socket,"That's not a valid room.");
    return;
  }

  dir = getDir(dir);

  if ( !goodDir(dir) )
  {
    Util.msg(socket,"That is not a valid direction.");
    return;
  }

  if ( !rooms[toRoom] ) {
    Util.debug("Room #"+ toRoom + " doesn't exist: " + rooms[toRoom]);
    if ( create != undefined )
    {
      async.waterfall([ function(callback) { 
        createRoom(toRoom);
        callback(null,callback);
      }, function(arg,callback) {
        callback(null,callback);

      }], function( err, results ) { 
        Util.msg(socket,"Room created.");
      });
    }
    else
    {
      Util.msg(socket,"Room does not exist.");
      return;
    }
  }

  if ( rooms[vnum].exits[dir] )
  {
    Util.msg(socket,"That direction already exists.");
    return;
  }

  if ( rooms[toRoom].exits[opposite(dir)] )
  {
    Util.msg(socket,"The target room already has that exit.");
    return;
  }

  linkRoom(vnum, toRoom, dir);
  linkRoom(toRoom,vnum, opposite(dir) );
  Util.msg(socket,"Two way link created");
};

var linkRoom = function( vnum, toRoom, dir ) {
  rooms[vnum].exits[dir] = toRoom;
}

var doCreate = function(socket, data ) {
  var vnum = +data;

  if ( vnum == "NaN" )
  {
    Util.msg(socket,"Error on room creation - invalid number.");
    return;
  }

  if ( rooms[vnum] )
  {
    Util.msg(socket,"That room already exists.");
    return;
  }

  async.waterfall( [ function(callback) {
    createRoom(vnum);
    callback(null,callback);
  }, function(arg1,callback) {
    Util.debug("Should be true: " + rooms[vnum]);
    callback(null,callback);
  }
  ], function( err, results )
  {
    Util.msg(socket,"Room created.");
  });
};

var createRoom = function( vnum ) {
  async.waterfall([
      function(callback) { 
        rooms[vnum]= new Room.newRoom(vnum);

        callback(null, callback);
      }, function(arg1, callback ) {
        Util.debug("Should be true: " + rooms[vnum]);
        rooms[vnum].vnum = vnum;
        rooms[vnum].name = "New Room";
        rooms[vnum].area = getAreaName(vnum);
        callback(null,callback);
      }], function(err, results) 
      {
        Util.debug("Room should have created");
      });


}

var getAreaName = function( vnum ) {
  return "The Void";
  // TODO
}

var opposite = function (dir) {
  switch( dir ) {
    case "north": dir = "south"; break;
    case "south": dir = "north"; break;
    case "east": dir = "west"; break;
    case "west": dir = "east"; break;
    case "up": dir = "down"; break;
    case "down": dir = "up"; break;
  }

  return dir;
};

var goodDir = function(dir) {

  switch( dir ) {
    default: return false;
    case "north":
    case "south":
    case "east":
    case "west":
    case "up":
    case "down": return true;
  }

};

module.exports.doOlc = doOlc;
module.exports.loadOLC = loadOLC;

var loadOLC = function() {
  setTimeout( function() {

    OLCcreateCommand("desc", doDesc);

    OLCcreateCommand("link", doLink);
    OLCcreateCommand("room", doRoom);
    OLCcreateCommand("unlink", doUnlink);


    OLCcreateCommand("create", doCreate);
  }, 1500);

}

function OLCcreateCommand(name, func) {
  //  Util.debug("OLC Command: " + name);
  olc_table[name] = { name: name, funct: func };
}

var olc_table = [];
loadOLC();

