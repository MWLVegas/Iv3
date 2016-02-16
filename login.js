
module.exports = {

    checkNewUser : function ( name, socket) {
      Util.debug("Checking " + name + " for new user");
      player[socket.id].id = socket.id.toString();//.substring(2);
      
      socket.emit("id", player[socket.id].id);


      var query = "SELECT name,passwd FROM players WHERE name=?";
      db.query(query, name, function( err, rows, fields ) {
        if (err) throw err;

        if ( rows.length == 0 )
        {
          Util.debug("no char found");
          socket.emit("clear","");
          socket.emit("login","Character not found. Try 'new' to begin.");
          io.state(socket,0);

          return;
        }
        for ( var i in rows ) {
          Util.debug("Character found. Requesting password with ID " + player[socket.id].id.toString() );
          socket.emit("login", "Enter your password:");
          player[socket.id].pass = rows[i].passwd;
          player[socket.id].name = rows[i].name;
          io.state(socket,1);
        }

      });
      return;
      }

};

