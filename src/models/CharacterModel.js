jsio("import isometric.models.item.DynamicModel as DynamicModel");

jsio("import math.util as mathUtil");

jsio("import util.underscore as _");

jsio("import src.lib.astar as astar");
jsio("import src.lib.graph as graph");

jsio("import src.util as util");

jsio("import src.constants.GameConstants as gameConstants");

var MODEL_LAYER = 3;
var RANGE_LAYER = 2;
var RANGE_INDEX = 2;
var CLUTTER_LAYER = 1; // TODO: not sure what to do with clutter currently
var GROUND_LAYER = 0;
var SPEED = 7.5;

var CharacterModel = Class(DynamicModel, function (supr) {

    this.init = function init(opts) {
        supr(this, 'init', [opts]);
        this._speed = SPEED;
        this._range = opts.range;
        this._modelListCB = opts.modelListCB;
    };

    this.onAttack = function(selection, attacker) {
        if (this.getTileX() === selection.rect.x && this.getTileY() === selection.rect.y) {
            this.emit('characterModel:defense', attacker);
        }
    };

    this.drawRange = function drawRange() {

        var path,
            y,
            g,
            grid,
            x,
            i,
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
            models = this._modelListCB();

        // draw a diamond of possible points
        while (r >= 0) {
            for (x = tileX - r; x <= tileX + r; x++) {
                if (mathUtil.mod(x, w) === x && mathUtil.mod(y1, h) === y1) {
                    points.push([x, y1]);
                }
            }
            for (x = tileX - r; x <= tileX + r; x++) {
                if (mathUtil.mod(x, w) === x && mathUtil.mod(y2, h) === y2) {
                    points.push([x, y2]);
                }
            }
            r--;
            y1++;
            y2--;
        }

        // the algorithm above will create an double "line" so remove it
        _.uniq(points);

        // toss out any tile that already has a dynamic model on it, including this one.
        points = points.filter(function (point) {
            var i = models.length;
            while (i--) {
                if (models[i].layer === MODEL_LAYER && models[i].model.getTileX() === point[0] &&
                    models[i].model.getTileY() === point[1]) {
                    return false;
                }
            }
            return true;
        });

        // prepare the graph for pathfinding by designating impassable tiles as WALLs
        grid = merge([], map.getGrid());
        g = new graph.Graph(grid);
        x = g.nodes.length;
        while (x--) {
            y = g.nodes[x].length;
            while (y--) {
                g.nodes[x][y].type = (function (x, y) {
                    var rect = {x: x, y: y, w: 1, h: 1};
                    return map.acceptRect(rect, {
                        accept: [
                            {
                                layer: GROUND_LAYER,
                                type: 'group',
                                groups: [gameConstants.tileGroups.PASSABLE]
                            }
                        ]}) ? graph.GraphNodeType.OPEN : graph.GraphNodeType.WALL;
                })(x, y);
            }
        }

        // find paths to all remaining points, and draw valid target tiles on the map.
        i = points.length;
        while (i--) {
            point = points[i];
            path = astar.search(g.nodes, g.nodes[tileX][tileY], g.nodes[point[0]][point[1]]);
            // no path means no path found; a path longer than the range is out of reach
            if (path.length && path.length <= this._range) {
                map.drawTile(RANGE_LAYER, point[0], point[1], gameConstants.tileGroups.CURSORS,
                    RANGE_INDEX);
            }
        }
    };

    this.clearRange = function clearRange() {
        this._gridModel.getMap().clearLayer(RANGE_LAYER);
    };

});

exports = CharacterModel;