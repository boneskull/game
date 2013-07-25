import util.sprintf as sprintf;

var spf = sprintf.sprintf;

exports.noop = function () {
};

exports.getAdjacentMatrix = function (destTileX, destTileY) {
    return [
        [destTileX - 1, destTileY - 1],
        [destTileX - 1, destTileY],
        [destTileX - 1, destTileY + 1],
        [destTileX, destTileY - 1],
        [destTileX, destTileY + 1],
        [destTileX + 1, destTileY - 1],
        [destTileX + 1, destTileY],
        [destTileX + 1, destTileY + 1]
    ];
};

exports.mod = function mod(m, n) {
    return ((m % n) + n) % n;
};

exports.pointstr = function pointstr(x, y) {
    return '(' + x + ',' + y + ')';
};

exports.distance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

exports.isDefined = function (o) {
    return typeof o !== 'undefined';
};

exports.isUndefined = function (o) {
    return !exports.isDefined(o);
};

exports.capitalizeName = function (name) {

    function capitalize(s) {
        return spf('%s%s', s.charAt(0).toUpperCase(), s.substring(1).toLowerCase());
    }

    if (name.substring(0, 2).toUpperCase() === 'MC') {
        return spf('Mc%s', capitalize(name.substring(2)));
    }

    return capitalize(name);

};

/**
 * Gets a random integer
 * @param min Lowest possible integer
 * @param max Highest possible integer
 * @returns {number} The random integer in question
 */
exports.getRandomInt = function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
