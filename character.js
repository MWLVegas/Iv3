
module.exports = function character(socket) {

//var character = function() {
  this.name = "Unknown";
  this.ip = socket.client.conn.remoteAddress.substr(7);
  this.sock = socket;
  this.id = socket.id.toString();//.substring(2);
  this.state = 0;
  this.room = -1;
  this.pass = "";

  this.inventory;
  this.equipment;
  this.affects;

  this.gil = 0;
  this.exp = 0;
  this.level = 1;

  socket.emit('id', this.id);
  socket.emit('connect', "");
  Util.info("Connect: " + this.ip + " - " + this.id);

}

var removePlayer = function( character ) {
  Room.removeFromRoom( player[character.id] );
}


module.exports.removePlayer = removePlayer;
