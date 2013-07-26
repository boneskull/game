jsio("import .Character as Character");
jsio("import src.models.NPCModel as NPCModel");
jsio("import src.util as util")

exports = NPC = Class(Character, function (supr) {
    this.modelKlass = NPCModel;
    this.abilityWeight = 0.8;
});

NPC.prototype.beginTurn = function() {
    this.emit('npc:beginTurn', this);
};

NPC.prototype.chooseTarget = function(characters) {
    return characters[util.getRandomInteger(0, characters.length-1)];
};