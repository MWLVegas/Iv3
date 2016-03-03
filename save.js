Util.info(__filename + " loaded.");


var savePlayer = function( character  ) {

  if ( character == undefined || character.player == undefined || character == null || character.player == null )
  {

    Util.debug("Null character");
    return;
  }

  Util.debug("savePlayer: " + character.name);

  var id = character.player.id;

  var deleted = [];
  var deletedinfo = [];
  deleted.push("player");//.socket", "player.character", "player");

  for ( var x in deleted ) {
    var y = deleted[x];
    deletedinfo[x] = character[y];
    delete character[y];
  }

  var cache = [];
  var cfile = JSON.stringify(character, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  });


  for ( var x in deleted ) { // Put player elements back
    var y = deleted[x];
    character[y] = deletedinfo[x];
  }
  cache = [];


  deleted = [];
  deletedinfo = [];
  deleted.push("timeout","socket", "character", "id", "state", "pass");//.socket", "player.character", "player");

  for ( var x in deleted ) {
    var y = deleted[x];
    deletedinfo[x] = character.player[y];
    delete character.player[y];
  }

  var pfile = JSON.stringify(character.player, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  });

  for ( var x in deleted ) { // Put player elements back
    var y = deleted[x];
    character.player[y] = deletedinfo[x];
  }

  //  var json = JSON.stringify(character);
  //  player[character.id].sock = socket;

  var query = "UPDATE players SET guid=?, cfile=?, pfile=?, logoff=? where name=?;";
  db.query(query, [ character.guid, cfile, pfile, Math.floor(Date.now() / 1000), character.name ]);
  Util.info( character.name + " saved.");

};

var loadPlayer = function( id ) {
  var query = "SELECT guid, cfile, pfile FROM players WHERE name=?;";
  Util.debug("loadPlayer: " + sockets[id].name);
  db.query(query, [ sockets[id].name ], function (err, rows, field) {
    if (err) throw err;
    if ( rows.length == 0 )
    {
      Util.error("Error reading player file for " + sockets[id].name);
      Util.msg(character.player.socket,"There has been an error reading your player file. Report this to Raum.");
      return;
    }
    for ( var i in rows ) {

      Util.debug("Guid: " + rows[i].guid);
      if ( rows[i].guid != null && rows[i].guid != undefined && rows[i].guid.toString().trim().length != 0 )
      {
        sockets[id].guid = rows[i].guid;
        sockets[id].character.guid = sockets[id].guid;
      }
      else
      {
        Util.debug("No Guid found - Using premade " + sockets[id].guid);
        sockets[id].character.guid = sockets[id].guid;
      }

      if ( rows[i].pfile.length == 0 || rows[i].cfile.length == 0 )
      {
        sockets[id].character.room = 1;
        sockets[id].character.name = sockets[id].name;
        Util.debug("No pfile yet.");
        savePlayer( sockets[id].character);
        return;

      }

      var cfile = JSON.parse(rows[i].cfile);
      var pfile = JSON.parse( rows[i].pfile);

      async.waterfall( [
          function(callback) {
            for (var y in pfile ) {
              var val = pfile[y];
              sockets[id].player[y.toString()] = pfile[y];
            }
            Util.debug("Pfile loaded");
            callback(null,callback);

          },
          function(arg, callback) {
            for (var y in cfile ) {
              var val = cfile[y];
              sockets[id].character[y.toString()] = cfile[y];
            }
            Util.debug("cFile loaded");

            callback(null,callback);
          }, function(arg, callback) { 
            var room = sockets[id].character.room;

            sockets[id].character.room = -1;
            Rooms.playerToRoom( sockets[id].character, room);

            callback(null,callback);
          }], function(err,results) {
          
//            for ( var x in players )
//            {
//              if ( players[x].name == sockets[id].name )
//              {
//                players.splice(x,1);
//                break;
//              }
//            }

//            players.push(sockets[id].player);

          } );  
    }

  });


};

module.exports.savePlayer = savePlayer;
module.exports.loadPlayer = loadPlayer;
