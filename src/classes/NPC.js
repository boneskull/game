jsio("import .Character as Character");
jsio("import src.models.NPCModel as NPCModel");
jsio("import src.util as util")

exports = NPC = Class(Character, function () {
    this.modelKlass = NPCModel;
    this.abilityWeight = 0.8;
});

NPC.prototype.beginTurn = function () {
    this.emit('npc:beginTurn', this);
};

NPC.prototype.chooseTarget = function (characters) {
    this._currentTarget = util.choose(characters);
};

NPC.prototype.attackAndOrMove = function() {
    var targetX = this._currentTarget.model.getTileX(),
        targetY = this._currentTarget.model.getTileY();


};