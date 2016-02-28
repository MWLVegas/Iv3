Util.info(__filename + " loaded");

var is_npc = function( character ) {

  if ( character.mob != undefined && character.mob != null )
    return true;

  return false;
};

module.exports.is_npc = is_npc;

