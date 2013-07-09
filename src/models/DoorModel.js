import isometric.models.item.SpawnerModel as SpawnerModel;

var DoorModel = Class(SpawnerModel, function(supr) {
	this.init = function(opts) {
		merge(opts, {visible: true});
		supr(this, 'init', [opts]);		
		this._target = opts.target;	
	};

});

DoorModel.prototype.getTarget = function() {
	return this._target;
};

exports = DoorModel;