import src.constants.GameConstants as gameConstants;
import string.pad as pad;
import util.sprintf as sprintf;

var TileGroup = Class(Object, function() {
	this.init = function(o) {
		merge(this, o);
		this.group = gameConstants.tileGroups[this.groupName];
		this.images = this._computeImages();
	};
});

TileGroup.prototype._computeImages = function() {
	var i = this.indexEnd,
		images = [];
	while (i-- && i >= this.indexBegin) {
		images.push({
			index: i,
			url: sprintf.sprintf('%s/%s.%s', this.path, pad(i, 4, '0'), this.extension)
		})
	}
	return images;
};

exports = TileGroup;