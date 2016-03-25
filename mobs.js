Util.debug(__filename + " loaded");

GLOBAL.mobindex = {};
GLOBAL.mobs = {};


var newMob = function(id) {
  var clone = JSON.parse(JSON.stringify(mobindex[id]));
  var mob = clone[id];
  mobs.push(mob);
}

var loadMob = function(id) {
  var query = "SELECT mob_data, name, area FROM mobs WHERE vnum=?;";
  db.query(query, [id], function (err, rows, field) {
    if (err) throw err;
    if ( rows.length == 0 )
    {
      Util.error("Error mob # " + id + " : Doesn't exist");
      return;
    }

    for ( var i in rows ) {

      mobindex[id] = new mobindex(id);
      mob.index[id].id = id;

      if ( rows[i].mob_data == undefined )
        continue;

      var json = JSON.parse( rows[i].mob_data );

      for ( var x in json )
        mobindex[id][x] = json[x];

      //      if ( rows[i].mob_data.length != 0 )
      //      {
      //        var json = rows[i].mob_data;
      //        mobindex[id] = JSON.parse(json);
      //      }

      mobindex[id].name = rows[i].name;
      mobindex[id].area = rows[i].area;

    }
  });
}

var loadMobs = function() {
  var query = "SELECT vnum FROM mobs";
  db.query(query, [], function( err, rows, field ) {
    if ( err ) throw err;
    if ( rows.length == 0 )
    {
      Util.info("No mobs found to load.");
      return;
    }

    for ( var i in rows ) {
      loadMob(i);
    }
  });

}

module.exports.loadMobs = loadMobs;

var saveMobs = function() {

  for ( var x in mobindex )
  {
    saveMob( mobindex[x].id);
  }
}

var saveMob = function(id) {
  var m = mob_index(id);
  var cache = [];
  var json = JSON.stringify(m, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  });

  var query = "INSERT INTO mobs (vnum, name, area, mob_data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE mob_data=?;";
  db.query(query, [id, m.name, m.area,  json, json]);
}

module.exports.saveMobs = saveMobs;

