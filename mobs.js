Util.debug(__filename + " loaded");

GLOBAL.mobindex = {};

module.exports = function mobindex(id) {
  this.name = "new mob";
  this.desc = "This is a new mob.";
  this.room = "A new mob is here";
  this.level = 0;

  this.id = 0;

  this.rank = 0;
  this.gil = 0;

  this.skills = {};
  this.flags = {};

  this.stats = {};

  this.stats.ingame = 0;
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

  var json = JSON.stringify(m);

  var query = "INSERT INTO mobs (vnum, name, area, mob_data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE mob_data=?;";
  db.query(query, [id, m.name, m.area,  json, json]);
}

module.exports.saveMobs = saveMobs;

