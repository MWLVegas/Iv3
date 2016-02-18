require("./include.js");

async.waterfall([
    function(callback) {
      Util.info("Attempting DB Connection");
      database.connect( config.dbpassword);
      callback(null);
    },
    function(callback) {
      setTimeout( function() { 
      Room.loadRooms();
      callback(null); }, 1500);
    },
    function(callback) {
      Util.info("Recovering copyover details");
      act_wiz.recoverCopyover();
      callback(null);
    },
    function(callback) {
      server.listen(listenport);
      callback(null);
    }

], function(err, result) {
  Util.info("Server loaded.");
});

process.on('exit', function() {
  Util.info("Shutting down ...");
  server.close();
});


