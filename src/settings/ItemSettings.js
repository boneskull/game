import util.sprintf as sprintf;

exports = {
	door: {
		width: 82,
		height: 82,
		offsetX: -41,
		offsetY: -82,
		images: ['resources/images/change_zones/0007.gif']
	},
	monster: {
		width: 82,
		height: 82,
		offsetX: -41,
		offsetY: -82,
		images: ['resources/images/npc/0024.gif']
	}
};

var classes = JSON.parse(CACHE['resources/conf/classIndex.json']),
	i = classes.length,
	cs = [],
	klass;
while (i--) {
	klass = JSON.parse(CACHE[sprintf.sprintf('resources/conf/classes/%s.json', classes[i])]);
	merge(exports, klass);
}