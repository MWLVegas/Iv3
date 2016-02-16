//var Util = require('./util.js');
GLOBAL.copyoverdat = {};

var recoverCopyover = function() {
    var file = fs.readFile('copyover.dat', function( err, data ) {
    if ( err ) { 
      Util.info("No copyover data found.");
      return;
    }
    copyoverdat = JSON.parse(data);
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

module.exports.doCopyover = doCopyover;
module.exports.recoverCopyover = recoverCopyover;

