import isometric.models.item.DynamicModel as DynamicModel;

import math.geom.Rect as Rect;

import src.util as util;

import src.views.BattleView as BattleView;

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
		that = this;

	function tryPath(i) {
		var paths = [],
			path;

		return function(path) {
			paths.push(path);
			console.log("found path " + (i+1) + "/8");

			if (i === matrix.length - 1) {
				paths.sort(function(a, b) {
					return a.length < b.length;
				}).filter(function(path) {
					return path.length;
				});
				if(!paths.length) {
					console.log('uh oh, no path');
					return;
				}
				path = paths[0];				
				that._destX = (x === undefined) ? 0.5 : x;
				that._destY = (y === undefined) ? 0.5 : y;

				that._reachedX = false;
				that._reachedY = false;
				that._destTileX = matrix[i][0];
				that._destTileY = matrix[i][1];
				that.setPath(path);

			} else {

				that._gridModel.findPath(that.getTileX(), that.getTileY(), matrix[i + 1][0], matrix[i + 1][1],
					that._conditions, tryPath(i + 1));
			}
		};
	}

	this._gridModel.findPath(this.getTileX(), this.getTileY(), matrix[0][0], matrix[0][1], this._conditions,
		tryPath(0));


};

exports = MonsterModel;