
var savePlayer = function( character ) {
  var socket = player[character.id].sock;
  player[character.id].sock = null;

  var json = JSON.stringify(character);
  player[character.id].sock = socket;

  var query = "UPDATE players SET pfile=?, logoff=? where name=?;";
  db.query(query, [ json, Math.floor(Date.now() / 1000), player[character.id].name ]);

};

var loadPlayer = function( character ) {
  var query = "SELECT pfile FROM players WHERE name=?;";
  db.query(query, [ player[character.id].name ], function (err, rows, field) {
    if (err) throw err;
    if ( rows.length == 0 )
    {
      Util.error("Error reading player file for " + player[character.id].name);
      Util.msg(character,"There has been an error reading your player file. Report this to Raum.");
      return;
    }
    for ( var i in rows ) {
      if ( rows[i].pfile.length == 0 )
      {
        Util.debug("No pfile yet.");
        return;
     
      }

      var json = rows[i].pfile;
      var socket = player[character.id].sock;
      var name = player[character.id].name;
      var id = player[character.id].id;
      var state = player[character.id].state;

      player[character.id] = JSON.parse(json);
      player[character.id].sock = socket;
      player[character.id].name = name;
      player[character.id].id = id;
      player[character.id].state = state;

      var room = player[character.id].room;
      player[character.id].room = -1;
      Room.playerToRoom(player[character.id], room);
    }

  });


};

module.exports.savePlayer = savePlayer;
module.exports.loadPlayer = loadPlayer;
