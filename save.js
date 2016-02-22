Util.info(__filename + " loaded.");


var savePlayer = function( character ) {
  var socket = player[character.id].sock;
  player[character.id].sock = null;

  var cache = [];
  var json = JSON.stringify(character, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });

  //  var json = JSON.stringify(character);
  player[character.id].sock = socket;

  var query = "UPDATE players SET pfile=?, logoff=? where name=?;";
  db.query(query, [ json, Math.floor(Date.now() / 1000), player[character.id].name ]);
  Util.info(player[character.id].name + " saved.");

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
        player[character.id].room = 1;
        Util.debug("No pfile yet.");
        savePlayer(character);
        return;

      }

      var json = rows[i].pfile;
      var socket = player[character.id].sock;
      var name = player[character.id].name;
      var id = player[character.id].id;
      var state = player[character.id].state;

      player[character.id].sock = null;
      var loaded = JSON.parse(json);
      var orig =  player[character.id];


      async.waterfall( [
          function(callback) {
            for (var y in loaded ) {
              var orig = player[id][y];
              var val = loaded[y];
              //        Util.debug(y+") Orig: " + orig + " is " + val);
              player[id][y.toString()] = loaded[y];
            }
            //Util.debug("Stuffs: " + JSON.stringify(player[character.id]) );
            callback(null,callback);

          },
          function(arg, callback) {

            // Util.debug("NEW: " +  JSON.stringify(newone) );
            //      Util.debug("Loaded Type: " + typeof(loaded) + " Old: " + typeof(old) );
            //      var newArray = loaded.concat(old).unique();

            //      player[character.id] = newone;//newArray; //JSON.parse(json);
            player[id].sock = socket;
            player[id].name = name;
            player[id].id = id;
            player[id].state = state;
            callback(null,callback);
          }, function(arg, callback) { 
            var room = player[id].room;

            player[id].room = -1;
            Room.playerToRoom(player[id], room);
          }], function(err,results) {} );  
    }

  });


};

module.exports.savePlayer = savePlayer;
module.exports.loadPlayer = loadPlayer;
