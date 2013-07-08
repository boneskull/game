import isometric.models.item.DynamicModel as DynamicModel;

var CharacterModel = Class(DynamicModel, function(supr) {
	this.init = function(opts) {
		merge(opts, {visible: true});
		supr(this, 'init', [opts]);	
		this._speed = 5.0;			
	};


});

exports = CharacterModel;