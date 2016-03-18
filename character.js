
Util.info(__filename + " loaded.");


var removePlayer = function( character ) {

  Rooms.playerFromRoom(character);

  var guid = character.guid;

  /*
  for ( var x in characters )
  {
    if ( characters[x].guid == character.guid )
    {
      Util.debug("Removing character " + x);
      characters.splice(x,1);
      break;
    }
  }
  for ( var x in players )
  {
    if ( players[x].guid == character.guid )
    {
      Util.debug("Removing player " + x);
      players.splice(x,1);
      break;
    }
  } */

    Util.debug("Character extracted: " + character.name );

    players[guid] = null;
    characters[guid] = null;
    delete characters[guid];
    delete players[guid];

    character.player = null;
    character.mob = null;
    delete character.mob;
    delete character.player;
    character = null;
    delete character;

//    delete players[character.player.id];
//    delete character.player;
//    delete charcter;


  //  if ( player[character] )
  //  {
  //  Room.playerFromRoom( player[character.id] );
  //  }
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

var extractCharacter = function( character ) {
  Room.playerFromRoom(character);
  if ( character.player != undefined && character.player != null )
    delete players[character.player.id];

  for ( var x in character )
  {
    if ( characters[x].guid == character.guid )
    {
      characters.splice(x,1);
      return;
    }
  }



}

module.exports.extractCharacter = extractCharacter;
