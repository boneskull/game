/**
 * Created with PyCharm.
 * User: chiller
 * Date: 7/21/13
 * Time: 10:23 PM
 * To change this template use File | Settings | File Templates.
 */
import src.constants.GameConstants as gameConstants;
import util.underscore as _;
import util.sprintf as sprintf;
import .Weapon as Weapon;
import math.util as mathUtil;
import src.util as util;
import lib.Enum as Enum;

import event.Emitter as Emitter;

var MIN = 8;
var BASE = 10;
var CRIT = 20;
var DEATH = -10;
var states = Enum(
    'ALIVE',
    'DISABLED',
    'DYING',
    'DEAD'
);


exports = Character = Class(Emitter, function () {
    this.init = function (opts) {

        this.klass = JSON.parse(CACHE[sprintf.sprintf('resources/conf/classes/%s.json', opts.klass)])[opts.klass];
        this.level = opts.level || 1;
        this.model = opts.model;
        this.state = states.ALIVE;
        this.weapon = new Weapon({type: 'swords', name: 'Dagger'});
        this._create();

    };
});

Character.prototype._getRandomInt = function _getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Rolls the dice.  Given x dice, it picks rolls x+1 times and
 * returns best x rolls.
 * @param {number} d # of dice to roll
 * @param {number} s # of of sides on dice
 * @param {boolean} nn Instead just roll x times
 * @returns {number} total from rolls
 */
Character.prototype._roll = function _roll(d, s, nn) {
    var totals = [], notNice = !!nn,
        sides = parseInt(s, 10),
        dice = parseInt(d, 10) + (notNice ? 0 : 1);
    while (dice--) {
        totals.push(this._getRandomInt(1, sides));
    }
    totals.sort();
    if (!notNice) {
        totals = totals.slice(1);
    }
    return _.reduce(totals, function (memo, num) {
        return memo + num;
    }, 0);
};

Character.prototype._createAbilities = function _createAbilities() {

    var abilities = gameConstants.abilities,
        i = abilities.length, priority = this.klass.abilityPriority,
        scores = [], o = {};

    while (i--) {
        scores.push(this._roll(3, 6));
    }

    // sort descending numeric
    scores = scores.sort(function (a, b) {
        return b - a;
    }).map(function (score) {
            return Math.max(MIN, score);
        });
    i = priority.length;

    while (i--) {
        o[priority[i]] = scores[i];
    }

    this.abilities = o;

};

Character.prototype._createHP = function _createHP() {
    this.currentHP = this.totalHP = (this.klass.HD + mathUtil.mod(this.abilities.CON, BASE)) + ((this.level - 1) *
        this._roll(1, this.klass.HD));
};

Character.prototype._create = function _create() {
    this._createAbilities();
    this._createHP();
};

Character.prototype.rollMeleeAtk = function () {
    return this._roll(1, 20) + mathUtil.mod(this.abilities.STR, BASE);
};

Character.prototype.rollRangedAtk = function () {
    return this._roll(1, 20) + mathUtil.mod(this.abilities.DEX, BASE);
};

Character.prototype._parseAndRoll = function (s) {
    var match = s.match(/^(\d+)d(\d+)$/);
    return this._roll(match[1], match[2], true);
};

Character.prototype.rollDmg = function () {
    return this._parseAndRoll(this.weapon.dmg);
};

Character.prototype.attack = function (npc) {
    // determine if ranged or melee
    var d = util.distance(npc.getTileX(), npc.getTileY(),
        this.getTileX(), this.getTileY());
    if (d > 1) {
        return this._rangedAttack(npc);
    } else {
        return this._meleeAttack(npc);
    }
};

Character.prototype._rangedAttack = function _rangedAttack (npc) {
    var roll = this.rollRangedAtk() + this._BAB();
    console.log(roll + ' vs ' + npc.abilities.DEX);
    if (roll >= npc.abilities.DEX) {
        return roll;
    }
    return 0;
};

Character.prototype._BAB = function _BAB() {
    return this.level * this.klass.BAB;
};

Character.prototype._meleeAttack = function _meleeAttack (npc) {
    var roll = this.rollMeleeAtk() + this._BAB();
    console.log(roll + ' vs ' + npc.abilities.DEX);
    if (roll >= npc.abilities.DEX) {
        return roll;
    }
    return 0;
};

Character.prototype.damage = function damage(roll) {
    var crit = this.weapon.crit || CRIT, dmg;
    if(roll >= crit) {
        dmg = this.rollDmg() + this.rollDmg();
    }
    else {
        dmg = this.rollDmg();
    }
    return dmg;
};

Character.prototype._setState = function _setState() {
    if (this.currentHP > 0) {
        this.state = states.ALIVE;
    }
    else if (this.currentHP === 0) {
        this.state = states.DISABLED;
    }
    else if (this.currentHP < 0 && this.currentHP > DEATH) {
        this.state = states.DYING;
    }
    else {
        this.state = states.DEAD;
    }
    switch(this.state) {
        case states.DISABLED:
            this.emit('Disabled', 'Status', '[name] is disabled!');
            break;
        case states.DYING:
            this.emit('Dying', 'Status', '[name] is dying!');
            break;
        case states.DEAD:
            this.emit('Dead', 'Status', '[name] joins the decently deceased.');
    }
};

Character.prototype.subtractHP = function subtractHP(hp) {
    this.currentHP -= hp;
    this._setState();
};

Character.prototype.addHP = function addHP(hp) {
    this.currentHP += hp;
    this._setState();
};

Character.prototype.getTileX = function getTileX() {
    return this.model.getTileX();
};

Character.prototype.getTileY = function getTileY() {
    return this.model.getTileY();
};




