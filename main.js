require("./include.js");

async.waterfall([
    function(callback) {
      Util.info("Attempting DB Connection");
      database.connect( config.dbpassword);
      callback(null,callback);
    },
    function(arg, callback) {
      setTimeout( function() { 
      Room.loadRooms();
      callback(null, callback); }, 1500);
    },
    function(arg,callback) {
      Util.info("Recovering copyover details");
      act_wiz.recoverCopyover();
      callback(null,callback);
    },
    function(arg, callback) {
      act_update.loadTimers();
      callback(null,callback);
    },
    function(arg, callback) {
      server.listen(listenport);
      callback(null, callback);
    }

], function(err, result) {
  Util.info("Server loaded.");
});

process.on('exit', function() {
  Util.info("Shutting down ...");
  server.close();
});


