
Util.info(__filename + " loaded.");


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
