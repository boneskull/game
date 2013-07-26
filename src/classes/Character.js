jsio("import src.constants.GameConstants as gameConstants");
jsio("import util.underscore as _");
jsio("import util.sprintf as sprintf");
jsio("import .Weapon as Weapon");
jsio("import math.util as mathUtil");
jsio("import src.util as util");
jsio("import lib.Enum as Enum");
jsio("import event.Emitter as Emitter");
jsio("import src.models.CharacterModel as CharacterModel");

/**
 * Sugar for sprintf fn
 * @type {function}
 */
var spf = sprintf.sprintf;

/**
 * Minimum ability # to generate
 * @type {number}
 */
var MIN = 8;

/**
 * Base ability #
 * @type {number}
 */
var BASE = 10;

/**
 * Default critical roll
 * @type {number}
 */
var CRIT = 20;

/**
 * At what point a character dies
 * @type {number}
 */
var DEATH = -10;

/**
 * Possible character states
 * @type {*}
 */
var states = Enum(
    'ALIVE',
    'DISABLED',
    'DYING',
    'DEAD'
);

var names = JSON.parse(CACHE['resources/names.json']);

/**
 * Represents a user-controller Character
 * @type {*}
 */
exports = Character = Class(Emitter, function (supr) {

    this.modelKlass = CharacterModel;
    this.abilityWeight = 1.0;

    this.init = function (opts) {

        supr(this, 'init', [opts]);

        this._opts = opts;

        this.klass = JSON.parse(CACHE[spf('resources/conf/classes/%s.json',
            opts.klass)])[opts.klass];
        this.klassName = opts.klass;

        this.level = opts.level || 1;
        this.status = {
            state: states.ALIVE
        };
        this.weapon = new Weapon({type: 'swords', name: 'Dagger'});

        this._setupTransitions();

        this.status.watch('state', bind(this, '_onStateChange'));

        this._create();
        this._createModel();
    };

});

/**
 * Sets up state transition emissions
 * @private
 */
Character.prototype._setupTransitions = function _setupTransitions() {

    var t = {}, emit = bind(this, 'emit'), name = this.name,
        disabled = function disabled() {
            emit('Disabled', 'Status', spf('%s is disabled!', name));
        },
        dying = function dying() {
            emit('Dying', 'Status', spf('%s is dying!', name));
        },
        dead = function dead() {
            emit('Dead', 'Status', spf('%s joins the decently deceased.', name));
        };

    if (util.isDefined(this.transitions)) {
        return;
    }

    t[states.ALIVE] = {};
    t[states.ALIVE][states.DISABLED] = disabled;
    t[states.ALIVE][states.DYING] = dying;
    t[states.ALIVE][states.DEAD] = dead;

    t[states.DISABLED] = {};
    t[states.DISABLED][states.ALIVE] = function () {
        emit('Alive', 'Status', spf('%s is back on his/her feet!', name));
    };
    t[states.DISABLED][states.DYING] = dying;
    t[states.DISABLED][states.DEAD] = dead;

    t[states.DYING] = {};
    t[states.DYING][states.ALIVE] = function () {
        emit('Alive', 'Status', spf('%s is back from the brink of death!', name));
    };
    t[states.DYING][states.DISABLED] = function () {
        emit('Disabled', 'Status', spf('%s has been upgraded to serious condition.', name));
    };
    t[states.DYING][states.DEAD] = dead;

    this._transitions = t;
};

/**
 * this.status.state handler
 * @param prop 'state' for all intents and purposes
 * @param oldState Old state
 * @param newState New state
 * @returns {number} New state
 * @private
 */
Character.prototype._onStateChange = function _onStateChange (prop, oldState, newState) {
    if (newState !== oldState && util.isDefined(oldState)) {
        this._transitions[oldState][newState]();
    }
    return newState;
};

/**
 * Computes modifier for a particular ability
 * @param {string} ability Ability to compute modifier for
 * @returns {number} Modifier
 * @private
 */
Character.prototype._mod = function (ability) {
    ability = ability.toUpperCase();
    if (!util.isDefined(this.abilities[ability])) {
        throw new Error(sprintf('cannot find ability "%s"', ability));
    }
    return mathUtil.mod(this.abilities[ability], BASE);
};

/**
 * Creates a model object based on modelKlass, via createModelCB,
 * puts on grid, makes visible
 * @param opts Options to pass to the model instance
 * @private
 */
Character.prototype._createModel = function _createModel () {
    var opts = this._opts;
    this.model = opts.createModelCB(this.modelKlass, {
        tileX: opts.tileX,
        tileY: opts.tileY,
        visible: true,
        item: opts.klass,
        range: this.klass.range,
        modelListCB: opts.modelListCB,
        conditions: {
            accept: [
                {
                    layer: 0,
                    type: 'group',
                    groups: [gameConstants.tileGroups.PASSABLE]
                }
            ]
        }
    }, opts.layer);
    this.model.on('characterModel:attack', bind(this.model, 'onAttack'))
        .on('characterModel:defense', bind(this, 'onDefense'));
};

Character.prototype.onDefense = function(attacker) {
    console.log(spf("%s is being attacked by %s", this.name, attacker.name));
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
        totals.push(util.getRandomInt(1, sides));
    }
    totals.sort();
    if (!notNice) {
        totals = totals.slice(1);
    }
    return _.reduce(totals, function (memo, num) {
        return memo + num;
    }, 0);
};

/**
 * Rolls the character based on ability priority.
 * @private
 */
Character.prototype._createAbilities = function _createAbilities() {

    var abilities = gameConstants.abilities,
        i = abilities.length, priority = this.klass.abilityPriority,
        abilityWeight = this.abilityWeight,
        scores = [], o = {};

    while (i--) {
        scores.push(this._roll(3, 6));
    }

    // sort descending numeric
    scores = scores.sort(function (a, b) {
        return b - a;
    }).map(function (score) {
            return Math.floor(Math.max(MIN, score) * abilityWeight);
        });
    i = priority.length;

    while (i--) {
        o[priority[i]] = scores[i];
    }

    this.abilities = o;

};

/**
 * Creates total/current HP value
 * @private
 */
Character.prototype._createHP = function _createHP() {
    this.currentHP = this.totalHP = (this.klass.HD + this._mod('con')) +
        ((this.level - 1) * this._roll(1, this.klass.HD));
};

/**
 * Creates the character; calls _createAbilities and _createHP
 * @private
 */
Character.prototype._create = function _create() {
    this._createAbilities();
    this._createHP();
    this._pickName();
};

/**
 * Chooses a name at random.
 * @private
 */
Character.prototype._pickName = function () {
    this.name = util.capitalizeName(names[util.getRandomInt(0, names.length)]);
};

/**
 * Rolls a melee attack (str)
 * @returns {number} Roll
 */
Character.prototype.rollMeleeAtk = function rollMeleeAtk() {
    return this._roll(1, 20) + this._mod('str');
};

/**
 * Rolls a ranged attack (dex)
 * @returns {number} Roll
 */
Character.prototype.rollRangedAtk = function rollRangedAtk() {
    return this._roll(1, 20) + this._mod('dex');
};

/**
 * Parses a string like 1d20 and makes appropriate roll(s)
 * @param s Dice string
 * @returns {number} Roll(s)
 * @private
 */
Character.prototype._parseAndRoll = function _parseAndRoll(s) {
    var match = s.match(/^(\d+)d(\d+)$/);
    return this._roll(match[1], match[2], true);
};

/**
 * Rolls for damage based on weapon damage
 * @returns {number}
 */
Character.prototype.rollDMG = function rollDMG() {
    return this._parseAndRoll(this.weapon.dmg);
};

/**
 * Makes an attack (hit) roll based on distance
 * @param npc NPC to attack
 * @returns {*}
 */
Character.prototype.attack = function attack(npc) {
    // determine if ranged or melee
    var dist = util.distance(npc.getTileX(), npc.getTileY(),
        this.getTileX(), this.getTileY());
    return dist > 1 ? this._rangedAttack(npc) : this._meleeAttack(npc);
};

/**
 * Returns base attack bonus
 * @returns {number} Base attack bonus
 * @private
 */
Character.prototype._BAB = function _BAB() {
    return this.level * this.klass.BAB;
};

/**
 * Whether or not the attack (hit) succeeded
 * @param npc NPC to attack
 * @param roll Attack roll
 * @returns {number} Roll; 0 if miss
 * @private
 */
Character.prototype._attackSuccess = function (npc, roll) {
    return roll >= npc.abilities.DEX ? roll : 0;
}

/**
 * Makes a ranged attack roll and returns roll
 * @param npc NPC to attack
 * @returns {number} Roll
 * @private
 */
Character.prototype._rangedAttack = function _rangedAttack(npc) {
    var roll = this.rollRangedAtk() + this._BAB();
    return this._attackSuccess(npc, roll);
};

/**
 * Makes a melee attack roll and returns roll
 * @param npc NPC to attack
 * @returns {number} Roll
 * @private
 */
Character.prototype._meleeAttack = function _meleeAttack(npc) {
    var roll = this.rollMeleeAtk() + this._BAB();
    return this._attackSuccess(npc, roll);
};

/**
 * Rolls for damage based on crit status or not
 * @param roll Roll to hit
 * @returns {number} Damage roll
 */
Character.prototype.damage = function damage(roll) {
    var crit = this.weapon.crit || CRIT, dmg;
    return roll >= crit ? this.rollDMG() + this.rollDMG() : this.rollDMG();
};

/**
 * Sets the current character's state
 * @private
 */
Character.prototype._setState = function _setState() {
    if (this.currentHP > 0) {
        this.status.state = states.ALIVE;
    }
    else if (this.currentHP === 0) {
        this.status.state = states.DISABLED;
    }
    else if (this.currentHP < 0 && this.currentHP > DEATH) {
        this.status.state = states.DYING;
    }
    else {
        this.status.state = states.DEAD;
    }
};

/**
 * Subtracts some HP from the character and sets new state
 * @param hp
 */
Character.prototype.subtractHP = function subtractHP(hp) {
    this.currentHP -= hp;
    this._setState();
};

/**
 * Adds some HP to the character and sets new state
 * @param hp
 */
Character.prototype.addHP = function addHP(hp) {
    this.currentHP += hp;
    this._setState();
};

/**
 * Gets tile X from model
 * @returns {number} x
 */
Character.prototype.getTileX = function getTileX() {
    return this.model.getTileX();
};

/**
 * Gets tile Y from model
 * @returns {number} y
 */
Character.prototype.getTileY = function getTileY() {
    return this.model.getTileY();
};

/**
 * Rolls for initiative
 * @returns {number}
 */
Character.prototype.rollInitiative = function () {
    return this._roll(1, 20) + this._mod('dex');
};

Character.prototype.beginTurn = function() {
    this.emit('character:beginTurn');
};

