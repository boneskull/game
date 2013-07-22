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

var MIN = 8;
var BASE = 10;

exports = Class(function() {
    this.init = function(opts) {

        this.klass = JSON.parse(CACHE[sprintf.sprintf('resources/conf/classes/%s.json', opts.klass)])[opts.klass];
        this.level = opts.level || 2;

        this._create();

    };

    this._getRandomInt = function _getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * Rolls the dice.  Given x dice, it picks the best x-1 rolls.
     * @param dice # of dice to roll
     * @param sides # of of sides on dice
     * @returns {number} total from rolls
     */
    this._roll = function _roll(dice, sides) {
        var totals = [],
            sides = parseInt(sides, 10),
            dice = parseInt(dice, 10) + 1;
        while (dice--) {
            totals.push(this._getRandomInt(1, sides));
        }
        totals.sort();
        totals = totals.slice(1);
        return _.reduce(totals, function (memo, num) {
            return memo + num;
        }, 0);
    };

    this._createAbilities = function _createAbilities() {

        var abilities = gameConstants.abilities,
            i = abilities.length, priority = this.klass.abilityPriority,
            scores = [], o = {};

        while(i--) {
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

    this._createHP = function _createHP() {
        var baseHP = parseInt(this.klass.baseHP, 10);
        this.currentHP = this.totalHP = (baseHP + this.abilities.CON % BASE) + ((this.level - 1) *
            this._roll(1, this.klass.HD));
    };

    this._create = function _create() {
        this._createAbilities();
        this._createHP();
    };

});