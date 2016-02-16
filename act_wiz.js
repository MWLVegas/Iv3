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

    Util.debug("Copyover info: " + data);
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
        for ( var x in player ) {
          if ( player[x].state == 4 )
          {
            copyover[player[x].id] = player[x].name;
            player[x].sock.emit('copyover','');
            socket.emit("info", "<img src='http://kefka.redcrown.net/images/fmv/disex.png'><br />");
            socket.emit("info", "##0AFThe bright flash of the Light of Judgement covers the land!".color());
          }

        }
        if ( copyover.size != 0 )
        {
          stream.once('open', function(fd) {
            Util.debug("Writing " + copyover);
            stream.write( JSON.stringify(copyover));
            stream.end();});
        }
        callback(null,null);

      },
      function(arg,callback) {
        Util.info("Saved players. Rebooting.");
        callback(null,null);
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
        callback(null);
      },
      function(arg,callback) {
          Util.info("Saving Mobs.");
      }], function( err, results )
      {
        Util.msg(socket,"World saved.");
      });


}

module.exports.doCopyover = doCopyover;
module.exports.recoverCopyover = recoverCopyover;
module.exports.doAsave = doAsave;
