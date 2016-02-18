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
        stream.once('open', function(fd) {

          for ( var x in player ) {
            if ( player[x].state == 4 )
            {
              copyover[player[x].id] = player[x].name;
              player[x].sock.emit('copyover','');
               player[x].sock.emit("info", "<img src='http://kefka.redcrown.net/images/fmv/disex.png'><br />");
               player[x].sock.emit("info", "##0AFThe bright flash of the Light of Judgement covers the land!".color());
            }

          }
          //        stream.once('open', function(fd) {
          Util.debug("Writing " + copyover);
          stream.write( JSON.stringify(copyover));
          stream.end();});
        callback(null, stream);
        },
        function(arg,callback) {
          Util.info("Saved players. Rebooting.");
          callback(null,callback);
        }], function(err, results ) {
          Util.info("Exiting.");
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

module.exports.doCopyover = doCopyover;
module.exports.recoverCopyover = recoverCopyover;
module.exports.doAsave = doAsave;
