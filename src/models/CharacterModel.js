import isometric.models.item.DynamicModel as DynamicModel;

import src.util as util;

var CharacterModel = Class(DynamicModel, function(supr) {
	var done = false;
	this.init = function(opts) {
		merge(opts, {visible: true});
		supr(this, 'init', [opts]);	
		this._speed = 5.0;		
		// console.log(this._gridModel.getMap().getTile(this.getTileX(), this.getTileY())[1].index);	
		console.log(this);
		var matrix = util.getAdjacentMatrix(this.getTileX(), this.getTileY());
	};

	this.onUpdateMap = function() {
		console.log(arguments);
	};

	this.tick = function(dt) {		
		var matrix = util.getAdjacentMatrix(this.getTileX(), this.getTileY()),
		i = matrix.length, point;
		while(i-- && !done) {
			// console.log(this._gridModel.getMap().getTile(matrix[i][0], matrix[i][1])[1].group);			
		}


		return supr(this, 'tick', [dt]);
	};


});

exports = CharacterModel;