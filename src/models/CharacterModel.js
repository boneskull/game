import isometric.models.item.DynamicModel as DynamicModel;

import src.util as util;

import src.constants.GameConstants as gameConstants;

import isometric.models.map.Map as Map;
import math.geom.Rect as Rect;
import math.util as mathUtil;

import src.lib.q as q;

var CharacterModel = Class(DynamicModel, function (supr) {

    this.init = function init (opts) {
        supr(this, 'init', [opts]);
        this._speed = 7.5;
        this._range = opts.range;
        this._gridModel.getMap()._character = this;
    };

    this.drawRange = function drawRange () {

        var i, j,
            tileX = this.getTileX(),
            tileY = this.getTileY(),
            points = [],
            range = this._range,
            map = this._gridModel.getMap(),
            w = map.getWidth(),
            h = map.getHeight(),
            startX = tileX - range,
            startY = tileY - range,
            endX = tileX + range,
            endY = tileY + range,
            areaMap,
            pathsFound = 0,
            dfrd = q.defer();

            conditions = {accept: [
                        {
                            layer: 0,
                            type: 'group',
                            groups: [gameConstants.tileGroups.PASSABLE]
                        }
                    ]};
            character = this;

        for (i = startX; i <= endX; i++) {
            for (j = startY; j <= endY; j++) {
                if (mathUtil.mod(i, w) === i && mathUtil.mod(j, h)) {
                    points.push([i, j]);
                }
            }
        }

        areaMap = map.getSubmap(startX, startY, range * 2, range * 2);

        points = points.filter(function (point) {
            if( point[0] === tileX && point[1] === tileY) {
                return false;
            }
            return areaMap.acceptRect({x: point[0], y: point[1], w: 1, h: 1}, conditions);
        });

        i = points.length;
        function tryPath(point) {
            return function (path) {
                if (path.length && path.length <= range) {
                    map.drawTile(1, point[0], point[1], gameConstants.tileGroups.CURSORS, 2);
                }
                pathsFound++;
                if (pathsFound === points.length) {
                    dfrd.resolve();
                }
            };
        }

        while (i--) {
            //this._opts.tileX, this._opts.tileY, destTileX, destTileY, this._conditions, bind(this, 'onFindPath')
            this._gridModel.findPath(tileX, tileY, points[i][0], points[i][1], conditions, tryPath(points[i]));

        }

        return dfrd.promise;
    };

    this.clearRange = function clearRange() {
        this._gridModel.getMap().clearLayer(1);
    };

});

exports = CharacterModel;