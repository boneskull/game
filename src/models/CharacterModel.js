import isometric.models.item.DynamicModel as DynamicModel;

import src.util as util;

import src.constants.GameConstants as gameConstants;

var CharacterModel = Class(DynamicModel, function(supr) {

	this.init = function(opts) {
		supr(this, 'init', [opts]);
		this._speed = 5.0;
		this._range = opts.range;
		console.log(this._range);
	};

	this.drawRange = function() {
		var tileX = this.getTileX(),
			tileY = this.getTileY(),
			x = tileX,
			y1 = tileY,
			y2 = tileY,
			r = this._range,
			points = [],
			that = this;

		while (r >= 0) {
			for (i = x - r; i <= x + r; i++) {
				points.push([i, y1]);
			}
			for (i = x - r; i <= x + r; i++) {
				points.push([i, y2]);
			}
			r--;
			y1++;
			y2--;
		}

		points = points.filter(function(point) {
			return that._gridModel.getMap().getTile(point[0], point[1])[0].group === gameConstants.tileGroups.PASSABLE;
		});

		var i = points.length;
		while (i--) {
			this._gridModel.getMap().putItem('range', points[i][0], points[i][1]);
		}


	};

});

exports = CharacterModel;