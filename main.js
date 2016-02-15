require("./include.js");

Util.debug("Attempting DB Connection : " + config.dbpassword);
database.connect( config.dbpassword );

setTimeout( function() {

server.listen( listenport );
}, 1200);

process.on('exit', function() {
  Util.info("Shutting down ...");
  server.close();
});

console.log("Your mom".striptag());

