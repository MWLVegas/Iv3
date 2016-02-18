GLOBAL.rooms = [];

var newRoom = function(vnum) {
  this.vnum = vnum;
  this.name = "";
  this.area = "Void";
  this.desc = "";
  this.players = [];
  this.mobs = [];
  this.items = [];
  this.exits = [];
}

var saveRoom = function(room) {
  var r = rooms[room];

  delete  r.people;
  delete r.mobs;

  var json = JSON.stringify(r);
  Util.debug("Exits: " + r.exits);

  var query = "INSERT INTO rooms (vnum, name, area, room) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE room=?;";
  db.query(query, [room, r.name, r.area, json, json, room]);
};

var loadRoom = function(vnum) {
  var query = "SELECT room, name, area FROM rooms WHERE vnum=?;";
  db.query(query, [ vnum], function (err, rows, field) {
    if (err) throw err;
    if ( rows.length == 0 )
    {
      Util.error("Error loading room # " + vnum);
      return;
    }
    for ( var i in rows ) {

      rooms[vnum] = new newRoom(vnum);
      rooms[vnum].vnum = vnum;
      if ( rows[i].room.length != 0 )
      {
      var json = rows[i].room;
      rooms[vnum] = JSON.parse(json);
      }

      rooms[vnum].name = rows[i].name;
      rooms[vnum].area = rows[i].area;
    }
    Util.debug("Loaded Room " + vnum);

  });
};

var saveRooms = function() {
};

var loadRooms = function() {
  var query = "SELECT vnum FROM rooms WHERE 1";
  db.query(query, function (err, rows, field) {
    if (err) throw err;
    if ( rows.length == 0 )
    {
      Util.error("Error: No rooms Found");
      return;
    }
    for ( var i in rows ) {
      loadRoom( rows[i]. vnum );
    }
  });

  Util.info("Rooms loaded.");
};

var playerToRoom = function(plr, room) {
  if ( room == -1 )
    room = 1;

 Util.debug("Adding player to room " + room);

 async.waterfall([
     function(callback) {

  if ( player[plr.id].room != -1 )
    playerFromRoom(plr);

  if ( rooms[room].players == undefined )
    rooms[room].players = [];
  callback(null,callback);
     },
     function (arg, callback) {
        rooms[room].players[plr.id] = plr.name;
        player[plr.id].room = room;
        callback(null,callback);
     },
     function (arg,callback) {
        Util.msgroom( room, player[plr.id].name + " has arrived.", player[plr.id].name);
        callback(null,callback);
     }], function(err, results ) {
       
     });

};

var playerFromRoom = function(plr) {
  var vnum = player[plr.id].room;
  var id = player[plr.id].id;

  delete rooms[vnum].players[id];

  if ( rooms[vnum].players == undefined )
    rooms[vnum].players = [];

  player[plr.id].room = -1;
  Util.debug("Player removed from room.");
};

module.exports.loadRooms = loadRooms;
module.exports.newRoom = newRoom;
module.exports.saveRoom = saveRoom;
module.exports.playerToRoom = playerToRoom;
module.exports.playerFromRoom = playerFromRoom;
