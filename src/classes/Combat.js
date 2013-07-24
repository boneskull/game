import src.util as util;
import lib.Enum as Enum;
import event.Emitter as Emitter;

var states = Enum(
    'OUT_OF_RANGE',
    'MISS',
    'ATTACKING',
    'HIT',
    'READY'
)

exports = Combat = Class(Emitter, function (supr) {
    this.init = function (attacker, defender) {
        supr(this, 'init', [attacker, defender]);
        this.attacker = attacker;
        this.defender = defender;
        this.state = states.READY;

    };
});

Combat.prototype.begin = function begin() {
    var defender = this.defender, attacker = this.attacker,
        distance = util.distance(attacker.getTileX(), attacker.getTileY(),
            defender.getTileX(), defender.getTileY()),
        atkRoll,
        dmgRoll = 0;

    this.state = states.ATTACKING;
    this.distance = distance;

    if (distance > attacker.weapon.range) {
        this.lastDmgRoll = dmgRoll;
        this.state = states.OUT_OF_RANGE;

        return dmgRoll;
    }

    atkRoll = attacker.attack(defender);
    if (atkRoll > 0) {
        dmgRoll = attacker.damage(atkRoll);
        this.state = states.HIT;
    } else {
        this.state = states.MISS;
    }

    this.lastDmgRoll = dmgRoll;
    return this.lastDmgRoll;
};

Combat.prototype.end = function () {
    switch(this.state) {
        case states.HIT:
            this.defender.subtractHP(this.lastDmgRoll);
            this.emit('Hit', 'Combat', "Hit for " + this.lastDmgRoll + " hp! " + this.defender.currentHP + " HP left");
            break;
        case states.OUT_OF_RANGE:
            this.emit('OutOfRange', 'Combat', 'Out of range!');
            break;
        case states.MISS:
            this.emit('Miss', 'Combat', 'You missed terribly!');
            break;
        default:
            throw new Error('bad state');
    }

};
