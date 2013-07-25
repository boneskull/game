import src.util as util;
import lib.Enum as Enum;
import event.Emitter as Emitter;
import util.sprintf as sprintf;

var spf = sprintf.sprintf;

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
            this.emit('Hit', 'Combat', spf("%s was hit for %d HP! %d HP remaining.", this.defender.name, this.lastDmgRoll, this.defender.currentHP));
            break;
        case states.OUT_OF_RANGE:
            this.emit('OutOfRange', 'Combat', spf('%s is out of range!', this.attacker.name));
            break;
        case states.MISS:
            this.emit('Miss', 'Combat', spf('%s missed terribly!', this.attacker.name));
            break;
        default:
            throw new Error('bad state');
    }

};
