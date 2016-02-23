Util.info(__filename + " loaded.");


module.exports = function character(socket) {

//var character = function() {
  this.name = "Unknown";
  this.ip = socket.client.conn.remoteAddress.substr(7);
  this.sock = socket;
  this.id = socket.id.toString();//.substring(2);
  this.state = 0;
  this.room = 1;
  this.pass = "";

  this.inventory;
  this.equipment;
  this.affects;

  this.gil = 0;
  this.exp = 0;
  this.level = 1;

  this.hp = 20;
  this.mana = 20;

  this.max_hp = 20;
  this.max_mana = 20;

  this.class = 0;

  socket.emit('id', this.id);
  socket.emit('connect', "");
  Util.info("Connect: " + this.ip + " - " + this.id);

}

var removePlayer = function( character ) {
  if ( player[character] )
  {
  Room.playerFromRoom( player[character.id] );
  }
}

GLOBAL.classTable = {};

var blackmage = { name: "Black Mage",
  hp: 3,
  mana: 8
};

classTable[0] = blackmage;
//  blackmage: { name: "Black Mage" },
//  whitemage: { name: "White Mage" },
//  fighter: { name: "Fighter" },
//  thief: { name: "Thief" }


module.exports.removePlayer = removePlayer;
//module.exports.classTable = classTable;
