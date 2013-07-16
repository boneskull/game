import isometric.models.item.DynamicModel as DynamicModel;

import src.util as util;

import src.constants.GameConstants as gameConstants;

import isometric.models.map.Map as Map;
import math.geom.Rect as Rect;
import math.util as mathUtil;

import src.lib.q as q;

import util.underscore as _;

var CharacterModel = Class(DynamicModel, function (supr) {

    this.init = function init (opts) {
        supr(this, 'init', [opts]);
        this._speed = 7.5;
        this._range = opts.range;
        this._gridModel.getMap()._character = this;
        this._finders = [];
    };

    this.drawRange = function drawRange () {

        var i, j,
            tileX = this.getTileX(),
            tileY = this.getTileY(),
            points = [],
            range = this._range,
            r = range,
            y1 = tileY,
            y2 = tileY,
            map = this._gridModel.getMap(),
            w = map.getWidth(),
            h = map.getHeight(),
            point,
            startX = tileX - range,
            startY = tileY - range,
            areaMap,
            pathsFound = 0,
            dfrd = q.defer(),

            conditions = {accept: [
                {
                    layer: 0,
                    type: 'group',
                    groups: [gameConstants.tileGroups.PASSABLE]
                }
            ]};

        while (r >= 0) {
            for (i = tileX - r; i <= tileX + r; i++) {
                if (mathUtil.mod(i, w) === i && mathUtil.mod(y1, h) === y1) {
                    points.push([i, y1]);
                }
            }
            for (i = tileX - r; i <= tileX + r; i++) {
                if (mathUtil.mod(i, w) === i && mathUtil.mod(y2, h) === y2) {
                    points.push([i, y2]);
                }
            }
            r--;
            y1++;
            y2--;
        }

        _._.uniq(points);

        points = points.filter(function (point) {
            return point[0] !== tileX || point[1] !== tileY;
        });

        i = points.length;
        while (i--) {
            point = points[i];
            if (map.acceptRect({x: point[0], y: point[1], w: 1, h: 1}, conditions)) {
                map.drawTile(1, point[0], point[1], gameConstants.tileGroups.CURSORS, 2);
            }
        }

        areaMap = map.getSubmap(startX, startY, range * 2 + 1, range * 2 + 1);
        invalidPoints = [];
        function tryPath(point) {
            return function (path) {
                var i;
                console.log('found path to (' + (point[0]) + ',' + (point[1]) + ')');
                if(path.length > range) {
                    invalidPoints.push(point);
                }
                console.log(path);
                pathsFound++;
                if (pathsFound === points.length) {
                    i = invalidPoints.length;
                    while(i--) {
                        map.drawTile(1, invalidPoints[i][0], invalidPoints[i][1], 0, -1);
                    }
                    dfrd.resolve();
                }
            };
        }

        i = points.length;
        while (i--) {
            point = points[i];
            console.log('from (' + range + ',' + range + ') to (' + (point[0]-startX) + ',' + (point[1]-startY) + ')');
            this._finders.push(this._gridModel.findPathInMap(areaMap, range, range, point[0] - startX, point[1] - startY, {
//            this._finders.push(this._gridModel.findPathInMap(map, tileX, tileY, point[0], point[1], {
                accept: [
                    {
                        layer: 0,
                        type: 'group',
                        groups: [gameConstants.tileGroups.PASSABLE]
                    }
                ]
            }, tryPath(point)));
        }

        return dfrd.promise;
    };

    this.clearRange = function clearRange() {
        this._gridModel.getMap().clearLayer(1);
    };

    this.tick = function (dt) {
        var i;
        if (this._finders.length) {
            i = this._finders.length;
            while (i--) {
                this._finders[i].update();
            }
        }
        return supr(this, 'tick', [dt]);
    }

});

exports = CharacterModel;