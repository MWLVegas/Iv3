Util.info(__filename + " loaded.");

var doDone = function( socket, data ) {
  player[socket.id].editor = -1;
  player[socket.id].edit = -1;
  Util.msg(socket,"Exiting Editor");
}
module.exports.doDone = doDone;

var doEdit = function(socket,data ) {
  if ( data.indexOf(" ") == -1 )
    cmd = data.toString().trim();
  else
  {
    cmd = data.substring(0,data.indexOf(" "));
  }
  data = data.substring(cmd.length).trim();

  if ( data.length == 0 )
  {
    Util.msg(socket,"Invalid ID number");
    return;
  }

  switch( cmd.toLowerCase() )
  {
    default: Util.msg(socket,"Invalid editor."); return;
    case "room": player[socket.id].editor = 0; break;
    case "mob": player[socket.id].editor = 1; break;
    case "obj": player[socket.id].editor = 2; break;
  }

  player[socket.id].edit = Number(data);
  Util.msg(socket,"Entering " + olc_edittable[player[socket.id].editor].name + " editor: ID: " + player[socket.id].edit);
 return;
}

module.exports.doEdit = doEdit;

var room = {name : "Room", num: 0 };
var mob = {name : "Mob", num: 1 };
var obj = {name : "Object", num:2};
var olc_edittable = [];

olc_edittable.push(room,mob,obj);

Util.debug( olc_edittable );
olc_edittable[room.num] = room;
olc_edittable[mob.num] = mob;
olc_edittable[obj.num] = obj;

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

  if ( player[socket.id].edit == -1 || player[socket.id].editor == -1)
  {
    Util.msg(socket,"You are not editing anything.");
    return;
  }

  for ( var x in olc_table )
  {
    if ( olc_table[x].type != player[socket.id].editor )
      continue;

    if ( x == cmd )
    {
      olc_table[cmd].funct(socket, data);
      return;
    }

  }
   Util.msg(socket,"Invalid OLC Command");
};

var doRoomDesc = function(socket, data) {
  var room =  player[socket.id].room;
  rooms[room].desc = data;
  Util.msg(socket,"Description updated.");
};

var doRoomRoom = function(socket,dat) {
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

var doRoomUnlink = function(socket, dat ) {
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

var doRoomLink = function(socket,dat) {
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
  Util.debug("Typeof: " + typeof(rooms[vnum].exits));
  Util.debug("Curr: " + rooms[vnum].exits);
  Util.debug("Linking room " + vnum + " to " + toRoom + " " + dir);
  rooms[vnum].exits[dir] = toRoom;
  Util.debug("Now: " + rooms[vnum].exits);
}

var doRoomCreate = function(socket, data ) {
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

    OLCcreateCommand("desc", doRoomDesc, room.num);
    OLCcreateCommand("link", doRoomLink, room.num);
    OLCcreateCommand("room", doRoomRoom, room.num);
    OLCcreateCommand("unlink", doRoomUnlink, room.num);
    OLCcreateCommand("create", doRoomCreate, room.num);
  }, 1500);

}

function OLCcreateCommand(name, func, type) {
  //  Util.debug("OLC Command: " + name);
  olc_table[name] = { name: name, funct: func, type: type };
}

var olc_table = [];
loadOLC();

