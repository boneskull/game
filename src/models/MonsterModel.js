import isometric.models.item.DynamicModel as DynamicModel;

import util.underscore as underscore;

import math.geom.Rect as Rect;

import src.util as util;

import src.views.BattleView as BattleView;

import src.constants.GameConstants as gameConstants;

var MonsterModel = Class(DynamicModel, function(supr) {
	this.init = function(opts) {
		var target;
		merge(opts, {
			visible: true
		});
		supr(this, 'init', [opts]);
		this._speed = 5.0;
		target = this._opts.spawner.getTarget();
		this.moveAdjacent(target.getTileX(), target.getTileY());
	};

	this.onReachTarget = function() {
		this.emit('Battle');
	};
});

MonsterModel.prototype.moveAdjacent = function(destTileX, destTileY, x, y) {
	var matrix = util.getAdjacentMatrix(destTileX, destTileY),
		that = this,
		gridModel = this._gridModel,

		i,
		distance = 0,
		minDistance = 0,
		maxDistance = 0,
		closestTile, furthestTile, min, max, paths = [];

	function tryPath(point) {
		return function(path) {
			paths.push(path);
			if (paths.length === 2) {
				paths.sort(function(a, b) {
					return a.length < b.length;
				});
				paths = paths.filter(function(path) {
					return !!path.length;
				});
				if (!paths.length) {
					console.log('no path to hero');
					return;
				}
				that._destTileX = point[0];
				that._destTileY = point[1];
				that._destX = (x === undefined) ? 0.5 : x;
				that._destY = (y === undefined) ? 0.5 : y;

				that._reachedX = false;
				that._reachedY = false;

				that.setPath(paths[0]);
			}
		};

	}

	// get only passable tiles
	matrix.filter(function(point) {
		return gridModel.getMap().getTile(point[0], point[1]).group ===
			gameConstants.tileGroups.PASSABLE;
	});

	i = matrix.length;

	// get closest tile
	while (i--) {
		distance = Math.pow(this.getTileX() - matrix[i][0], 2) + Math.pow(this.getTileY() - matrix[i][1], 2);
		min = Math.min(distance, minDistance);
		max = Math.max(distance, maxDistance);
		if (min <= minDistance) {
			minDistance = min;
			closestTile = matrix[i];

		}
		if (max >= maxDistance) {
			maxDistance = max;
			furthestTile = matrix[i];
		}
	}

	gridModel.findPath(this.getTileX(), this.getTileY(), closestTile[0], closestTile[1], this._conditions,
		tryPath(closestTile));
	gridModel.findPath(this.getTileX(), this.getTileY(), furthestTile[0], furthestTile[1], this._conditions,
		tryPath(furthestTile));

};

exports = MonsterModel;