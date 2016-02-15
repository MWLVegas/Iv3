
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
    var query = "SELECT room, name, area FROM rooms WHERE vnum=?;";
    db.query(query, [ vnum], function (err, rows, field) {
      if (err) throw err;
      if ( rows.length == 0 )
      {
        Util.error("Error loading room # " + vnum);
        return;
      }
      for ( var i in rows ) {
        if ( rows[i].pfile.length == 0 )
          return;

        var json = rows[i].room;
        room[vnum] = JSON.parse(json);
        room[vnum].name = rows[i].name;
        room[vnum].area = rows[i].area;
      }

    });


  };

}

module.exports.newRoom = newRoom;
