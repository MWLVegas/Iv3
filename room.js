
var newRoom = function() {
  this.vnum = 0;
  this.name = "";
  this.area = "Void";
  this.exits = [];
}

var saveRoom = function(room) {

  var r = room[room.vnum];

  var json = JSON.stringify(room);
  var query = "UPDATE rooms SET room=? WHERE vnum=?;";
  db.query(query, [json, room.vnum]);
}

var loadRoom = function(vnum) {

  Util.debug("Loading room " + vnum);
  var query = "SELECT room, name, area FROM rooms WHERE vnum=?;";
  db.query(query, [ vnum], function (err, rows, field) {
    if (err) throw err;
    if ( rows.length == 0 )
    {
      Util.error("Error loading room # " + vnum);
      return;
    }
    for ( var i in rows ) {
      room[vnum] = new newRoom();
      if ( rows[i].room.length != 0 )
      {
      var json = rows[i].room;
      room[vnum] = JSON.parse(json);
      }
      room[vnum].name = rows[i].name;
      room[vnum].area = rows[i].area;
      Util.debug("Done with room " + vnum);
    }

  });
}

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
}

module.exports.loadRooms = loadRooms;
module.exports.newRoom = newRoom;
