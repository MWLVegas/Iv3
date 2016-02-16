require("./include.js");

Util.debug("Attempting DB Connection : " + config.dbpassword);
database.connect( config.dbpassword );

async.waterfall([
    function(callback) {
      room.loadRooms();
      callback(null);
    },
    function(callback) {
      Util.info("Recovering copyover details");
      act_wiz.recoverCopyover();
      callback(null);
    },
    function(callback) {
      server.listen(listenport);
    }
], function(err, result) {
  Util.info("Server loaded.");
});

process.on('exit', function() {
  Util.info("Shutting down ...");
  server.close();
});


