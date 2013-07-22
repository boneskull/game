import isometric.models.item.DynamicModel as DynamicModel;
import isometric.models.GridModel as GridModel;

import src.util as util;

import src.constants.GameConstants as gameConstants;

import src.settings.GridSettings as gridSettings;
import src.settings.EditorSettings as editorSettings;
import src.settings.MapSettings as mapSettings;

import math.util as mathUtil;

import src.lib.q as q;
import src.lib.astar as astar;
import src.lib.graph as graph;

import util.underscore as _;

var CharacterModel = Class(DynamicModel, function (supr) {

    this.init = function init (opts) {
        supr(this, 'init', [opts]);
        this._speed = 7.5;
        this._range = opts.range;
        this._gridModel.getMap()._character = this;
    };

    this.drawRange = function drawRange () {

        var path;
        var j;
        var g;
        var grid;
        var i,
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
            conditions = {
                accept: [
                    {
                        layer: 0,
                        type: 'group',
                        groups: [gameConstants.tileGroups.PASSABLE]
                    }
                ]
            };

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

        _.uniq(points);

        points = points.filter(function (point) {
            return point[0] !== tileX || point[1] !== tileY;
        });

        grid = merge([], map.getGrid());
        g = new graph.Graph(grid);
        i = g.nodes.length;
        while (i--) {
            j = g.nodes[i].length;
            while (j--) {
                g.nodes[i][j].type = (function (x, y) {
                    var rect = {x: x, y: y, w: 1, h: 1};
                    return map.acceptRect(rect, conditions) ? graph.GraphNodeType.OPEN : graph.GraphNodeType.WALL;
                })(i, j);
            }
        }

        i = points.length;
        while (i--) {
            point = points[i];
            path = astar.search(g.nodes, g.nodes[tileX][tileY], g.nodes[point[0]][point[1]]);
            if (path.length && path.length <= this._range) {
                map.drawTile(1, point[0], point[1], gameConstants.tileGroups.CURSORS, 2);
            }
        }


    };

    this.clearRange = function clearRange() {
        this._gridModel.getMap().clearLayer(1);
    };

});

exports = CharacterModel;