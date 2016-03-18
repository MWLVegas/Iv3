Util.info(__filename + " loaded.");

var mysql = require('mysql');

GLOBAL.db;

module.exports = {

	connect: function( pass ) {
	

db  = mysql.createConnection( {

  host     : 'localhost',
  password : pass,
  user     : 'raum',
  database : 'iv3',
});
db.connect( function(err) { 
if ( err ) { Util.info("Error connecting to database.");
return; 
}

Util.info("Database connection established.");

});


	}

};



