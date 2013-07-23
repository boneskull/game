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

exports.mod = function mod (m, n) {
    return ((m % n) + n) % n;
};

exports.pointstr = function pointstr(x, y) {
    return '(' + x + ',' + y + ')';
};

exports.distance = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};