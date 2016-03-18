Util.info(__filename + " loaded.");

//var Util = require('./util.js');
GLOBAL.copyoverdat = {};

var recoverCopyover = function() {
  var file = fs.readFile('copyover.dat', function( err, data ) {
    if ( err ) { 
      Util.info("No copyover data found.");
      return;
    }
    try {
      copyoverdat = JSON.parse(data);
    }
    catch (e)
    {
      Util.info("Copyover data unable to be read.");
      return;
    }

//    Util.debug("Copyover info: " + data);
    Util.info("Copyover recovery found. Waiting for connections.");

    fs.unlink('copyover.dat');
  });

}

var doCopyover = function(socket, msg) {

  async.waterfall([
      function(callback) {

        Util.debug("Starting copyover.");
        var stream = fs.createWriteStream("copyover.dat");
        var copyover = {};
        stream.once('open', function(fd) {

          for ( var x in sockets ) {
            if ( sockets[x].state == 4 )
            {
              save.savePlayer( sockets[x].character);
              copyover[sockets[x].id] = sockets[x].name;
              sockets[x].socket.emit('copyover','');
               sockets[x].socket.emit("info", "<img src='http://kefka.redcrown.net/images/fmv/disex.png'><br />");
               sockets[x].socket.emit("info", "##0AFThe bright flash of the Light of Judgement covers the land!".color());
            }

          }
          //        stream.once('open', function(fd) {
          Util.debug("Writing copyover data.");
          stream.write( JSON.stringify(copyover));
          stream.end();});
        callback(null, stream);
        },
        function(arg,callback) {
          for ( var x in sockets )
          {
            if ( sockets[x].state == 4 )
              save.savePlayer(sockets[x].character);
          }

          Util.info("Saved players. Rebooting.");
          callback(null,callback);
        }], function(err, results ) {
          process.exit();
        });

}

var doAsave = function(socket,msg) {
  async.waterfall([
      function(callback) {
        Util.info("Saving rooms.");
        for ( var x in rooms )
        {
          Room.saveRoom(x);
          Util.debug("Saved Room " + x);
        }

        Util.debug("Rooms done");

        Util.msg(socket,"Rooms saved.");
        callback(null, callback);
      },
      function(arg,callback) {
        Util.info("Saving Mobs.");
        callback(null,callback);
      }], function( err, results )
      {
        Util.msg(socket,"World saved.");
      });


}

var doLoad = function(socket,msg) {
  if ( data.indexOf(" ") == -1 )
        cmd = data.toString().trim();
    else
        {
              cmd = data.substring(0,data.indexOf(" "));
                }
      data = data.substring(cmd.length).trim();

        cmd = cmd.toLowerCase();

        if ( Number(data) == "NaN" ) {
          Util.msg(socket,"You must provide a valid ID to load.");
          return;
        }
      
        data = Number(data);

        if ( cmd == "mob" ) { // Load Mob
          if ( !mobindex[data] ) {
            Util.msg(socket,"That mob index does not exist.");
            return;
          }

          var mob = mobs.newMob(data);

        }
        else if ( cmd == "obj" ) { // load obj
        }
        else {
          Util.msg(socket,"Invalid load type.");
          return;
        }
}

module.exports.doLoad = doLoad;
module.exports.doCopyover = doCopyover;
module.exports.recoverCopyover = recoverCopyover;
module.exports.doAsave = doAsave;
