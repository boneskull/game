import isometric.models.item.DynamicModel as DynamicModel;

import src.util as util;

var CharacterModel = Class(DynamicModel, function(supr) {	

	this.init = function(opts) {		
		supr(this, 'init', [opts]);	
		this._speed = 5.0;		
		this._range = opts.range;
		console.log(this._range);
	};

});

exports = CharacterModel;